// src/pages/DashboardPage.jsx
import { useEffect, useState } from "react";
import { Card, Row, Col, Spinner, Badge } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "animate.css/animate.min.css";

const DashboardPage = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Contoh endpoint FastAPI kamu: /api/status
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

  return (
    <div className="container py-4 animate__animated animate__fadeIn">
      {/* ================= HEADER ================= */}
      <div className="mb-4 text-center text-md-start">
        <h2 className="fw-bold text-success mb-1">Dashboard Sistem AirQ 🌤️</h2>
        <p className="text-muted mb-0">
          Ringkasan status sistem dan teknologi yang digunakan.
        </p>
      </div>

      {/* ================= STATUS SISTEM ================= */}
      <Card className="mb-4 shadow-sm border-0 rounded-4">
        <Card.Body>
          <h5 className="fw-bold text-primary mb-3">🔧 Status Sistem</h5>

          {loading ? (
            <div className="text-center py-3">
              <Spinner animation="border" variant="success" />
              <p className="text-muted mt-2">Memuat status sistem...</p>
            </div>
          ) : (
            <>
              {status ? (
                <Row className="g-3">
                  <Col md={4} sm={6}>
                    <Card className="border-0 bg-light rounded-3 p-3 h-100">
                      <h6 className="text-success mb-1">FastAPI Backend</h6>
                      <Badge
                        bg={status.backend === "online" ? "success" : "danger"}>
                        {status.backend === "online" ? "Online" : "Offline"}
                      </Badge>
                    </Card>
                  </Col>

                  <Col md={4} sm={6}>
                    <Card className="border-0 bg-light rounded-3 p-3 h-100">
                      <h6 className="text-success mb-1">Database</h6>
                      <Badge
                        bg={
                          status.database === "connected" ? "success" : "danger"
                        }>
                        {status.database === "connected"
                          ? "Connected"
                          : "Disconnected"}
                      </Badge>
                    </Card>
                  </Col>

                  <Col md={4} sm={6}>
                    <Card className="border-0 bg-light rounded-3 p-3 h-100">
                      <h6 className="text-success mb-1">Model Prophet</h6>
                      <Badge
                        bg={
                          status.model_status === "ready" ? "info" : "secondary"
                        }>
                        {status.model_status || "Unknown"}
                      </Badge>
                    </Card>
                  </Col>

                  <Col md={4} sm={6}>
                    <Card className="border-0 bg-light rounded-3 p-3 h-100">
                      <h6 className="text-success mb-1">Frontend React</h6>
                      <Badge bg="success">Operational</Badge>
                    </Card>
                  </Col>

                  <Col md={4} sm={6}>
                    <Card className="border-0 bg-light rounded-3 p-3 h-100">
                      <h6 className="text-success mb-1">Web Server</h6>
                      <Badge bg="success">Apache (cPanel)</Badge>
                    </Card>
                  </Col>
                </Row>
              ) : (
                <div className="text-center text-danger py-3">
                  ❌ Tidak dapat memuat status sistem.
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* ================= TEKNOLOGI ================= */}
      <Card className="shadow-sm border-0 rounded-4">
        <Card.Body>
          <h5 className="fw-bold text-primary mb-3">
            💻 Teknologi yang Digunakan
          </h5>
          <Row className="g-3">
            <Col md={4} sm={6}>
              <Card className="border-0 bg-light rounded-3 p-3 h-100">
                <h6 className="fw-bold text-dark mb-1">Frontend</h6>
                <p className="text-muted mb-1">ReactJS + Bootstrap 5</p>
                <small className="text-secondary">
                  Komponen interaktif, routing dinamis, dan tampilan responsif.
                </small>
              </Card>
            </Col>

            <Col md={4} sm={6}>
              <Card className="border-0 bg-light rounded-3 p-3 h-100">
                <h6 className="fw-bold text-dark mb-1">Backend</h6>
                <p className="text-muted mb-1">Python FastAPI</p>
                <small className="text-secondary">
                  REST API untuk prediksi dan manajemen data.
                </small>
              </Card>
            </Col>

            <Col md={4} sm={6}>
              <Card className="border-0 bg-light rounded-3 p-3 h-100">
                <h6 className="fw-bold text-dark mb-1">Machine Learning</h6>
                <p className="text-muted mb-1">Facebook Prophet</p>
                <small className="text-secondary">
                  Model prediksi tren polusi udara (PM10).
                </small>
              </Card>
            </Col>

            <Col md={4} sm={6}>
              <Card className="border-0 bg-light rounded-3 p-3 h-100">
                <h6 className="fw-bold text-dark mb-1">Database</h6>
                <p className="text-muted mb-1">PostgreSQL / MySQL</p>
                <small className="text-secondary">
                  Penyimpanan data udara dan hasil prediksi.
                </small>
              </Card>
            </Col>

            <Col md={4} sm={6}>
              <Card className="border-0 bg-light rounded-3 p-3 h-100">
                <h6 className="fw-bold text-dark mb-1">Server</h6>
                <p className="text-muted mb-1">VPS Almalinux + cPanel</p>
                <small className="text-secondary">
                  Meng-host backend FastAPI & frontend React.
                </small>
              </Card>
            </Col>

            <Col md={4} sm={6}>
              <Card className="border-0 bg-light rounded-3 p-3 h-100">
                <h6 className="fw-bold text-dark mb-1">Deployment</h6>
                <p className="text-muted mb-1">Gunicorn + Systemd</p>
                <small className="text-secondary">
                  Menjalankan FastAPI sebagai service otomatis di VPS.
                </small>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* ================= FOOTER ================= */}
      <footer className="mt-5 text-center text-muted small">
        <p className="mb-0">
          © {new Date().getFullYear()} AirQ Dashboard — abiila
        </p>
      </footer>
    </div>
  );
};

export default DashboardPage;
