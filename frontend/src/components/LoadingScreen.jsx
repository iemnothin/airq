export default function LoadingScreen() {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
      <div className="spinner-border text-success" role="status"></div>
      <p className="mt-3 fw-semibold text-muted">Memuat data...</p>
    </div>
  );
}
