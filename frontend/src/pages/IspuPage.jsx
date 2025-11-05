import { useState, useEffect } from "react";
import useAirQuality from "../hooks/useAirQuality";
import useMape from "../hooks/useMape";
import Header from "../components/Header";
import TodayCard from "../components/TodayCard";
import { getColorByISPU, getLevelByISPU } from "../utils/ispuUtils";
import formatDate from "../utils/formatDate";

const IspuPage = ({ setError }) => {
  const { data: currentAirQuality, error: aqError } = useAirQuality();
  const { mapeResults, error: mapeError } = useMape();

  const [showPollutantModal, setShowPollutantModal] = useState(false);
  const [selectedPollutant, setSelectedPollutant] = useState(null);

  // ✅ Error handling ketika backend mati
  useEffect(() => {
    if (aqError || mapeError) {
      setError("⚠️ Backend tidak dapat dijangkau. Pastikan server berjalan.");
    }
  }, [aqError, mapeError, setError]);

  return (
    <div className="mx-4 my-2">
      {/* HEADER */}
      <Header
        currentTime={new Date()}
        setShowModal={() => {}}
        loading={false}
        currentAirQuality={currentAirQuality}
        getColorByISPU={getColorByISPU}
        getLevelByISPU={getLevelByISPU}
        formatDate={formatDate}
      />

      {/* ISPU TODAY SECTION */}
      <section className="row g-5 d-flex justify-content-between p-2 pt-4">
        <TodayCard
          currentAirQuality={currentAirQuality}
          getColorByISPU={getColorByISPU}
          mapeResults={mapeResults}
          handleCardClick={(pollutant, airData) => {
            setSelectedPollutant({ pollutant, airData });
            setShowPollutantModal(true);
          }}
          showModal={showPollutantModal}
          selectedPollutant={selectedPollutant}
          handleCloseModal={() => setShowPollutantModal(false)}
        />
      </section>
    </div>
  );
};

export default IspuPage;
