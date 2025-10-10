import React from "react";

// Global shimmer style
const shimmerStyle = {
  background: "linear-gradient(90deg, #e0e0e0 25%, #f5f5f5 50%, #e0e0e0 75%)",
  backgroundSize: "200% 100%",
  animation: "skeletonShimmer 1.2s infinite",
};

// Skeleton untuk Card "Hari Ini" (Polutan saat ini)
export const SkeletonLoader = () => {
  return (
    <div className="col-sm-6 mb-3">
      <div
        className="card border-0"
        style={{
          backgroundColor: "#F3F5F7",
        }}>
        <div className="card-body text-start">
          <div
            style={{
              ...shimmerStyle,
              height: "16px",
              width: "60px",
              marginBottom: "8px",
              borderRadius: "4px",
            }}></div>
          <div
            style={{
              ...shimmerStyle,
              height: "10px",
              width: "100px",
              marginBottom: "8px",
              borderRadius: "4px",
            }}></div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
            <div
              style={{
                ...shimmerStyle,
                height: "20px",
                width: "40px",
                borderRadius: "4px",
              }}></div>
            <div
              style={{
                ...shimmerStyle,
                height: "10px",
                width: "30px",
                borderRadius: "4px",
              }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Skeleton untuk Card Forecast Harian
export const SkeletonLoaderForecast = ({ count = 7 }) => {
  return (
    <div
      className="card-container overflow-auto d-flex rounded"
      style={{ whiteSpace: "nowrap" }}>
      {[...Array(count)].map((_, index) => (
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
            style={{ backgroundColor: "#F3F5F7", border: "0px" }}>
            <div
              style={{
                ...shimmerStyle,
                height: "28px",
                width: "100px",
                margin: "0 auto",
                borderRadius: "14px",
              }}></div>
          </div>
          <div className="card-body">
            <table className="table table-sm">
              <tbody>
                {[...Array(7)].map((_, i) => (
                  <tr key={i}>
                    <td
                      className="border-0"
                      style={{ backgroundColor: "#F3F5F7" }}>
                      <div
                        style={{
                          ...shimmerStyle,
                          height: "12px",
                          width: "80px",
                          borderRadius: "6px",
                        }}></div>
                    </td>
                    <td
                      className="border-0"
                      style={{ backgroundColor: "#F3F5F7" }}>
                      <div
                        style={{
                          ...shimmerStyle,
                          height: "20px",
                          width: "30px",
                          borderRadius: "10px",
                        }}></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

// Skeleton untuk Card Main Pollutant
export const SkeletonMainPollutant = () => {
  return (
    <div className="mb-3">
      <div
        className="card"
        style={{
          border: "0px",
          backgroundColor: "#b0b0b0",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        }}>
        <div className="card-body text-start text-white">
          <div className="row d-flex justify-content-between">
            <div className="col-md-6">
              <div
                style={{
                  ...shimmerStyle,
                  height: "12px",
                  width: "80px",
                  marginBottom: "8px",
                  borderRadius: "4px",
                }}></div>
            </div>
          </div>

          <hr
            className="my-1"
            style={{
              backgroundColor: "#ffffff",
              borderWidth: "1px",
              borderRadius: "5px",
            }}
          />

          <div className="row d-flex justify-content-between">
            <div className="col-6 mb-0">
              <div
                style={{
                  ...shimmerStyle,
                  height: "12px",
                  width: "100px",
                  marginBottom: "6px",
                  borderRadius: "4px",
                }}></div>
              <div
                style={{
                  ...shimmerStyle,
                  height: "10px",
                  width: "140px",
                  borderRadius: "4px",
                }}></div>
            </div>
            <div className="col-6 text-end mb-0">
              <div
                style={{
                  ...shimmerStyle,
                  height: "14px",
                  width: "60px",
                  float: "right",
                  borderRadius: "4px",
                }}></div>
            </div>
          </div>
        </div>
        <div
          className="card-footer text-start text-dark"
          style={{
            fontSize: "10px",
            backgroundColor: "#F3F5F7",
          }}>
          <div
            style={{
              ...shimmerStyle,
              height: "10px",
              width: "130px",
              borderRadius: "4px",
            }}></div>
        </div>
      </div>
    </div>
  );
};
