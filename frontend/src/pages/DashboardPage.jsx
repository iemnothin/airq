import { useEffect, useState } from "react";
import { Card, Row, Col, Spinner } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "animate.css/animate.min.css";

const DashboardPage = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("https://airq.abiila.com/api/v1/status");
        const data = await response.json();
        setStatus(data);
      } catch (error) {
        console.error("Gagal memuat status sistem:", error);
        setStatus(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  const getStatusStyle = (isActive) => ({
    borderRadius: "12px",
    padding: "6px 16px",
    display: "inline-block",
    fontWeight: 600,
    color: "white",
    fontSize: "0.9rem",
    backgroundColor: isActive ? "#28a745" : "#dc3545", // ✅ hijau / merah
  });

  return (
    <div className="container py-4 animate__animated animate__fadeIn">
      {/* ================= HEADER ================= */}
      <div className="mb-4 text-center text-md-start">
        <h2 className="fw-bold text-success mb-1">Dashboard Sistem AirQ</h2>
        <p className="text-muted mb-0">
          Ringkasan status sistem dan teknologi yang digunakan.
        </p>
      </div>

      {/* ================= STATUS SISTEM ================= */}
      <Card className="mb-4 shadow-sm border-0 rounded-4">
        <Card.Body>
          <h5 className="fw-bold text-primary mb-3">Status Sistem</h5>

          {loading ? (
            <div className="text-center py-3">
              <Spinner animation="border" variant="success" />
              <p className="text-muted mt-2">Memuat status sistem...</p>
            </div>
          ) : status ? (
            <Row className="g-4">
              {/* BACKEND */}
              <Col md={4} sm={6}>
                <Card
                  className="border-0 rounded-4 shadow-sm h-100 text-center p-3"
                  style={{
                    background:
                      status.backend === "online"
                        ? "linear-gradient(135deg, #e6f9ef, #c1f0cd)"
                        : "linear-gradient(135deg, #fdecea, #f7c6c5)",
                  }}>
                  <h6 className="fw-bold text-dark mb-2">Backend</h6>
                  <span style={getStatusStyle(status.backend === "online")}>
                    {status.backend === "online" ? "Online" : "Offline"}
                  </span>
                  <p className="small text-muted mt-2 mb-0">
                    API utama sistem prediksi udara.
                  </p>
                </Card>
              </Col>

              {/* DATABASE */}
              <Col md={4} sm={6}>
                <Card
                  className="border-0 rounded-4 shadow-sm h-100 text-center p-3"
                  style={{
                    background:
                      status.database === "connected"
                        ? "linear-gradient(135deg, #e6f9ef, #c1f0cd)"
                        : "linear-gradient(135deg, #fdecea, #f7c6c5)",
                  }}>
                  <h6 className="fw-bold text-dark mb-2">Database</h6>
                  <span style={getStatusStyle(status.database === "connected")}>
                    {status.database === "connected"
                      ? "Connected"
                      : "Disconnected"}
                  </span>
                  <p className="small text-muted mt-2 mb-0">
                    Penyimpanan data kualitas udara.
                  </p>
                </Card>
              </Col>

              {/* MODEL PROPHET */}
              <Col md={4} sm={6}>
                <Card
                  className="border-0 rounded-4 shadow-sm h-100 text-center p-3"
                  style={{
                    background:
                      status.model_status === "ready"
                        ? "linear-gradient(135deg, #e6f9ef, #c1f0cd)"
                        : "linear-gradient(135deg, #fdecea, #f7c6c5)",
                  }}>
                  <h6 className="fw-bold text-dark mb-2">Model</h6>
                  <span style={getStatusStyle(status.model_status === "ready")}>
                    {status.model_status === "ready" ? "Ready" : "Not Ready"}
                  </span>
                  <p className="small text-muted mt-2 mb-0">
                    Model ML prediksi polusi udara.
                  </p>
                </Card>
              </Col>

              {/* FRONTEND */}
              <Col md={4} sm={6}>
                <Card className="border-0 rounded-4 shadow-sm h-100 text-center p-3 bg-light">
                  <h6 className="fw-bold text-dark mb-2">Frontend</h6>
                  <span style={getStatusStyle(true)}>Online</span>
                  <p className="small text-muted mt-2 mb-0">
                    Antarmuka pengguna aplikasi AirQ.
                  </p>
                </Card>
              </Col>

              {/* WEB SERVER */}
              <Col md={4} sm={6}>
                <Card className="border-0 rounded-4 shadow-sm h-100 text-center p-3 bg-light">
                  <h6 className="fw-bold text-dark mb-2">Web Server</h6>
                  <span style={getStatusStyle(true)}>Active</span>
                  <p className="small text-muted mt-2 mb-0">
                    Menjalankan FastAPI & ReactJS.
                  </p>
                </Card>
              </Col>
            </Row>
          ) : (
            <div className="text-center text-danger py-3">
              ❌ Tidak dapat memuat status sistem.
            </div>
          )}
        </Card.Body>
      </Card>

      {/* ================= TEKNOLOGI ================= */}
      <Card className="shadow-sm border-0 rounded-4">
        <Card.Body>
          <h5 className="fw-bold text-primary mb-3">
            Teknologi yang Digunakan
          </h5>
          <Row className="g-3">
            {[
              {
                title: "Frontend",
                tech: "ReactJS + Bootstrap 5",
                desc: "Komponen interaktif, routing dinamis, dan tampilan responsif.",
              },
              {
                title: "Backend",
                tech: "Python FastAPI",
                desc: "REST API untuk prediksi dan manajemen data.",
              },
              {
                title: "Machine Learning",
                tech: "Facebook Prophet",
                desc: "Model prediksi tren polusi udara (PM10).",
              },
              {
                title: "Database",
                tech: "MySQL / PostgreSQL",
                desc: "Penyimpanan data udara dan hasil prediksi.",
              },
              {
                title: "Server",
                tech: "VPS AlmaLinux + cPanel",
                desc: "Meng-host backend FastAPI & frontend React.",
              },
              {
                title: "Deployment",
                tech: "Gunicorn + Systemd",
                desc: "Menjalankan FastAPI sebagai service otomatis di VPS.",
              },
            ].map((item, idx) => (
              <Col md={4} sm={6} key={idx}>
                <Card className="border-0 bg-light rounded-4 p-3 h-100">
                  <h6 className="fw-bold text-dark mb-1">{item.title}</h6>
                  <p className="text-muted mb-1">{item.tech}</p>
                  <small className="text-secondary">{item.desc}</small>
                </Card>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>

      {/* ================= FOOTER ================= */}
      <footer className="mt-5 text-center text-muted small">
        <p className="mb-0">© {new Date().getFullYear()} AirQ — abiila</p>
      </footer>
    </div>
  );
};

export default DashboardPage;
