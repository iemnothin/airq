import React from "react";
import { SkeletonMainPollutant } from "./SkeletonLoader";

const Header = ({
  currentTime,
  setShowModal,
  loading,
  currentAirQuality,
  getColorByISPU,
  getLevelByISPU,
  formatDate,
}) => {
  return (
    <header className="row d-flex justify-content-center justify-content-md-between align-items-start my-4 text-center">
      <div className="col-md-6 text-md-start">
        {/* Title Page */}
        <h3 className="mb-2">Kualitas Udara di Kota Bogor</h3>

        {/* Description Page */}
        <p className="text-muted" style={{ fontSize: "12px" }}>
          Indeks kualitas udara di Kota Bogor
          <span className="text-muted mx-1">•</span>
          {currentTime.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>

        {/* Prediction Button (Desktop) */}
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-sm my-2 d-md-block d-none"
          style={{ backgroundColor: "#332D56", color: "white" }}
          disabled={loading}>
          {loading ? "Loading..." : "Prediksi"}
        </button>
      </div>

      <div className="col-8 col-md-5 col-lg-3">
        <div className="card-body">
          {Object.keys(currentAirQuality).length === 0 ? (
            <SkeletonMainPollutant />
          ) : (
            Object.keys(currentAirQuality)
              .filter((pollutant) => pollutant === "PM25")
              .map((pollutant) => {
                const airQualityData = currentAirQuality[pollutant];
                return {
                  pollutant,
                  timestamp: airQualityData.timestamp,
                  prediction: airQualityData.prediction,
                };
              })
              // .sort((a, b) => b.prediction - a.prediction)
              // .slice(0, 1)
              .map(({ pollutant, timestamp, prediction }) => {
                const color = getColorByISPU(prediction);
                const level = getLevelByISPU(prediction);
                // Polutan Utama
                return (
                  <div key={pollutant} className="mb-3">
                    <div
                      className="card"
                      style={{
                        border: "0px",
                        backgroundColor: color,
                        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                      }}>
                      <div className="card-body text-start text-white pb-0">
                        <div className="row d-flex justify-content-between">
                          <div className="col-md-6">
                            <p
                              className="fw-bold mb-0"
                              style={{ fontSize: "12px" }}>
                              {level}
                            </p>
                          </div>
                        </div>

                        <hr
                          className="my-1"
                          style={{
                            backgroundColor: "#FFFFFF",
                            borderWidth: "1px",
                            borderRadius: "5px",
                          }}
                        />

                        <div className="row d-flex justify-content-between">
                          <div className="col-6 mb-0">
                            <p className="mb-0" style={{ fontSize: "12px" }}>
                              Polutan Utama:{" "}
                              <span className="fw-bold">{pollutant}</span>
                            </p>
                            <p style={{ fontSize: "10px" }}>
                              {getPollutantDescription(pollutant)}
                            </p>
                          </div>
                          <div className="col-6 text-end mb-0">
                            <p className="fw-bold" style={{ fontSize: "12px" }}>
                              {prediction} µg/m³
                            </p>
                          </div>
                        </div>
                      </div>
                      <div
                        className="card-footer text-start text-dark"
                        style={{
                          fontSize: "10px",
                          backgroundColor: "#F3F5F7",
                        }}>
                        Diperbarui: <strong>{formatDate(timestamp)}</strong>
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* Prediction Button (Mobile) */}
      <div className="col-md-6 d-flex justify-content-center">
        <button
          onClick={() => setShowModal(true)}
          className="w-50 btn btn-sm my-2 d-block d-md-none"
          disabled={loading}
          style={{ backgroundColor: "#7E99A3", color: "white" }}>
          {loading ? "Loading..." : "Prediksi"}
        </button>
      </div>
    </header>
  );
};

// Helper function for polutan description
function getPollutantDescription(pollutant) {
  switch (pollutant) {
    case "CO":
      return "Karbon Monoksida";
    case "HC":
      return "Hidrokarbon";
    case "NO2":
      return "Nitrogen Dioksida";
    case "O3":
      return "Ozon";
    case "PM10":
      return "Materi Partikulat di bawah 10 mikron";
    case "PM25":
      return "Partikel halus di bawah 2,5 mikron";
    case "SO2":
      return "Sulfur Dioksida";
    default:
      return "Polutan tidak terdefinisi";
  }
}

export default Header;
