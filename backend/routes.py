import io
from fastapi import APIRouter, HTTPException, UploadFile, File, Request
from fastapi.responses import JSONResponse
from datetime import datetime
import pandas as pd
import traceback
from db import get_db_connection
from helpers import fetch_all_data, get_data_info, detect_outliers
from ml import process_basic_forecast, process_advanced_forecast

router = APIRouter(prefix="/api/v1")

# ==============================
# 📡 1. GET Semua Data
# ==============================
@router.get("/data")
def get_all_data():
    try:
        rows = fetch_all_data()
        return rows
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

# ==============================
# 📊 2. INFO DATA (untuk kartu dashboard)
# ==============================
@router.get("/data/info")
def get_info():
    try:
        rows = fetch_all_data()
        info = get_data_info(rows)
        return JSONResponse(content=info)
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)

# ==============================
# ⚠️ 3. GET Outliers
# ==============================
@router.get("/data/outliers")
def get_outliers():
    try:
        rows = fetch_all_data()
        if not rows:
            return []
        df = pd.DataFrame(rows)
        outliers = detect_outliers(df)
        return JSONResponse(content=outliers)
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)

# ==============================
# 🧹 4. Tangani Outlier
# ==============================
@router.post("/data/outliers-handle")
def handle_outliers():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM air_quality_data ORDER BY waktu ASC")
        rows = cursor.fetchall()

        if not rows:
            cursor.close(); conn.close()
            return {"message": "Tidak ada data"}

        df = pd.DataFrame(rows)
        df["waktu"] = pd.to_datetime(df["waktu"])
        numeric_cols = ["pm10","pm25","so2","co","o3","no2","hc","kelembaban","suhu"]

        # Deteksi outlier
        outlier_mask = pd.DataFrame(False, index=df.index, columns=numeric_cols)
        for col in numeric_cols:
            mean, std = df[col].mean(), df[col].std()
            outlier_mask[col] = (df[col] - mean).abs() > 3 * std

        if not outlier_mask.values.any():
            cursor.close(); conn.close()
            return {"message": "Tidak ada outlier"}

        # Interpolasi
        for col in numeric_cols:
            df.loc[outlier_mask[col], col] = None
            df[col] = df[col].interpolate(method='linear', limit_direction='both')

        # Update DB
        for _, row in df.iterrows():
            sql = """
                UPDATE air_quality_data
                SET pm10=%s, pm25=%s, so2=%s, co=%s, o3=%s, no2=%s, hc=%s,
                    kelembaban=%s, suhu=%s
                WHERE id=%s
            """
            cursor.execute(sql, (
                row["pm10"], row["pm25"], row["so2"], row["co"], row["o3"],
                row["no2"], row["hc"], row["kelembaban"], row["suhu"], row["id"]
            ))
        conn.commit(); cursor.close(); conn.close()

        return {"message": f"{outlier_mask.values.sum()} nilai outlier berhasil diinterpolasi"}
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)

# ==============================
# 🗑️ 5. Hapus Semua Data
# ==============================
@router.delete("/data/delete-all")
def delete_all_data():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM air_quality_data")
        conn.commit()
        cursor.close(); conn.close()
        return {"message": "Semua data berhasil dihapus"}
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

# ==============================
# 📤 6. Upload CSV
# ==============================
@router.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    try:
        if not file.filename.endswith(".csv"):
            return JSONResponse({"error": "File harus berformat CSV"}, status_code=400)

        content = await file.read()
        data = pd.read_csv(io.StringIO(content.decode("utf-8")))

        required_cols = ["Waktu", "PM10", "PM25", "SO2", "CO", "O3", "NO2", "HC"]
        for col in required_cols:
            if col not in data.columns:
                return JSONResponse({"error": f"Kolom '{col}' tidak ditemukan"}, 400)

        if "Kelembaban" not in data.columns:
            data["Kelembaban"] = None
        if "Suhu" not in data.columns:
            data["Suhu"] = None

        data["Waktu"] = pd.to_datetime(data["Waktu"], errors="coerce")
        data = data.dropna(subset=["Waktu"])

        conn = get_db_connection()
        cursor = conn.cursor()
        insert_sql = """
            INSERT INTO air_quality_data
            (waktu, pm10, pm25, so2, co, o3, no2, hc, kelembaban, suhu)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """

        for _, r in data.iterrows():
            cursor.execute(insert_sql, (
                r["Waktu"].strftime("%Y-%m-%d %H:%M:%S"),
                r["PM10"], r["PM25"], r["SO2"], r["CO"],
                r["O3"], r["NO2"], r["HC"], r["Kelembaban"], r["Suhu"]
            ))

        conn.commit(); cursor.close(); conn.close()
        return {"message": "Upload berhasil"}
    except Exception as e:
        traceback.print_exc()
        return JSONResponse({"error": str(e)}, status_code=500)

# ==============================
# ✍️ 7. Input Manual
# ==============================
@router.post("/input")
async def input_air_quality(request: Request):
    try:
        data = await request.json()
        conn = get_db_connection()
        cursor = conn.cursor()
        sql = """
        INSERT INTO air_quality_data
        (waktu, pm10, pm25, so2, co, o3, no2, hc, kelembaban, suhu)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """
        cursor.execute(sql, (
            data.get("waktu"), data.get("pm10"), data.get("pm25"),
            data.get("so2"), data.get("co"), data.get("o3"),
            data.get("no2"), data.get("hc"), data.get("kelembaban"),
            data.get("suhu")
        ))
        conn.commit(); cursor.close(); conn.close()
        return {"message": "Data berhasil disimpan ke database"}
    except Exception as e:
        traceback.print_exc()
        return JSONResponse({"error": str(e)}, status_code=500)

# ==============================
# 🤖 8. Process Forecast Basic
# ==============================
@router.post("/model/process-basic")
def process_basic_all():
    try:
        rows = fetch_all_data()
        if not rows:
            return JSONResponse({"error": "Tidak ada data untuk diproses"}, status_code=400)

        df = pd.DataFrame(rows)
        df["waktu"] = pd.to_datetime(df["waktu"])
        pollutants = ["pm10","pm25","so2","o3","no2","co","hc"]
        forecast = process_basic_forecast(df, pollutants)

        return JSONResponse({
            "message": "Forecast Prophet successfully processed for all pollutants.",
            "forecast": forecast
        })
    except Exception as e:
        traceback.print_exc()
        return JSONResponse({"error": str(e)}, status_code=500)

# ==============================
# 🧠 9. Process Forecast Advanced
# ==============================
@router.post("/model/process-advanced")
def process_advanced_all():
    try:
        rows = fetch_all_data()
        if not rows:
            return JSONResponse({"error": "Tidak ada data untuk diproses"}, status_code=400)

        df = pd.DataFrame(rows)
        df["waktu"] = pd.to_datetime(df["waktu"])
        pollutants = ["pm10","pm25","so2","o3","no2","co","hc"]
        forecast = process_advanced_forecast(df, pollutants)

        return JSONResponse({
            "message": "Forecast with parameters (7 pollutants) successfully processed.",
            "forecast": forecast
        })
    except Exception as e:
        traceback.print_exc()
        return JSONResponse({"error": str(e)}, status_code=500)

# ==============================
# 🧹 10. Clear Forecast Tables
# ==============================
@router.delete("/model/clear-forecast")
def clear_forecast():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        tables = [
            "forecast_pm10_data", "forecast_pm10_with_parameters_data",
            "forecast_pm25_data", "forecast_pm25_with_parameters_data",
            "forecast_so2_data", "forecast_so2_with_parameters_data",
            "forecast_o3_data", "forecast_o3_with_parameters_data",
            "forecast_no2_data", "forecast_no2_with_parameters_data",
            "forecast_co_data", "forecast_co_with_parameters_data",
            "forecast_hc_data", "forecast_hc_with_parameters_data"
        ]
        for t in tables:
            cursor.execute(f"TRUNCATE TABLE {t}")
        conn.commit(); cursor.close(); conn.close()
        return {"message": "Semua tabel forecast berhasil dikosongkan."}
    except Exception as e:
        traceback.print_exc()
        return JSONResponse({"error": str(e)}, status_code=500)
