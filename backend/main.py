from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
from prophet import Prophet
from prophet.diagnostics import cross_validation
from sklearn.metrics import mean_absolute_percentage_error
from prophet.make_holidays import make_holidays_df
import pandas as pd
import re
import traceback

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Load dan Siapkan Data ===
# df = pd.read_csv("ispu_clean.csv")
# df["Waktu"] = pd.to_datetime(df["Waktu"])
# pollutants = ["PM10", "PM25", "SO2", "CO", "O3", "NO2", "HC"]

# for col in pollutants:
#     df[col] = pd.to_numeric(df[col], errors="coerce")

# df = df.resample("D", on="Waktu").mean().reset_index()

# === Load dan Siapkan Data ===
df = pd.read_csv("ispu_clean.csv")
df["Waktu"] = pd.to_datetime(df["Waktu"])
pollutants = ["PM10", "PM25", "SO2", "CO", "O3", "NO2", "HC"]

for col in pollutants:
    df[col] = pd.to_numeric(df[col], errors="coerce")

# Resample ke data harian
df = df.resample("D", on="Waktu").mean().reset_index()

# === Split Train & Test Berdasarkan Tanggal ===
train_start = "2022-08-01"
train_end = "2024-01-08"
test_start = "2024-01-09"
test_end = "2024-05-20"

train_df = df[(df["Waktu"] >= train_start) & (df["Waktu"] <= train_end)].copy()
test_df = df[(df["Waktu"] >= test_start) & (df["Waktu"] <= test_end)].copy()

# === Cache Model ===
model_cache = {}

# === Helper Functions ===
# def get_or_train_model(df, column, years=[2022, 2023, 2024, 2025, 2026]):
#     """Train Prophet model for given pollutant (cached)."""
#     if column not in model_cache:
#         model = Prophet(
#             yearly_seasonality=True,
#             weekly_seasonality=False,
#             daily_seasonality=False,
#             holidays=make_holidays_df(year_list=years, country="ID"),
#         )
#         model.add_seasonality(name="monthly", period=30.5, fourier_order=5)
#         data = df[["Waktu", column]].rename(columns={"Waktu": "ds", column: "y"})
#         model.fit(data)
#         model_cache[column] = model
#     return model_cache[column]

def get_or_train_model(train_df, column, years=[2022, 2023, 2024, 2025, 2026]):
    if column not in model_cache:
        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=False,
            daily_seasonality=False,
            holidays=make_holidays_df(year_list=years, country="ID"),
        )
        model.add_seasonality(name="monthly", period=30.5, fourier_order=5)
        data = train_df[["Waktu", column]].rename(columns={"Waktu": "ds", column: "y"})
        model.fit(data)
        model_cache[column] = model
    return model_cache[column]


# def get_prediction_for_date(model, date_obj, horizon=90):
#     """Generate forecast and return specific date prediction."""
#     forecast = model.predict(model.make_future_dataframe(periods=horizon))
#     forecast["ds"] = pd.to_datetime(forecast["ds"]).dt.date
#     return forecast[forecast["ds"] == date_obj]

def get_prediction_for_date(model, date_obj, train_df, test_end, horizon=180):
    # Hitung berapa hari ke depan dari data latih terakhir
    last_train_date = train_df["Waktu"].max().date()
    days_ahead = (test_end - last_train_date).days

    # Pastikan horizon cukup panjang untuk mencakup tanggal uji
    forecast = model.predict(model.make_future_dataframe(periods=max(days_ahead, horizon)))
    forecast["ds"] = pd.to_datetime(forecast["ds"]).dt.date

    # Ambil prediksi hanya untuk tanggal yang diminta
    return forecast[forecast["ds"] == date_obj]

def build_forecast_df(df, column, days_ahead=7):
    """Generate forecast for next N days."""
    model = get_or_train_model(df, column)
    forecast = model.predict(model.make_future_dataframe(periods=90))
    forecast["ds"] = pd.to_datetime(forecast["ds"]).dt.date
    forecast = forecast[forecast["ds"] >= datetime.now().date()].head(days_ahead)
    return forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]]


# === ROUTES ===
@app.get("/api/v1/air-quality")
def get_air_quality():
    try:
        current_date = datetime.now().date()
        results = {}

        for p in pollutants:
            model = get_or_train_model(train_df, p)
            # pred = get_prediction_for_date(model, current_date)
            pred = get_prediction_for_date(model, current_date, train_df, datetime.strptime(test_end, "%Y-%m-%d").date())

            if not pred.empty:
                results[p] = {
                    "prediction": int(pred["yhat"].iloc[0]),
                    "prediction_lower": int(pred["yhat_lower"].iloc[0]),
                    "prediction_upper": int(pred["yhat_upper"].iloc[0]),
                    "timestamp": current_date.isoformat(),
                }
            else:
                results[p] = {k: None for k in ["prediction", "prediction_lower", "prediction_upper"]}
                results[p]["timestamp"] = current_date.isoformat()

        return JSONResponse(content=results)

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.get("/api/v1/forecast")
def get_forecast():
    try:
        result = {}
        for p in pollutants:
            forecast = build_forecast_df(df, p)
            forecast["ds"] = forecast["ds"].astype(str)
            result[p] = forecast.round().astype(int).to_dict(orient="records")
        return JSONResponse(content=result)
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.get("/api/v1/predict/{date}")
def predict(date: str):
    try:
        if not re.match(r"^\d{4}-\d{2}-\d{2}$", date):
            return JSONResponse({"error": "Invalid date format, expected YYYY-MM-DD"}, 400)

        date_obj = datetime.strptime(date, "%Y-%m-%d").date()
        predictions = []

        for p in pollutants:
            model = get_or_train_model(train_df, p)
            # pred = get_prediction_for_date(model, date_obj)
            pred = get_prediction_for_date(model, date_obj, train_df, datetime.strptime(test_end, "%Y-%m-%d").date())

            predictions.append({
                "pollutant": p,
                "date": date,
                "prediction": float(pred["yhat"].iloc[0]) if not pred.empty else None,
                "prediction_lower": float(pred["yhat_lower"].iloc[0]) if not pred.empty else None,
                "prediction_upper": float(pred["yhat_upper"].iloc[0]) if not pred.empty else None,
            })

        return JSONResponse(content=predictions)

    except Exception as e:
        traceback.print_exc()
        return JSONResponse({"error": str(e)}, 500)


@app.get("/api/v1/mape")
def get_all_mape():
    results = {}
    for p in pollutants:
        try:
            model = get_or_train_model(df, p, years=[2022, 2023, 2024, 2025])
            df_cv = cross_validation(model, initial="180 days", period="180 days", horizon="365 days")
            mape = mean_absolute_percentage_error(df_cv["y"], df_cv["yhat"])
            results[p] = f"{(100 - mape):.2f}%"
        except Exception as e:
            traceback.print_exc()
            results[p] = {"error": str(e)}
    return JSONResponse(content=results)


# @app.get("/api/data")
# def get_csv_data():
#     return JSONResponse(content=df.to_dict(orient="records"))
@app.get("/api/data")
def get_csv_data(limit: int = 100):
    """
    Menampilkan data ISPU dalam format JSON.
    Parameter opsional `limit` untuk membatasi jumlah data (default 100 baris).
    """
    try:
        data = df.copy()

        # Ubah kolom waktu ke format string
        data["Waktu"] = data["Waktu"].dt.strftime("%Y-%m-%d")

        # Bulatkan nilai numerik
        for col in pollutants:
            data[col] = data[col].round(2)

        # Ganti NaN, inf, -inf dengan None agar JSON valid
        data = data.replace([float("inf"), float("-inf")], pd.NA)
        data = data.where(pd.notnull(data), None)

        # Batasi jumlah baris
        if limit:
            data = data.head(limit)

        return JSONResponse(content=data.to_dict(orient="records"))

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)
