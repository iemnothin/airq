# AirQ — Dokumentasi Project

Repo ini berisi dua bagian utama:

- `backend/` — API server berbasis FastAPI (prediksi kualitas udara dengan Prophet, manajemen data, upload CSV, outlier handling).
- `frontend/` — React app (UI untuk menampilkan prediksi, mengelola data, dan visualisasi).

Mulai cepat (development)

1. Jalankan backend

```powershell
cd backend
# aktifkan virtualenv jika dibuat
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

2. Jalankan frontend (di terminal baru)

```powershell
cd frontend
npm install
npm start
```

Setelah itu, buka `http://localhost:3000` untuk UI dan `http://localhost:8000/docs` untuk dokumentasi API (Swagger).

Dokumentasi khusus tersedia di:

- `backend/README.md` — instruksi detail backend, skema DB, dan daftar endpoint.
- `frontend/README.md` — instruksi detail frontend, skrip npm, dan konfigurasi API.

Catatan singkat:

- Pastikan MySQL berjalan dan kredensial di `backend/main.py` atau environment variable sudah diatur.
- Untuk production, pindahkan konfigurasi sensitif ke environment variable dan pertimbangkan penggunaan WSGI/ASGI server yang lebih robust serta reverse proxy.

Jika ingin bantuan lebih lanjut (contoh file CSV, migrasi DB, atau deployment), beri tahu saya dan saya akan membantu menyiapkan langkah berikutnya.
