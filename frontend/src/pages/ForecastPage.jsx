import { useState } from "react";
import Header from "../components/Header";
import TodayCard from "../components/TodayCard";
import DailyPredictionCard from "../components/DailyPredictionCard";
import ForecastByDate from "../components/ForecastByDate";
import useRealtimeClock from "../hooks/useRealtimeClock";
import useAirQuality from "../hooks/useAirQuality";
import useForecast from "../hooks/useForecast";
import useMape from "../hooks/useMape";
import { getColorByISPU, getLevelByISPU } from "../utils/ispuUtils";
import formatDate from "../utils/formatDate";
import axios from "axios";

const ForecastPage = () => {
  const currentTime = useRealtimeClock();
  const { data: currentAirQuality } = useAirQuality();
  const { forecast } = useForecast();
  const { mapeResults } = useMape();

  const [showPollutantModal, setShowPollutantModal] = useState(false);
  const [showForecastModal, setShowForecastModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [specificDatePrediction, setSpecificDatePrediction] = useState("");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedPollutant, setSelectedPollutant] = useState(null);

  const getPrediction = async () => {
    if (!selectedDate) return alert("Pilih tanggal terlebih dahulu.");

    setProgress(0);
    setLoading(true);
    setSpecificDatePrediction(null);

    const progressInterval = setInterval(
      () => setProgress((p) => (p >= 90 ? p : p + 10)),
      200
    );

    try {
      const formattedDate = new Date(selectedDate);
      const formattedDateString = formattedDate.toISOString().split("T")[0];
      const res = await axios.get(
        `http://localhost:8000/api/v1/predict/${formattedDateString}`
      );
      setSpecificDatePrediction(
        res.data.length > 0 ? res.data : "Tidak ada prediksi untuk tanggal ini."
      );
      setProgress(100);
    } catch (err) {
      setSpecificDatePrediction("Terjadi kesalahan saat memuat prediksi.");
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
    }
  };

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
};

export default ForecastPage;
