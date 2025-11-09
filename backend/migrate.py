# migrate.py
import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

# ==============================
# 🔧 KONFIGURASI DATABASE
# ==============================
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "abiila_admin"),
    "password": os.getenv("DB_PASS", "2bGBTWV7@y#bnPH"),
    "database": os.getenv("DB_NAME", "abiila_airq_db"),
}

# ==============================
# 📦 SKEMA TABEL
# ==============================
TABLES = {}

# --- 1️⃣ Tabel utama data kualitas udara ---
TABLES["air_quality_data"] = """
    CREATE TABLE IF NOT EXISTS air_quality_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        waktu DATETIME NOT NULL,
        pm10 FLOAT,
        pm25 FLOAT,
        so2 FLOAT,
        co FLOAT,
        o3 FLOAT,
        no2 FLOAT,
        hc FLOAT,
        kelembaban FLOAT,
        suhu FLOAT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
"""

# --- 2️⃣ Generate otomatis untuk semua polutan ---
pollutants = ["pm10", "pm25", "so2", "co", "o3", "no2", "hc"]

for pol in pollutants:
    # Format: forecast_xxx_data
    TABLES[f"forecast_{pol}_data"] = f"""
        CREATE TABLE IF NOT EXISTS forecast_{pol}_data (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ds DATE,
            yhat FLOAT,
            yhat_lower FLOAT,
            yhat_upper FLOAT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """

    # Format: forecast_xxx_with_parameters_data
    TABLES[f"forecast_{pol}_with_parameters_data"] = f"""
        CREATE TABLE IF NOT EXISTS forecast_{pol}_with_parameters_data (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ds DATE,
            yhat FLOAT,
            yhat_lower FLOAT,
            yhat_upper FLOAT,
            changepoint_prior_scale FLOAT,
            seasonality_prior_scale FLOAT,
            holidays_prior_scale FLOAT,
            model_mape FLOAT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """

# ==============================
# ⚙️ FUNGSI MIGRASI
# ==============================
def migrate():
    print("🔧 Connecting to database...")
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()
    print("✅ Connected to database.\n")

    for table_name, table_sql in TABLES.items():
        print(f"➡️ Creating: {table_name:<45}", end="")
        try:
            cursor.execute(table_sql)
            print("✅ Done")
        except Exception as e:
            print(f"❌ Error: {e}")

    conn.commit()
    cursor.close()
    conn.close()
    print("\n🎉 Migration completed successfully!\n")


if __name__ == "__main__":
    migrate()
