import React from "react";
import "../css/SkeletonLoader.css";
/* ======================================================
   ✅ 1. PREMIUM Skeleton untuk TODAY CARD
   ====================================================== */
export const SkeletonLoader = () => {
  return (
    <div className="col-12 col-sm-6 mb-3 fade-in">
      <div
        className="card border-0 shadow-sm w-100"
        style={{
          background: "rgba(255, 255, 255, 0.4)",
          backdropFilter: "blur(12px)",
          borderRadius: "16px",
        }}>
        <div className="card-body">
          <div
            className="premium-skeleton mb-2"
            style={{ height: "18px", width: "45%" }}></div>

          <div
            className="premium-skeleton mb-3"
            style={{ height: "12px", width: "70%" }}></div>

          <div className="d-flex gap-3 align-items-center">
            <div
              className="premium-skeleton"
              style={{ height: "24px", width: "25%" }}></div>

            <div
              className="premium-skeleton"
              style={{ height: "12px", width: "15%" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ======================================================
   ✅ 2. PREMIUM Skeleton untuk DAILY FORECAST HORIZONTAL
   ====================================================== */
export const SkeletonLoaderForecast = ({ count = 7 }) => {
  return (
    <div className="d-flex overflow-auto py-2 fade-in">
      {[...Array(count)].map((_, index) => (
        <div
          key={index}
          className="card mx-2 shadow-sm"
          style={{
            minWidth: "170px",
            borderRadius: "16px",
            background: "rgba(255, 255, 255, 0.35)",
            backdropFilter: "blur(12px)",
            border: 0,
          }}>
          <div className="card-body text-center">
            <div
              className="premium-skeleton mx-auto mb-3"
              style={{ height: "22px", width: "60%" }}></div>

            {[...Array(6)].map((_, i) => (
              <div key={i} className="d-flex justify-content-between mb-2 px-1">
                <div
                  className="premium-skeleton"
                  style={{ height: "14px", width: "55%" }}></div>
                <div
                  className="premium-skeleton"
                  style={{ height: "14px", width: "22%" }}></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ======================================================
   ✅ 3. PREMIUM Skeleton untuk MAIN POLLUTANT CARD
   ====================================================== */
export const SkeletonMainPollutant = () => {
  return (
    <div className="mb-3 fade-in">
      <div
        className="card shadow-sm"
        style={{
          borderRadius: "18px",
          background: "rgba(0, 0, 0, 0.35)",
          backdropFilter: "blur(14px)",
          color: "#fff",
          border: 0,
        }}>
        <div className="card-body">
          <div
            className="premium-skeleton mb-3"
            style={{ height: "14px", width: "40%" }}></div>

          <div className="row">
            <div className="col-7">
              <div
                className="premium-skeleton mb-2"
                style={{ height: "14px", width: "85%" }}></div>

              <div
                className="premium-skeleton"
                style={{ height: "10px", width: "100%" }}></div>
            </div>

            <div className="col-5 text-end">
              <div
                className="premium-skeleton"
                style={{
                  height: "14px",
                  width: "45%",
                  float: "right",
                }}></div>
            </div>
          </div>
        </div>

        <div
          className="card-footer"
          style={{
            borderRadius: "0 0 18px 18px",
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(10px)",
            border: 0,
          }}>
          <div
            className="premium-skeleton"
            style={{ height: "10px", width: "50%" }}></div>
        </div>
      </div>
    </div>
  );
};
