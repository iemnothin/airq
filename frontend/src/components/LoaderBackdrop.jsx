import React from "react";

const LoaderBackdrop = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        zIndex: 9999,
      }}>
      <div
        className="progress"
        style={{
          height: "6px",
          width: "100%",
          position: "absolute",
          top: 0,
        }}>
        <div
          className="progress-bar progress-bar-striped progress-bar-animated bg-info"
          role="progressbar"
          style={{ width: "100%" }}></div>
      </div>

      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}>
        <div
          className="spinner-border text-light"
          style={{ width: "3rem", height: "3rem" }}></div>
      </div>
    </div>
  );
};

export default LoaderBackdrop;
