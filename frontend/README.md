# Frontend (AirQ) — Dokumentasi

> Frontend aplikasi AirQ dibangun dengan React (Create React App). Menyediakan UI untuk melihat prediksi kualitas udara, mengelola data, mengunggah CSV, dan menampilkan visualisasi.

## Ringkasan

- Framework: React (Create React App)
- Bahasa: JavaScript (JSX)
- Package manager: npm
- Port development default: 3000

File utama: `src/` berisi komponen, hooks, pages, dan utilities.

## Persyaratan

- Node.js (LTS recommended) dan npm

## Persiapan & menjalankan (Windows PowerShell)

1. Masuk ke folder frontend:

```powershell
cd frontend
```

2. Install dependency:

```powershell
npm install
```

3. Jalankan aplikasi untuk development:

```powershell
npm start
```

Ini akan membuka app di `http://localhost:3000` secara default.

Untuk build produksi:

```powershell
npm run build
```

## Konfigurasi API

Frontend melakukan panggilan HTTP ke backend (axios). Default asumsi backend berada di `http://localhost:8000`.

Jika ingin mengubah URL backend, Anda bisa:

- Cari konfigurasi base URL di kode (mis. penggunaan `axios` di hook `useAirQuality` atau file util axios). Ubah menjadi endpoint backend Anda.
- Atau tambahkan variable environment saat menjalankan:

```powershell
$env:REACT_APP_API_URL = "http://localhost:8000"; npm start
```

Kemudian gunakan `process.env.REACT_APP_API_URL` di kode jika diimplementasikan.

## Struktur proyek penting

- `src/components/` — komponen UI (cards, charts, navigation)
- `src/hooks/` — custom hooks untuk fetching data dan logika (mis. `useAirQuality.jsx`, `useForecast.jsx`)
- `src/pages/` — halaman yang dirender pada route tertentu
- `public/` — static file (index.html, manifest, favicon)

## Skrip NPM

- `npm start` — jalankan development server
- `npm run build` — buat bundle produksi
- `npm test` — jalankan test runner (default CRA)

## Troubleshooting

- Jika tidak bisa terhubung ke backend: pastikan backend berjalan di port yang benar (`8000`), periksa CORS (backend `main.py` mengizinkan all origins pada konfigurasi saat ini).
- Build error: periksa versi Node/npm dan hapus `node_modules` lalu `npm install` ulang.
- Jika data tidak muncul: periksa network tab di devtools dan endpoint backend yang dipanggil.

## Catatan pengembangan

- Komponen dan hooks ditulis untuk kebutuhan UI dan fetch; jika menambahkan endpoint baru, tambahkan hook/fetcher baru dan perbarui komponen yang membutuhkan.

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
