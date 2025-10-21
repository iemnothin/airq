import React from "react";
import { SkeletonLoaderForecast } from "./SkeletonLoader";

// const SkeletonLoader = () => {
//   const shimmerStyle = {
//     height: "12px",
//     width: "120px",
//     borderRadius: "6px",
//     background: "linear-gradient(90deg, #e0e0e0 25%, #f5f5f5 50%, #e0e0e0 75%)",
//     backgroundSize: "200% 100%",
//     animation: "skeletonShimmer 1.2s infinite",
//     margin: "0 auto",
//   };

//   return (
//     <div className="text-center w-100">
//       <div style={shimmerStyle}></div>
//     </div>
//   );
// };

const DailyPredictionCard = ({ forecast, formatDate, getColorByISPU }) => {
  return (
    <section className="my-2 col-md-6 col-lg-6">
      <div className="row">
        <div className="card pb-3">
          <h6 className="card-title text-start my-3">Prediksi setiap hari</h6>

          {Object.keys(forecast).length === 0 ? (
            <>
              {[...Array(1)].map((_, index) => (
                <SkeletonLoaderForecast key={index} />
              ))}
            </>
          ) : (
            <div
              className="card-container overflow-auto d-flex rounded"
              style={{ whiteSpace: "nowrap" }}>
              {forecast[Object.keys(forecast)[0]].map((entry, index) => (
                <div
                  key={index}
                  className="card mx-2 mb-4"
                  style={{
                    minWidth: "200px",
                    border: "0px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    backgroundColor: "#F3F5F7",
                  }}>
                  <div
                    className="card-header text-center pb-0"
                    style={{ border: "0px", backgroundColor: "#F3F5F7" }}>
                    <span
                      className="badge text-dark"
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: "10px",
                        boxShadow: "inset 0 0 6px rgba(0, 0, 0, 0.2)",
                        fontSize: "14px",
                        padding: "8px 12px",
                      }}>
                      {formatDate(entry.date)}
                    </span>
                  </div>
                  <div className="card-body">
                    <table className="table table-sm">
                      <tbody>
                        {Object.keys(forecast).map((pollutant) => {
                          const dayForecast = forecast[pollutant].find(
                            (f) => f.date === entry.date
                          );
                          const ispu = dayForecast
                            ? dayForecast.yhat <= 0
                              ? 0
                              : dayForecast.yhat
                            : "-";
                          const color = getColorByISPU(ispu);

                          return (
                            <tr key={pollutant}>
                              <td
                                className="border-0"
                                style={{ backgroundColor: "#F3F5F7" }}>
                                {pollutant === "CO" && (
                                  <i
                                    style={{
                                      marginRight: "10px",
                                      fontStyle: "normal",
                                    }}>
                                    🚗
                                  </i>
                                )}
                                {pollutant === "O3" && (
                                  <i
                                    style={{
                                      marginRight: "10px",
                                      fontStyle: "normal",
                                    }}>
                                    🌞
                                  </i>
                                )}
                                {pollutant === "NO2" && (
                                  <i
                                    style={{
                                      marginRight: "10px",
                                      fontStyle: "normal",
                                    }}>
                                    🏭
                                  </i>
                                )}
                                {pollutant === "HC" && (
                                  <i
                                    style={{
                                      marginRight: "10px",
                                      fontStyle: "normal",
                                    }}>
                                    🛢️{" "}
                                  </i>
                                )}
                                {pollutant === "PM10" && (
                                  <i
                                    style={{
                                      marginRight: "10px",
                                      fontStyle: "normal",
                                    }}>
                                    💨
                                  </i>
                                )}
                                {pollutant === "PM25" && (
                                  <i
                                    style={{
                                      marginRight: "10px",
                                      fontStyle: "normal",
                                    }}>
                                    ⚙️
                                  </i>
                                )}
                                {pollutant === "SO2" && (
                                  <i
                                    style={{
                                      marginRight: "10px",
                                      fontStyle: "normal",
                                    }}>
                                    🌫️
                                  </i>
                                )}
                                {pollutant}
                              </td>

                              <td
                                className="border-0"
                                style={{ backgroundColor: "#F3F5F7" }}>
                                <p
                                  className="badge"
                                  style={{
                                    margin: 0,
                                    backgroundColor: color,
                                  }}>
                                  {ispu ?? "-"}
                                </p>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default DailyPredictionCard;
