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

# Load dan siapkan data
df = pd.read_csv("ispu_clean.csv")
df["Waktu"] = pd.to_datetime(df["Waktu"])
pollutants = ["PM10", "PM25", "SO2", "CO", "O3", "NO2", "HC"]

for col in pollutants:
    df[col] = pd.to_numeric(df[col], errors="coerce")

df.set_index("Waktu", inplace=True)
df = df.resample("h").mean().reset_index()

model_cache = {}


def model(data, column):
    if column not in model_cache:
        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            holidays=make_holidays_df(
                year_list=[2022, 2023, 2024, 2025, 2026], country="ID"
            ),
        )

        # Preprocess the data
        data = df[["Waktu", column]].rename(columns={"Waktu": "ds", column: "y"})

        # Add custom seasonality
        model.add_seasonality(name="weekly", period=15, fourier_order=5)

        model.fit(data)
        model_cache[column] = model

    model = model_cache[column]
    future = model.make_future_dataframe(periods=730)

    forecast = model.predict(future)
    return forecast


def model_for_mape(data, column):
    if column not in model_cache:
        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            holidays=make_holidays_df(year_list=[2022, 2023, 2024, 2025], country="ID"),
        )
        data = data[["Waktu", column]].rename(columns={"Waktu": "ds", column: "y"})
        model.add_seasonality(name="weekly", period=15, fourier_order=5)
        model.fit(data)
        model_cache[column] = model
    return model_cache[column]

def get_forecasts():
    forecasts = {}
    today = datetime.now().date()

    for pollutant in pollutants:
        forecast = model(df, pollutant)
        forecast["ds"] = pd.to_datetime(forecast["ds"]).dt.date
        forecast = forecast[forecast["ds"] >= today]
        forecast = forecast.head(7)
        forecast["ds"] = forecast["ds"].astype(str)
        forecasts[pollutant] = forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]]

    return forecasts

@app.get("/api/v1/air-quality")
def get_air_quality():
    try:
        current_time = datetime.now()
        current_date = current_time.date()
        predictions = {}

        for pollutant in pollutants:
            forecast = model(df, pollutant)
            forecast["ds"] = pd.to_datetime(forecast["ds"]).dt.date
            prediction = forecast[forecast["ds"] == current_date]

            if not prediction.empty:
                predictions[pollutant] = {
                    "prediction": int(round(prediction["yhat"].values[0])),
                    "prediction_lower": int(round(prediction["yhat_lower"].values[0])),
                    "prediction_upper": int(round(prediction["yhat_upper"].values[0])),
                    "timestamp": current_time.strftime("%Y-%m-%d"),
                }
            else:
                predictions[pollutant] = {
                    "prediction": None,
                    "prediction_lower": None,
                    "prediction_upper": None,
                    "timestamp": current_time.strftime("%Y-%m-%d"),
                }

        return JSONResponse(content=predictions)

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.get("/api/v1/forecast")
def forecast():
    try:
        forecasts = get_forecasts()
        result = {}

        for pollutant, forecast in forecasts.items():
            forecast["date"] = forecast["ds"]
            daily_forecast = (
                forecast.groupby("date")
                .agg(
                    yhat=("yhat", "mean"),
                    yhat_lower=("yhat_lower", "mean"),
                    yhat_upper=("yhat_upper", "mean"),
                )
                .reset_index()
            )
            daily_forecast["yhat"] = daily_forecast["yhat"].round().astype(int)
            daily_forecast["yhat_lower"] = (
                daily_forecast["yhat_lower"].round().astype(int)
            )
            daily_forecast["yhat_upper"] = (
                daily_forecast["yhat_upper"].round().astype(int)
            )
            result[pollutant] = daily_forecast.to_dict(orient="records")

        return JSONResponse(content=result)

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.get("/api/v1/predict/{date}")
def predict(date: str):
    try:
        date = date.strip()
        if not re.match(r"^\d{4}-\d{2}-\d{2}$", date):
            return JSONResponse(
                content={"error": "Invalid date format, expected YYYY-MM-DD"},
                status_code=400,
            )

        date_obj = datetime.strptime(date, "%Y-%m-%d").date()
        predictions = []

        for pollutant in pollutants:
            forecast = model(df, pollutant)
            forecast["ds"] = pd.to_datetime(forecast["ds"]).dt.date
            prediction = forecast[forecast["ds"] == date_obj]

            if not prediction.empty:
                predictions.append(
                    {
                        "pollutant": pollutant,
                        "date": date,
                        "prediction": prediction["yhat"].values[0],
                        "prediction_lower": prediction["yhat_lower"].values[0],
                        "prediction_upper": prediction["yhat_upper"].values[0],
                    }
                )
            else:
                predictions.append(
                    {
                        "pollutant": pollutant,
                        "date": date,
                        "prediction": None,
                        "prediction_lower": None,
                        "prediction_upper": None,
                    }
                )

        return JSONResponse(content=predictions)

    except ValueError:
        return JSONResponse(
            content={"error": "Invalid date format, expected YYYY-MM-DD"},
            status_code=400,
        )
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.get("/api/v1/mape")
def get_all_mape():
    results = {}
    for pollutant in pollutants:
        try:
            model = model_for_mape(df, pollutant)
            df_cv = cross_validation(
                model, initial="180 days", period="60 days", horizon="90 days"
            )
            mape = mean_absolute_percentage_error(df_cv["y"], df_cv["yhat"])
            accuracy = 100 - mape
            results[pollutant] = f"{accuracy:.2f}%"
        except Exception as e:
            traceback.print_exc()
            results[pollutant] = {"error": str(e)}

    return JSONResponse(content=results)

@app.get("/api/data")
def get_csv_data():
    df = pd.read_csv("ispu_clean.csv")
    return df.to_dict(orient="records")