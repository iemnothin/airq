import { useEffect, useState } from "react";
import axios from "axios";
import Header from "./components/Header";
import TodayCard from "./components/TodayCard";
import DailyPredictionCard from "./components/DailyPredictionCard";
import ForecastByDate from "./components/ForecastByDate";

function App() {
  const [currentAirQuality, setCurrentAirQuality] = useState({});
  const [forecast, setForecast] = useState({});
  const [specificDatePrediction, setSpecificDatePrediction] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPollutantModal, setShowPollutantModal] = useState(false);
  const [showForecastModal, setShowForecastModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedPollutant, setSelectedPollutant] = useState(null);
  const [mapeResults, setMapeResults] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
      } catch {
        setError("Failed to fetch MAPE data");
      } finally {
        setLoading(false);
      }
    };

    fetchMape();
  }, []);

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

  const fetchAirQuality = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:8000/api/v1/air-quality"
      );
      setCurrentAirQuality(data);
    } catch (error) {
      console.error("Error fetching air quality data", error);
    }
  };

  const fetchForecast = async () => {
    try {
      const { data } = await axios.get("http://localhost:8000/api/v1/forecast");
      console.log("Forecast API Response:", data);
      setForecast(data);
    } catch (error) {
      console.error("Error fetching forecast data", error);
    }
  };

  const getPrediction = async () => {
    if (!selectedDate) {
      alert("Please select a date before requesting prediction.");
      return;
    }

    setLoading(true);
    try {
      const formattedDate = new Date(selectedDate);
      const formattedDateString = formattedDate.toISOString().split("T")[0];
      const { data } = await axios.get(
        `http://localhost:8000/api/v1/predict/${formattedDateString}`
      );
      setSpecificDatePrediction(
        data.length > 0 ? data : "No forecast available for this date."
      );
    } catch (error) {
      setSpecificDatePrediction(
        error.response?.data?.message || "Error fetching prediction."
      );
    } finally {
      setLoading(false);
    }
  };

  function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

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
        loading={loading}
        getColorByISPU={getColorByISPU}
        getLevelByISPU={getLevelByISPU}
      />
    </div>
  );
}

export default App;
