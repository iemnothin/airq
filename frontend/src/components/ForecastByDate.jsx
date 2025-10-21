import React from "react";

const ForecastByDate = ({
  showModal,
  setShowModal,
  selectedDate,
  setSelectedDate,
  getPrediction,
  specificDatePrediction,
  loading,
  progress,
  getColorByISPU,
  getLevelByISPU,
}) => {
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <>
      {showModal && (
        <div
          className="overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1040,
          }}
          onClick={() => setShowModal(false)}
        />
      )}

      <div
        className={`modal fade ${showModal ? "show" : ""}`}
        tabIndex="-1"
        style={{ display: showModal ? "block" : "none", zIndex: 1050 }}
        onClick={() => setShowModal(false)}>
        <div className="modal-dialog" onClick={handleModalClick}>
          <div className="modal-content">
            <div className="modal-header">
              <h6 className="modal-title">Prediksi ISPU Berdasarkan Tanggal</h6>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowModal(false)}></button>
            </div>

            <div className="modal-body">
              <section>
                <label
                  htmlFor="datePicker"
                  className="form-label"
                  style={{ fontSize: "14px" }}>
                  Pilih Tanggal:
                </label>

                <div className="d-flex justify-content-between">
                  <div className="w-100">
                    <input
                      type="date"
                      id="datePicker"
                      className="form-control"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>
                  <div className="ms-2">
                    <button
                      onClick={getPrediction}
                      className="btn btn-sm mt-1"
                      style={{ backgroundColor: "#332D56", color: "white" }}
                      disabled={loading}>
                      {loading ? "Memproses model..." : "Prediksi"}
                    </button>
                    {loading && (
                      <div className="w-100 mt-3">
                        <div
                          style={{
                            width: "100%",
                            backgroundColor: "#ddd",
                            borderRadius: "5px",
                            overflow: "hidden",
                          }}>
                          <div
                            style={{
                              width: `${progress}%`,
                              height: "20px",
                              backgroundColor: "#4caf50",
                              textAlign: "center",
                              color: "white",
                              fontSize: "12px",
                              transition: "width 0.2s ease",
                            }}>
                            {progress}%
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  {Array.isArray(specificDatePrediction) ? (
                    <div className="row overflow-x-auto">
                      <h6>Hasil Prediksi:</h6>
                      {specificDatePrediction
                        .slice(0, 6)
                        .map(({ pollutant, prediction }) => {
                          const adjustedPrediction = prediction
                            ? Math.max(parseInt(prediction, 10), 0)
                            : 0;

                          const color = getColorByISPU(adjustedPrediction);
                          const level = getLevelByISPU(adjustedPrediction);

                          const pollutantDescriptions = {
                            CO: "Karbon Monoksida",
                            HC: "Hidrokarbon",
                            NO2: "Nitrogen Dioksida",
                            O3: "Ozon",
                            PM10: "Materi Partikulat di bawah 10 mikron",
                            PM25: "Partikel halus di bawah 2,5 mikron",
                            SO2: "Sulfur Dioksida",
                          };

                          return (
                            <div key={pollutant} className="col-md-6 mb-3">
                              <div
                                className="card"
                                style={{
                                  border: "0px",
                                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                                }}>
                                <div
                                  className="card-body text-start pb-0"
                                  style={{
                                    backgroundColor: "#E3EEB2",
                                    borderRadius: "8px",
                                    color: "#4E6688",
                                  }}>
                                  <h6 className="card-title mb-0">
                                    {pollutant}
                                  </h6>
                                  <p style={{ fontSize: "10px" }}>
                                    {pollutantDescriptions[pollutant] ||
                                      "Polutan tidak terdefinisi"}
                                  </p>
                                  <p
                                    className="badge"
                                    style={{ backgroundColor: color }}>
                                    {adjustedPrediction.toLocaleString()}
                                  </p>
                                  <span
                                    className="ms-2"
                                    style={{ fontSize: "10px" }}>
                                    µg/m³
                                  </span>

                                  <p
                                    className="badge text-start"
                                    style={{
                                      fontSize: "10px",
                                      backgroundColor: color,
                                      color: "#FFFFFF",
                                      fontWeight: "500",
                                      width: "100%",
                                    }}>
                                    Status:{" "}
                                    <span
                                      className="fw-bold"
                                      style={{ color: "#FFFFFF" }}>
                                      {level}
                                    </span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <p>{specificDatePrediction}</p>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForecastByDate;
