import { useNavigate } from "react-router-dom";
import { Button, Container, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "animate.css/animate.min.css";
import "../css/LandingPage.css";
const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center text-center text-dark">
      {/* ================= HERO SECTION ================= */}
      <Container className="animate__animated animate__fadeInUp mb-5">
        <Row className="align-items-center g-5 hero-row">
          {/* Hero Image */}
          <Col
            md={6}
            className="d-flex flex-column align-items-center justify-content-center col-image">
            <div className="hero-image-wrapper animate__animated hero-rise">
              <img
                src="https://airq.abiila.com/air-no-outline192.png"
                alt="Air Quality Illustration"
                className="img-fluid hero-float"
                style={{
                  maxWidth: "340px",
                  width: "80%",
                  height: "auto",
                  objectFit: "contain",
                }}
              />
            </div>
            <h1 className="text-primary fw-bold mt-3">AirQ</h1>
          </Col>

          {/* Hero Text */}
          <Col md={6} className="text-md-start text-center col-text">
            <h1 className="fw-bold text-success display-5 mb-3 lh-sm">
              Selamat Datang di <span className="text-dark">AirQ</span>
            </h1>
            <p
              className="lead text-secondary mb-4"
              style={{ lineHeight: "1.6" }}>
              Aplikasi cerdas untuk memprediksi kualitas udara di Kota Bogor
              menggunakan model <strong>Facebook Prophet</strong>. Didesain agar
              informatif, akurat, dan mudah diakses di mana saja.
            </p>

            <Button
              variant="outline-success"
              size="lg"
              className="fw-semibold px-4"
              onClick={() => navigate("/dashboard")}>
              Mulai Forecasting
            </Button>
          </Col>
        </Row>
      </Container>

      {/* ================= UCAPAN TERIMA KASIH ================= */}
      <Container
        className="mt-4 bg-white d-none d-md-block rounded-md-4 shadow-sm p-4 p-sm-5 animate__animated animate__fadeInUp"
        style={{ maxWidth: "900px" }}>
        <h4 className="fw-bold text-success mb-3 text-center">
          Ucapan Terima Kasih
        </h4>

        <p className="mb-3 text-start">
          Aplikasi ini dibuat sebagai produk dari tugas akhir dengan dukungan
          dari:
        </p>

        <ol className="text-start" style={{ lineHeight: "1.7" }}>
          <li>
            <strong>Arie Qur’ania, M.Kom.</strong> — Pembimbing Utama yang
            memberikan dorongan moril dan motivasi.
          </li>
          <li>
            <strong>Irma Anggraeni, M.Kom.</strong> — Pembimbing Pendamping yang
            memberikan bimbingan dan semangat.
          </li>
          <li>
            <strong>Arie Qur’ania, M.Kom.</strong> — Ketua Program Studi Ilmu
            Komputer FMIPA Universitas Pakuan Bogor.
          </li>
          <li>
            <strong>Yusuf Rachmanto</strong> dan <strong>Kamyati</strong> —
            Orang tua penulis, serta <strong>Anisa Puspita Rachman</strong> yang
            memberikan doa dan semangat.
          </li>
          <li>
            Rekan-rekan <strong>asisten praktikum LABKOM</strong> dan{" "}
            <strong>Tim ICT FMIPA Universitas Pakuan</strong> atas dukungan dan
            motivasi.
          </li>
          <li>
            <strong>Rizky Kamila</strong>, teman dekat penulis yang selalu
            mendukung dalam perjalanan akademik ini.
          </li>
        </ol>
      </Container>

      {/* ================= FOOTER ================= */}
      <footer className="mt-5 text-muted small text-center">
        <p className="mb-0">© {new Date().getFullYear()} AirQ | abiila</p>
      </footer>
    </div>
  );
};

export default LandingPage;
