import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-center bg-light px-4">
      {/* Heading utama */}
      <h1 className="fw-bold mb-3 text-success">
        Selamat datang di aplikasi AirQ
      </h1>

      {/* Deskripsi utama */}
      <p className="lead mb-4" style={{ maxWidth: "700px" }}>
        Aplikasi ini dapat melakukan prediksi kualitas udara kota Bogor
        menggunakan <strong>Facebook Prophet</strong>.
      </p>

      {/* Ucapan Terima Kasih */}
      <div
        className="text-start bg-white shadow-sm rounded-4 p-4"
        style={{ maxWidth: "750px" }}>
        <p className="mb-2">
          Aplikasi ini dibuat sebagai produk dari tugas akhir developer dengan
          dukungan dari:
        </p>
        <ol className="mb-4">
          <li>
            <strong>Arie Qur’ania, M.Kom.</strong> selaku Pembimbing Utama yang
            telah memberikan dorongan moril dan motivasi kepada penulis.
          </li>
          <li>
            <strong>Irma Anggraeni, M.Kom.</strong> selaku Pembimbing Pendamping
            yang telah memberikan bimbingan, semangat, dan motivasi.
          </li>
          <li>
            <strong>Arie Qur’ania, M.Kom.</strong> selaku Ketua Program Studi
            Ilmu Komputer FMIPA Universitas Pakuan Bogor.
          </li>
          <li>
            <strong>Yusuf Rachmanto</strong> dan <strong>Kamyati</strong>{" "}
            sebagai orang tua penulis serta
            <strong> Anisa Puspita Rachman</strong> sebagai kakak penulis yang
            telah memberikan doa, perhatian, dan semangat.
          </li>
          <li>
            Rekan-rekan <strong>asisten praktikum LABKOM</strong> yang telah
            memberikan motivasi dan semangat kepada penulis.
          </li>
          <li>
            Rekan-rekan <strong>Tim ICT FMIPA Universitas Pakuan</strong> yang
            telah memberikan dukungan kepada penulis.
          </li>
          <li>
            <strong>Rizky Kamila</strong>, teman dekat penulis yang selalu
            menjadi pendengar keluh kesah penulis, memberikan semangat, dan
            bersama-sama berjuang di Universitas Pakuan.
          </li>
        </ol>

        {/* Tombol Navigasi */}
        <div className="text-center">
          <Button
            variant="success"
            size="lg"
            onClick={() => navigate("/forecast")}
            className="px-5 fw-semibold">
            Lihat Forecast
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
