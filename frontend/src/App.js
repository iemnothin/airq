import { useEffect, useState } from "react";
import axios from "axios";
import Header from "./components/Header";
import TodayCard from "./components/TodayCard";
import DailyPredictionCard from "./components/DailyPredictionCard";
import ForecastByDate from "./components/ForecastByDate";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./App.css";

function App() {
  const [currentAirQuality, setCurrentAirQuality] = useState({});
  const [forecast, setForecast] = useState({});
  const [specificDatePrediction, setSpecificDatePrediction] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPollutantModal, setShowPollutantModal] = useState(false);
  const [showForecastModal, setShowForecastModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedPollutant, setSelectedPollutant] = useState(null);
  const [mapeResults, setMapeResults] = useState({});
  const [error, setError] = useState(null);

  // === Jam Real-Time ===
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // === Fetch utama ===
  useEffect(() => {
    fetchAirQuality();
    fetchForecast();
    const interval = setInterval(() => {
      fetchAirQuality();
      fetchForecast();
    }, 3600000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchMape = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/v1/mape");
        setMapeResults(response.data);
      } catch (err) {
        setError("Gagal memuat data akurasi (MAPE).");
      } finally {
        setLoading(false);
      }
    };
    fetchMape();
  }, []);

  // === Utils ===
  const getColorByISPU = (ispu) => {
    if (ispu <= 50) return "#4CAF50";
    if (ispu <= 100) return "#2196F3";
    if (ispu <= 200) return "#FF9800";
    if (ispu <= 300) return "#F44336";
    if (ispu > 300) return "#000000";
    return "#FFFFFF";
  };

  const getLevelByISPU = (ispu) => {
    if (ispu <= 50) return "Baik";
    if (ispu <= 100) return "Sedang";
    if (ispu <= 200) return "Tidak Sehat";
    if (ispu <= 300) return "Sangat Tidak Sehat";
    if (ispu > 300) return "Berbahaya";
    return "Tidak Terdefinisi";
  };

  // === Fetch Data ===
  const fetchAirQuality = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:8000/api/v1/air-quality"
      );
      setCurrentAirQuality(data);
    } catch (error) {
      console.error("Error fetching air quality data", error);
      setError("Gagal memuat data kualitas udara (kode 500).");
    }
  };

  const fetchForecast = async () => {
    try {
      const { data } = await axios.get("http://localhost:8000/api/v1/forecast");
      console.log("Forecast API Response:", data);
      setForecast(data);
    } catch (error) {
      console.error("Error fetching forecast data", error);
      setError("Gagal memuat data prediksi (kode 500).");
    }
  };

  // === Prediksi Berdasarkan Tanggal ===
  const getPrediction = async () => {
    if (!selectedDate) {
      alert("Pilih tanggal terlebih dahulu sebelum memprediksi.");
      return;
    }

    setProgress(0);
    setLoading(true);
    setSpecificDatePrediction(null);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? prev : prev + 10));
    }, 200);

    try {
      const formattedDate = new Date(selectedDate);
      if (isNaN(formattedDate)) {
        console.error("Invalid selected date:", selectedDate);
        setSpecificDatePrediction("Format tanggal tidak valid.");
        return;
      }

      const formattedDateString = formattedDate.toISOString().split("T")[0];
      const { data } = await axios.get(
        `http://localhost:8000/api/v1/predict/${formattedDateString}`
      );
      console.log("API Response:", data);

      setSpecificDatePrediction(
        data.length > 0 ? data : "Tidak ada prediksi untuk tanggal ini."
      );
      setProgress(100);
    } catch (error) {
      console.error("Error fetching prediction:", error);
      setSpecificDatePrediction("Terjadi kesalahan saat memuat prediksi.");
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
    }
  };

  // === Format Tanggal ===
  function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  }

  // === Halaman Loading ===
  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-success" role="status"></div>
        <p className="mt-3">Memuat data...</p>
      </div>
    );
  }

  // === Halaman Error ===
  if (error) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light text-center">
        <i className="fas fa-server fa-5x text-danger mb-4"></i>
        <h2 className="fw-bold text-danger">500 - Internal Server Error</h2>
        <p className="text-muted mb-3">{error}</p>
        <button
          className="btn btn-danger px-4"
          onClick={() => window.location.reload()}>
          Coba Lagi
        </button>
      </div>
    );
  }

  // === Halaman Utama ===
  return (
    <div className="mx-4 my-2">
      <Header
        currentTime={currentTime}
        setShowModal={setShowForecastModal}
        loading={loading}
        currentAirQuality={currentAirQuality}
        getColorByISPU={getColorByISPU}
        getLevelByISPU={getLevelByISPU}
        formatDate={formatDate}
      />

      <section className="row g-5 d-flex justify-content-between p-2 pt-4">
        <TodayCard
          currentAirQuality={currentAirQuality}
          getColorByISPU={getColorByISPU}
          mapeResults={mapeResults}
          handleCardClick={(pollutant, airQualityData) => {
            setSelectedPollutant({ pollutant, airQualityData });
            setShowPollutantModal(true);
          }}
          showModal={showPollutantModal}
          selectedPollutant={selectedPollutant}
          handleCloseModal={() => setShowPollutantModal(false)}
        />

        <DailyPredictionCard
          forecast={forecast}
          formatDate={formatDate}
          getColorByISPU={getColorByISPU}
        />
      </section>

      <ForecastByDate
        showModal={showForecastModal}
        setShowModal={setShowForecastModal}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        getPrediction={getPrediction}
        specificDatePrediction={specificDatePrediction}
        progress={progress}
        getColorByISPU={getColorByISPU}
        getLevelByISPU={getLevelByISPU}
      />
    </div>
  );
}

export default App;
