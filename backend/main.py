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
import mysql.connector
from fastapi import Request
from fastapi import File, UploadFile
import csv
from fastapi.responses import StreamingResponse
import io, time, threading
from pydantic import BaseModel

# === Koneksi ke Database ===
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",  # ubah sesuai user/password kamu
        database="db_airq"  # ubah sesuai nama DB kamu
    )

app = FastAPI()

progress_data = {
    "value": 0,
    "status": "idle"
}

# === Tambahkan ini ===
origins = [
    "http://localhost:3000",   # React dev
    "http://127.0.0.1:3000",   # kadang browser pakai 127.0.0.1
]

app.add_middleware(
    CORSMiddleware,
    # allow_origins=origins, 
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔹 Model data (untuk dokumentasi dan validasi opsional)
class AirQuality(BaseModel):
    id: int
    waktu: str
    pm10: float
    pm25: float
    so2: float
    co: float
    o3: float
    no2: float
    hc: float
    kelembaban: float
    suhu: float

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
# 📡 GET semua data
@app.get("/api/data")
def get_all_data():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM air_quality ORDER BY waktu ASC")
        rows = cursor.fetchall()

        cursor.close()
        conn.close()

        if not rows:
            return []

        return rows

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/api/v1/input")
async def input_air_quality(request: Request):
    try:
        data = await request.json()
        conn = get_db_connection()
        cursor = conn.cursor()

        sql = """
        INSERT INTO air_quality_data (waktu, pm10, pm25, so2, co, o3, no2, hc, kelembaban, suhu)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        val = (
            data.get("waktu"),
            data.get("pm10"),
            data.get("pm25"),
            data.get("so2"),
            data.get("co"),
            data.get("o3"),
            data.get("no2"),
            data.get("hc"),
            data.get("kelembaban"),
            data.get("suhu"),
        )

        cursor.execute(sql, val)
        conn.commit()
        cursor.close()
        conn.close()

        return {"message": "Data berhasil disimpan ke database"}

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)
    
@app.post("/api/v1/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    try:
        if not file.filename.endswith(".csv"):
            return JSONResponse({"error": "File harus berformat CSV"}, status_code=400)

        # Baca CSV
        content = await file.read()
        data = pd.read_csv(io.StringIO(content.decode("utf-8")))

        # Kolom wajib
        required_cols = ["Waktu", "PM10", "PM25", "SO2", "CO", "O3", "NO2", "HC"]
        for col in required_cols:
            if col not in data.columns:
                return JSONResponse({"error": f"Kolom '{col}' tidak ditemukan"}, 400)

        # Kolom opsional
        if "Kelembaban" not in data.columns:
            data["Kelembaban"] = None
        if "Suhu" not in data.columns:
            data["Suhu"] = None

        # ✅ Pastikan kolom Waktu adalah datetime valid
        data["Waktu"] = pd.to_datetime(data["Waktu"], errors="coerce")

        # ✅ Hapus baris yang gagal parse datetime
        data = data.dropna(subset=["Waktu"])

        # ================= INSERT KE DATABASE =================
        conn = get_db_connection()
        cursor = conn.cursor()

        insert_sql = """
        INSERT INTO air_quality_data
        (waktu, pm10, pm25, so2, co, o3, no2, hc, kelembaban, suhu)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """

        for _, r in data.iterrows():
            waktu_val = r["Waktu"]

            # ✅ waktu_val pasti datetime, jadi aman buat strftime()
            cursor.execute(
                insert_sql,
                (
                    waktu_val.strftime("%Y-%m-%d %H:%M:%S"),
                    r["PM10"], r["PM25"], r["SO2"], r["CO"],
                    r["O3"], r["NO2"], r["HC"],
                    r["Kelembaban"], r["Suhu"]
                )
            )

        conn.commit()
        cursor.close()
        conn.close()

        return JSONResponse({"message": "Upload berhasil"})

    except Exception as e:
        print("UPLOAD ERROR:", e)
        return JSONResponse({"error": str(e)}, 500)

# @app.get("/api/v1/data")
# def get_csv_data(limit: int = 100):
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor(dictionary=True)
#         cursor.execute(
#             "SELECT * FROM air_quality_data ORDER BY waktu DESC LIMIT %s",
#             (limit,)
#         )
#         rows = cursor.fetchall()
#         cursor.close()
#         conn.close()
#         return rows
#     except Exception as e:
#         print("ERROR get data:", e)
#         return JSONResponse({"error": str(e)}, status_code=500)
 
@app.get("/api/v1/data")
def get_csv_data():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM air_quality_data ORDER BY waktu DESC")

        rows = cursor.fetchall()

        cursor.close()
        conn.close()

        return rows

    except Exception as e:
        print("ERROR get data:", e)
        return JSONResponse({"error": str(e)}, status_code=500)

# === Tambahkan di bagian ROUTES ===

@app.get("/api/v1/data/info")
def get_data_info():
    """
    Mengembalikan info untuk card:
    - totalData
    - outlierClear
    - nanClear
    - outlierCount
    - nanCount
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM air_quality_data")
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        if not rows:
            return JSONResponse(content={
                "totalData": 0,
                "outlierClear": True,
                "nanClear": True,
                "outlierCount": 0,
                "nanCount": 0
            })

        df = pd.DataFrame(rows)

        # Total data
        total_data = len(df)

        # Cek NaN / Null
        nan_mask = df.isnull()
        nan_clear = not nan_mask.values.any()
        nan_count = nan_mask.sum().sum()  # jumlah total sel NaN

        # Cek outlier (misal sederhana: > 3 std dev dari mean)
        numeric_cols = ["pm10","pm25","so2","co","o3","no2","hc","kelembaban","suhu"]
        outlier_mask = pd.DataFrame(False, index=df.index, columns=numeric_cols)

        for col in numeric_cols:
            if col in df.columns:
                mean = df[col].mean()
                std = df[col].std()
                outlier_mask[col] = (df[col] - mean).abs() > 3*std

        outlier_clear = not outlier_mask.values.any()
        outlier_count = outlier_mask.values.sum()  # total jumlah outlier

        return JSONResponse(content={
            "totalData": total_data,
            "outlierClear": outlier_clear,
            "nanClear": nan_clear,
            "outlierCount": int(df[numeric_cols].apply(lambda x: ((x - x.mean()).abs() > 3*x.std()).sum()).sum()),
            "nanCount": int(df.isnull().sum().sum())
        })

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.get("/api/v1/data/outliers")
def get_outliers():
    """
    Mengembalikan daftar outlier:
    - id
    - kolom
    - nilai
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM air_quality_data")
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        if not rows:
            return []

        df = pd.DataFrame(rows)

        numeric_cols = ["pm10","pm25","so2","co","o3","no2","hc","kelembaban","suhu"]

        outliers = []

        for col in numeric_cols:
            if col not in df.columns:
                continue

            mean = df[col].mean()
            std = df[col].std()
            # deteksi outlier >3 std dev dari mean
            mask = (df[col] - mean).abs() > 3*std
            for idx in df[mask].index:
                outliers.append({
                    "id": int(df.loc[idx, "id"]),
                    "Kolom": col,
                    "Nilai": df.loc[idx, col]
                })

        return JSONResponse(content=outliers)

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)

# backend tetap seperti yang sudah kamu tulis
@app.post("/api/v1/data/outliers-handle")
def handle_outliers():
    """
    Menangani outlier:
    - Interpolasi linear untuk nilai numeric yang outlier
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Ambil semua data
        cursor.execute("SELECT * FROM air_quality_data ORDER BY waktu ASC")
        rows = cursor.fetchall()

        if not rows:
            cursor.close()
            conn.close()
            return JSONResponse(content={"message": "Tidak ada data"})

        df = pd.DataFrame(rows)
        df["waktu"] = pd.to_datetime(df["waktu"])

        numeric_cols = ["pm10","pm25","so2","co","o3","no2","hc","kelembaban","suhu"]

        # Deteksi outlier
        outlier_mask = pd.DataFrame(False, index=df.index, columns=numeric_cols)
        for col in numeric_cols:
            if col not in df.columns:
                continue
            mean = df[col].mean()
            std = df[col].std()
            outlier_mask[col] = (df[col] - mean).abs() > 3*std

        if not outlier_mask.values.any():
            cursor.close()
            conn.close()
            return JSONResponse(content={"message": "Tidak ada outlier"})

        # Interpolasi
        for col in numeric_cols:
            if col in df.columns:
                df.loc[outlier_mask[col], col] = None
                df[col] = df[col].interpolate(method='linear', limit_direction='both')

        # Update DB
        for _, row in df.iterrows():
            update_sql = """
                UPDATE air_quality_data
                SET pm10=%s, pm25=%s, so2=%s, co=%s, o3=%s, no2=%s, hc=%s,
                    kelembaban=%s, suhu=%s
                WHERE id=%s
            """
            cursor.execute(update_sql, (
                row["pm10"], row["pm25"], row["so2"], row["co"], row["o3"], row["no2"], row["hc"],
                row["kelembaban"], row["suhu"], row["id"]
            ))
        conn.commit()

        cursor.close()
        conn.close()

        return JSONResponse(content={"message": f"{outlier_mask.values.sum()} nilai outlier berhasil diinterpolasi"})

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.delete("/api/v1/data/delete-all")
def delete_all_data():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM air_quality_data")
        conn.commit()
        cursor.close()
        conn.close()
        return {"message": "Semua data berhasil dihapus"}
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
