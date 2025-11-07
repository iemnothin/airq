"""
routes.py - FastAPI route definitions for AirQ backend
"""
from fastapi import APIRouter, Request, File, UploadFile
from fastapi.responses import JSONResponse
from datetime import datetime
import pandas as pd
import re
import traceback
from db import get_db_connection
from ml import get_or_train_model, get_prediction_for_date, build_forecast_df
from schemas import AirQuality

router = APIRouter()


# Small serializer to make DB rows JSON serializable
from datetime import date, datetime as _dt
import decimal as _decimal

def _serialize_value(v):
    if isinstance(v, (_dt, date)):
        return v.isoformat()
    if isinstance(v, _decimal.Decimal):
        return float(v)
    return v

def _serialize_rows(rows):
    return [{k: _serialize_value(v) for k, v in r.items()} for r in rows]


# --- API ROUTES MOVED FROM LEGACY main.py ---
import io

# ---- Lazy ML imports and data loading ---------------------------------
# Make ML/Prophet imports lazy so FastAPI can register routes even when
# optional ML dependencies are missing in the environment.
try:
    from ml import get_or_train_model, get_prediction_for_date, build_forecast_df
except Exception as _ml_err:
    # Provide clear placeholders that raise only when the endpoint is invoked.
    def _raise_ml_err(*args, **kwargs):
        raise RuntimeError(f"ML utilities unavailable: {_ml_err}")

    get_or_train_model = _raise_ml_err
    get_prediction_for_date = _raise_ml_err
    build_forecast_df = _raise_ml_err

# Cached loader for the CSV used by forecasting endpoints. This avoids
# reading/parsing the file at import time which can raise and prevent the
# router from being included.
_cached_ispu_df = None

POLLUTANTS = ["PM10", "PM25", "SO2", "CO", "O3", "NO2", "HC"]

def load_ispu_df():
    global _cached_ispu_df
    if _cached_ispu_df is not None:
        return _cached_ispu_df
    try:
        df_local = pd.read_csv("ispu_clean.csv")
        df_local["Waktu"] = pd.to_datetime(df_local["Waktu"])
        for col in POLLUTANTS:
            df_local[col] = pd.to_numeric(df_local[col], errors="coerce")
        df_local = df_local.resample("D", on="Waktu").mean().reset_index()
        _cached_ispu_df = df_local
    except Exception:
        traceback.print_exc()
        _cached_ispu_df = pd.DataFrame()
    return _cached_ispu_df

def get_train_test():
    df_local = load_ispu_df()
    train_start = "2022-08-01"
    train_end = "2024-01-08"
    test_start = "2024-01-09"
    test_end = "2024-05-20"
    train_df = df_local[(df_local["Waktu"] >= train_start) & (df_local["Waktu"] <= train_end)].copy()
    test_df = df_local[(df_local["Waktu"] >= test_start) & (df_local["Waktu"] <= test_end)].copy()
    return train_df, test_df, test_end

@router.get("/api/v1/air-quality")
def get_air_quality():
    try:
        current_date = datetime.now().date()
        results = {}
        train_df, _, test_end = get_train_test()
        if train_df.empty:
            return JSONResponse(content={"error": "Training data unavailable"}, status_code=500)

        for p in POLLUTANTS:
            model = get_or_train_model(train_df, p)
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

@router.get("/api/v1/forecast")
def get_forecast():
    try:
        df_local = load_ispu_df()
        if df_local.empty:
            return JSONResponse(content={"error": "Source data unavailable"}, status_code=500)

        result = {}
        for p in POLLUTANTS:
            forecast = build_forecast_df(df_local, p)
            forecast["ds"] = forecast["ds"].astype(str)
            result[p] = forecast.round().astype(int).to_dict(orient="records")
        return JSONResponse(content=result)
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)

@router.get("/api/v1/predict/{date}")
def predict(date: str):
    try:
        if not re.match(r"^\d{4}-\d{2}-\d{2}$", date):
            return JSONResponse({"error": "Invalid date format, expected YYYY-MM-DD"}, 400)
        date_obj = datetime.strptime(date, "%Y-%m-%d").date()
        predictions = []
        train_df, _, test_end = get_train_test()
        if train_df.empty:
            return JSONResponse(content={"error": "Training data unavailable"}, status_code=500)

        for p in POLLUTANTS:
            model = get_or_train_model(train_df, p)
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

@router.get("/api/v1/mape")
def get_all_mape():
    results = {}
    df_local = load_ispu_df()
    if df_local.empty:
        return JSONResponse(content={"error": "Source data unavailable"}, status_code=500)

    # Lazy import heavy functions
    try:
        from prophet.diagnostics import cross_validation
        from sklearn.metrics import mean_absolute_percentage_error
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(content={"error": f"ML libs missing: {e}"}, status_code=500)

    for p in POLLUTANTS:
        try:
            model = get_or_train_model(df_local, p, years=[2022, 2023, 2024, 2025])
            df_cv = cross_validation(model, initial="180 days", period="180 days", horizon="365 days")
            mape = mean_absolute_percentage_error(df_cv["y"], df_cv["yhat"])
            results[p] = f"{(100 - mape):.2f}%"
        except Exception as e:
            traceback.print_exc()
            results[p] = {"error": str(e)}

    return JSONResponse(content=results)

# Add other routes from legacy main.py as needed


# ---------------------- Data / DB routes ----------------------
@router.get("/api/data")
def get_all_data():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM air_quality ORDER BY waktu ASC")
        rows = cursor.fetchall()

        cursor.close()
        conn.close()

        if not rows:
            return JSONResponse(content=[])

        return JSONResponse(content=_serialize_rows(rows))

    except Exception as e:
        traceback.print_exc()
        raise


@router.get("/api/v1/data")
def get_csv_data():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM air_quality_data ORDER BY waktu DESC")

        rows = cursor.fetchall()

        cursor.close()
        conn.close()

        return JSONResponse(content=_serialize_rows(rows))

    except Exception as e:
        traceback.print_exc()
        return JSONResponse({"error": str(e)}, status_code=500)


@router.get("/api/v1/data/info")
def get_data_info():
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

        total_data = len(df)
        nan_mask = df.isnull()
        nan_clear = not nan_mask.values.any()
        nan_count = int(nan_mask.sum().sum())

        numeric_cols = ["pm10","pm25","so2","co","o3","no2","hc","kelembaban","suhu"]
        outlier_mask = pd.DataFrame(False, index=df.index, columns=numeric_cols)

        for col in numeric_cols:
            if col in df.columns:
                mean = df[col].mean()
                std = df[col].std()
                outlier_mask[col] = (df[col] - mean).abs() > 3*std

        outlier_count = int(df[numeric_cols].apply(lambda x: ((x - x.mean()).abs() > 3*x.std()).sum()).sum())

        return JSONResponse(content={
            "totalData": total_data,
            "outlierClear": not outlier_mask.values.any(),
            "nanClear": nan_clear,
            "outlierCount": outlier_count,
            "nanCount": nan_count
        })

    except Exception as e:
        traceback.print_exc()
        return JSONResponse({"error": str(e)}, status_code=500)


@router.get("/api/v1/data/outliers")
def get_outliers():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM air_quality_data")
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        if not rows:
            return JSONResponse(content=[])

        df = pd.DataFrame(rows)

        numeric_cols = ["pm10","pm25","so2","co","o3","no2","hc","kelembaban","suhu"]
        outliers = []

        for col in numeric_cols:
            if col not in df.columns:
                continue
            mean = df[col].mean()
            std = df[col].std()
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
        return JSONResponse({"error": str(e)}, status_code=500)


@router.post("/api/v1/data/outliers-handle")
def handle_outliers():
    """
    Handle outliers by setting detected outlier values to NaN and
    performing linear interpolation, then updating the DB.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Fetch all data ordered by time
        cursor.execute("SELECT * FROM air_quality_data ORDER BY waktu ASC")
        rows = cursor.fetchall()

        if not rows:
            cursor.close()
            conn.close()
            return JSONResponse(content={"message": "Tidak ada data"})

        df_all = pd.DataFrame(rows)
        df_all["waktu"] = pd.to_datetime(df_all["waktu"]) if "waktu" in df_all.columns else pd.to_datetime(df_all.iloc[:,0])

        numeric_cols = ["pm10","pm25","so2","co","o3","no2","hc","kelembaban","suhu"]

        # Detect outliers (> 3 std dev from mean)
        outlier_mask = pd.DataFrame(False, index=df_all.index, columns=numeric_cols)
        for col in numeric_cols:
            if col not in df_all.columns:
                continue
            mean = df_all[col].mean()
            std = df_all[col].std()
            outlier_mask[col] = (df_all[col] - mean).abs() > 3*std

        if not outlier_mask.values.any():
            cursor.close()
            conn.close()
            return JSONResponse(content={"message": "Tidak ada outlier"})

        # Set outlier values to NaN then interpolate
        for col in numeric_cols:
            if col in df_all.columns:
                df_all.loc[outlier_mask[col], col] = None
                df_all[col] = df_all[col].interpolate(method='linear', limit_direction='both')

        # Update DB rows
        for _, row in df_all.iterrows():
            update_sql = """
                UPDATE air_quality_data
                SET pm10=%s, pm25=%s, so2=%s, co=%s, o3=%s, no2=%s, hc=%s,
                    kelembaban=%s, suhu=%s
                WHERE id=%s
            """
            cursor.execute(update_sql, (
                row.get("pm10"), row.get("pm25"), row.get("so2"), row.get("co"), row.get("o3"), row.get("no2"), row.get("hc"),
                row.get("kelembaban"), row.get("suhu"), row.get("id")
            ))

        conn.commit()

        affected = int(outlier_mask.values.sum()) if hasattr(outlier_mask.values.sum(), '__int__') else int(outlier_mask.values.sum())

        cursor.close()
        conn.close()

        return JSONResponse(content={"message": f"{affected} nilai outlier berhasil diinterpolasi"})

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)


    @router.delete("/api/v1/model/clear-forecast")
    def clear_all_forecast_tables():
        """
        Truncate all forecast tables for the pollutants to clear stored forecasts.
        """
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            tables = [
                "forecast_pm10_data",
                "forecast_pm25_data",
                "forecast_so2_data",
                "forecast_o3_data",
                "forecast_no2_data",
                "forecast_co_data",
                "forecast_hc_data"
            ]

            for table in tables:
                # safe because table names are hard-coded
                cursor.execute(f"TRUNCATE TABLE {table}")

            conn.commit()
            cursor.close()
            conn.close()

            return JSONResponse(content={"message": "Semua tabel forecast berhasil dikosongkan."})

        except Exception as e:
            traceback.print_exc()
            return JSONResponse(content={"error": str(e)}, status_code=500)


@router.post("/api/v1/input")
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

        return JSONResponse({"message": "Data berhasil disimpan ke database"})

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)


@router.post("/api/v1/upload-csv")
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
            waktu_val = r["Waktu"]
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
        traceback.print_exc()
        return JSONResponse({"error": str(e)}, 500)
