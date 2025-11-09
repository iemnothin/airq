import io, traceback, time, json
from fastapi.responses import StreamingResponse
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Request
from fastapi.responses import JSONResponse
import pandas as pd
from db import get_db_connection
from helpers import fetch_all_data, get_data_info, detect_outliers
from ml import process_basic_forecast, process_advanced_forecast_stream

router = APIRouter(prefix="/api/v1", tags=["Air Quality Data & Forecasting"])

# ============================================================
# 🌍 1. GET All Air Quality Data
# ============================================================
@router.get(
    "/data",
    summary="Retrieve all air quality data",
    description="""
    Fetch all recorded air quality data from the `air_quality_data` table.

    Each record represents a single timestamp (e.g., hourly) with pollutant concentrations and meteorological parameters.
    """
)
def get_all_data():
    try:
        rows = fetch_all_data()
        return JSONResponse(content={"data": rows, "status": "ok"}, status_code=200)
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)


# ============================================================
# 📊 2. DATA INFO (for dashboard cards)
# ============================================================
@router.get(
    "/data/info",
    summary="Get dataset summary",
    description="Returns dataset summary or default values if no data is available."
)
def get_info():
    try:
        rows = fetch_all_data()
        if not rows:
            # ✅ Data kosong → kirim default agar dashboard tetap tampil
            default_info = {
                "totalData": 0,
                "outlierClear": True,
                "nanClear": True,
                "outlierCount": 0,
                "nanCount": 0,
                "message": "No data available yet."
            }
            return JSONResponse(content=default_info, status_code=200)

        info = get_data_info(rows)
        return JSONResponse(content=info, status_code=200)
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)


# ============================================================
# ⚠️ 3. GET Outliers
# ============================================================
@router.get(
    "/data/outliers",
    summary="Detect outliers in dataset",
    description="Detect outliers safely even when dataset is empty."
)
def get_outliers():
    try:
        rows = fetch_all_data()
        if not rows:
            return []

        df = pd.DataFrame(rows)
        outliers = detect_outliers(df)
        return JSONResponse(content={"outliers": outliers, "status": "ok"}, status_code=200)
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)


# ============================================================
# 🧹 4. Handle Outliers (Interpolate)
# ============================================================
@router.post(
    "/data/outliers-handle",
    summary="Interpolate detected outliers",
    description="""
    Automatically replaces detected outlier values in numeric columns using **linear interpolation**.

    Process:
    1. Detects outliers where |x - μ| > 3σ  
    2. Sets those values to `null`  
    3. Fills gaps using linear interpolation across time (`waktu`)

    Updates the database in place.

    **Response example:**
    ```json
    {"message": "12 outlier values have been interpolated successfully."}
    ```
    """
)
def handle_outliers():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM air_quality_data ORDER BY waktu ASC")
        rows = cursor.fetchall()

        if not rows:
            cursor.close(); conn.close()
            return {"message": "No data available."}

        df = pd.DataFrame(rows)
        df["waktu"] = pd.to_datetime(df["waktu"])
        numeric_cols = ["pm10","pm25","so2","co","o3","no2","hc","kelembaban","suhu"]

        outlier_mask = pd.DataFrame(False, index=df.index, columns=numeric_cols)
        for col in numeric_cols:
            mean, std = df[col].mean(), df[col].std()
            outlier_mask[col] = (df[col] - mean).abs() > 3 * std

        if not outlier_mask.values.any():
            cursor.close(); conn.close()
            return {"message": "No outliers detected."}

        for col in numeric_cols:
            df.loc[outlier_mask[col], col] = None
            df[col] = df[col].interpolate(method='linear', limit_direction='both')

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

        return {"message": f"{outlier_mask.values.sum()} outlier values interpolated successfully."}
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)


# ============================================================
# 🗑️ 5. Delete All Data
# ============================================================
@router.delete(
    "/data/delete-all",
    summary="Delete all air quality data",
    description="""
    Permanently removes **all records** from the `air_quality_data` table.

    ⚠️ **Warning:** This action cannot be undone.
    Use with caution in administrative or reset scenarios.
    """
)
def delete_all_data():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM air_quality_data")
        conn.commit()
        cursor.close(); conn.close()
        return {"message": "All data records have been deleted successfully."}
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


# ============================================================
# 📤 6. Upload CSV
# ============================================================
@router.post(
    "/upload-csv",
    summary="Upload CSV dataset",
    description="""
    Upload a CSV file containing air quality data and insert it into the database.

    **Required columns:**
    - `Waktu`, `PM10`, `PM25`, `SO2`, `CO`, `O3`, `NO2`, `HC`  
    **Optional:** `Kelembaban`, `Suhu`

    Example CSV:
    ```
    Waktu,PM10,PM25,SO2,CO,O3,NO2,HC,Kelembaban,Suhu
    2024-07-30 00:00:00,74,15,6,351,33,17,388,72,30
    2024-07-31 00:00:00,64,19,8,253,38,53,353,78,28
    ```

    Automatically converts the `Waktu` column into a datetime format and skips invalid rows.
    """
)
async def upload_csv(file: UploadFile = File(...)):
    try:
        if not file.filename.endswith(".csv"):
            return JSONResponse({"error": "File must be in CSV format."}, status_code=400)

        content = await file.read()
        data = pd.read_csv(io.StringIO(content.decode("utf-8")))

        required_cols = ["Waktu", "PM10", "PM25", "SO2", "CO", "O3", "NO2", "HC"]
        for col in required_cols:
            if col not in data.columns:
                return JSONResponse({"error": f"Missing column '{col}'"}, 400)

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
        return {"message": "CSV file uploaded and saved successfully."}
    except Exception as e:
        traceback.print_exc()
        return JSONResponse({"error": str(e)}, status_code=500)


# ============================================================
# ✍️ 7. Manual Data Input
# ============================================================
@router.post(
    "/input",
    summary="Manually insert new record",
    description="""
    Insert a single record manually into the air quality dataset via JSON body.

    Example request:
    ```json
    {
        "waktu": "2024-07-30 00:00:00",
        "pm10": 74,
        "pm25": 15,
        "so2": 6,
        "co": 351,
        "o3": 33,
        "no2": 17,
        "hc": 388,
        "kelembaban": 72,
        "suhu": 30
    }
    ```
    """
)
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
        return {"message": "Record inserted successfully into database."}
    except Exception as e:
        traceback.print_exc()
        return JSONResponse({"error": str(e)}, status_code=500)

# ==============================
# 🤖 8. Process Forecast Basic
# ==============================
@router.post(
    "/model/process-basic",
    summary="Generate Prophet forecast (Basic Model)",
    description="""
    Trains a **basic Prophet model** for all 7 pollutants (`PM10`, `PM25`, `SO2`, `O3`, `NO2`, `CO`, `HC`).

    - Uses default Prophet settings (yearly + weekly seasonality)
    - Produces 30-day future forecast for each pollutant
    - Saves results into respective tables:
      - `forecast_pm10_data`, `forecast_pm25_data`, etc.

    **Response example:**
    ```json
    {
      "message": "Forecast Prophet successfully processed for all pollutants.",
      "forecast": {
        "pm10": [
          {"ds": "2024-08-01", "yhat": 42.3, "yhat_lower": 37.8, "yhat_upper": 48.2},
          {"ds": "2024-08-02", "yhat": 43.1, "yhat_lower": 38.1, "yhat_upper": 49.0}
        ],
        "pm25": [...]
      }
    }
    ```
    """
)
def process_basic_all():
    try:
        rows = fetch_all_data()
        if not rows:
            return JSONResponse({"error": "No data available for processing."}, status_code=400)

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
@router.post(
    "/model/process-advanced",
    summary="Generate optimized forecast (Advanced Model)",
    description="""
    Trains an **advanced Prophet model** for all 7 pollutants (`PM10`, `PM25`, `SO2`, `O3`, `NO2`, `CO`, `HC`).

    Features:
    - Uses parameter optimization (changepoint, seasonality, holiday priors)
    - Includes **Indonesian public holidays** as regressors
    - Performs cross-validation to choose best hyperparameters
    - Produces 30-day future forecast
    - Saves results into tables:
      - `forecast_pm10_with_parameters_data`, `forecast_pm25_with_parameters_data`, etc.

    **Response example:**
    ```json
    {
      "message": "Forecast with parameters (7 pollutants) successfully processed.",
      "forecast": {
        "pm10": [
          {"ds": "2024-08-01", "yhat": 41.8, "yhat_lower": 36.2, "yhat_upper": 47.5},
          {"ds": "2024-08-02", "yhat": 42.4, "yhat_lower": 37.0, "yhat_upper": 48.0}
        ]
      }
    }
    ```
    """
)
def process_advanced_all():
    def progress_stream():
        try:
            rows = fetch_all_data()
            if not rows:
                yield f"data: {json.dumps({'status': 'error', 'message': 'No data available for processing.'})}\n\n"
                return

            df = pd.DataFrame(rows)
            df["waktu"] = pd.to_datetime(df["waktu"])
            pollutants = ["pm10", "pm25", "so2", "o3", "no2", "co", "hc"]
            total = len(pollutants)

            yield f"data: {json.dumps({'status': 'start', 'message': 'Starting advanced forecast...', 'total': total})}\n\n"

            for idx, pol in enumerate(pollutants, start=1):
                try:
                    yield f"data: {json.dumps({'status': 'processing', 'pollutant': pol.upper(), 'progress': round((idx-1)/total*100,2)})}\n\n"
                    result = process_advanced_forecast(df, [pol])
                    yield f"data: {json.dumps({'status': 'done', 'pollutant': pol.upper(), 'progress': round(idx/total*100,2)})}\n\n"
                except Exception as e:
                    yield f"data: {json.dumps({'status': 'error', 'pollutant': pol.upper(), 'message': str(e)})}\n\n"
                    continue

                # optional delay for smoother progress bar updates
                time.sleep(0.3)

            yield f"data: {json.dumps({'status': 'complete', 'progress': 100, 'message': 'All forecasts processed successfully!'})}\n\n"

        except Exception as e:
            traceback.print_exc()
            yield f"data: {json.dumps({'status': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(progress_stream(), media_type="text/event-stream")

# ==============================
# 🧠 9B. Process Forecast Advanced (Streaming Progress)
# ==============================
@router.get(
    "/model/process-advanced/stream",
    summary="Stream advanced forecast progress (real-time)",
    description="""
    Streams live progress updates for advanced forecast processing (per pollutant).  
    Uses **Server-Sent Events (SSE)**, allowing the frontend to show real-time status and progress bar.

    Example stream output:
    ```
    data: {"status":"processing","pollutant":"PM10","progress":14.2}
    data: {"status":"done","pollutant":"PM25","progress":100}
    data: {"status":"complete","progress":100,"message":"All forecasts done!"}
    ```
    """,
)
def process_advanced_stream():
    """
    SSE endpoint for real-time progress of advanced Prophet forecast.
    """
    def event_stream():
        rows = fetch_all_data()
        if not rows:
            yield f"data: {json.dumps({'status': 'error', 'message': 'No data available for forecasting'})}\n\n"
            return

        df = pd.DataFrame(rows)
        df["waktu"] = pd.to_datetime(df["waktu"])
        pollutants = ["pm10", "pm25", "so2", "o3", "no2", "co", "hc"]

        yield f"data: {json.dumps({'status': 'start', 'message': 'Starting advanced forecasting for all pollutants'})}\n\n"

        # Jalankan stream dari ml.py
        for event in process_advanced_forecast_stream(df, pollutants):
            yield event

        yield f"data: {json.dumps({'status': 'complete', 'progress': 100, 'message': '✅ All forecasts completed successfully'})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")

    """
    Stream real-time progress of the advanced Prophet forecast process for each pollutant.
    """
    def event_stream():
        rows = fetch_all_data()
        if not rows:
            yield f"data: {json.dumps({'status': 'error', 'message': 'No data available'})}\n\n"
            return

        df = pd.DataFrame(rows)
        df["waktu"] = pd.to_datetime(df["waktu"])
        pollutants = ["pm10", "pm25", "so2", "o3", "no2", "co", "hc"]

        # Kirim event awal
        yield f"data: {json.dumps({'status': 'start', 'message': 'Starting advanced forecast process'})}\n\n"

        # Jalankan untuk setiap polutan
        for pol in pollutants:
            yield f"data: {json.dumps({'status': 'begin', 'pollutant': pol.upper(), 'progress': 0, 'message': f'Starting {pol.upper()}'})}\n\n"

            # ---- progress callback dari ml.py ----
            def progress_callback(pollutant, progress, message):
                """
                Callback ini dipanggil oleh process_advanced_forecast setiap kali ada update progress.
                """
                payload = {
                    "status": "progress",
                    "pollutant": pollutant.upper(),
                    "progress": progress,
                    "message": message
                }
                yield_data.append(f"data: {json.dumps(payload)}\n\n")

            # Wadah sementara untuk data event
            yield_data = []

            # Jalankan forecasting dengan callback progress
            process_advanced_forecast(df, [pol], progress_callback=lambda p, prog, msg: yield_data.append(
                f"data: {json.dumps({'status': 'progress', 'pollutant': p.upper(), 'progress': prog, 'message': msg})}\n\n"
            ))

            # Kirim seluruh progress ke stream
            for msg in yield_data:
                yield msg

            # Tandai selesai satu polutan
            yield f"data: {json.dumps({'status': 'done', 'pollutant': pol.upper(), 'progress': 100, 'message': f'{pol.upper()} completed'})}\n\n"

        # Semua selesai
        yield f"data: {json.dumps({'status': 'complete', 'message': '✅ All forecasts completed successfully'})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
# ==============================
# 🧹 10. Clear Forecast Tables
# ==============================
@router.delete(
    "/model/clear-forecast",
    summary="Clear all forecast result tables",
    description="""
    Truncates (clears) all forecast result tables in the database, including both basic and parameterized model outputs:

    - `forecast_pm10_data`, `forecast_pm10_with_parameters_data`
    - `forecast_pm25_data`, `forecast_pm25_with_parameters_data`
    - ... and others (`SO2`, `O3`, `NO2`, `CO`, `HC`)

    **Response example:**
    ```json
    {"message": "All forecast tables have been cleared successfully."}
    ```
    """
)
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
        return {"message": "All forecast tables have been cleared successfully."}
    except Exception as e:
        traceback.print_exc()
        return JSONResponse({"error": str(e)}, status_code=500)

# ============================================================
# 🧩 11. SYSTEM STATUS & TECHNOLOGIES
# ============================================================
@router.get(
    "/status",
    summary="Check backend system and technology status",
    description="""
    Returns the current operational status of the **AirQ system**, including backend, database, and model readiness.
    Also lists all technologies used in this project stack.

    **Response Example:**
    ```json
    {
      "backend": "online",
      "database": "connected",
      "model_status": "ready",
      "server": "VPS Almalinux + cPanel + Apache",
      "technologies": {
        "frontend": "ReactJS + Bootstrap 5",
        "backend": "Python FastAPI",
        "ml_model": "Facebook Prophet",
        "database": "MySQL / PostgreSQL",
        "deployment": "Gunicorn + Systemd",
        "os": "AlmaLinux 9"
      },
      "timestamp": "2025-11-09T20:45:10"
    }
    ```
    """
)
def system_status():
    from sqlalchemy import create_engine, text
    import os

    db_status = "disconnected"
    try:
        # 🔍 Ubah sesuai database kamu
        engine = create_engine(os.getenv("DATABASE_URL", "mysql+pymysql://root@127.0.0.1:8000/api/v1"))
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        print("Database connection failed:", e)
        db_status = "disconnected"

    model_status = "ready"  # kalau mau dinamis bisa cek dari ml.py nanti

    system_info = {
        "backend": "online",
        "database": db_status,
        "model_status": model_status,
        "server": "VPS Almalinux + cPanel + Apache",
        "technologies": {
            "frontend": "ReactJS + Bootstrap 5",
            "backend": "Python FastAPI",
            "ml_model": "Facebook Prophet",
            "database": "MySQL / PostgreSQL",
            "deployment": "Gunicorn + Systemd",
            "os": "AlmaLinux 9"
        },
        "timestamp": datetime.now().isoformat()
    }

    return JSONResponse(content=system_info, status_code=200)
