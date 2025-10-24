export default function ErrorScreen({ message }) {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light text-center">
      <i className="fas fa-server fa-5x text-danger mb-4"></i>
      <h2 className="fw-bold text-danger">500 - Internal Server Error</h2>
      <p className="text-muted mb-3">
        {message || "Terjadi kesalahan sistem."}
      </p>
      <button
        className="btn btn-danger px-4"
        onClick={() => window.location.reload()}>
        Coba Lagi
      </button>
    </div>
  );
}
