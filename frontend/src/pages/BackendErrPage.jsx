import React from "react";
import "../css/BackendErrPage.css";
import "animate.css";

const BackendErrPage = ({ message, onRetry }) => {
  return (
    <div className="backend-error-wrapper">
      <div className="backend-error-card animate__fadeIn">
        <div className="icon-wrapper float-animation">
          <i className="fas fa-server"></i>
        </div>

        <h3 className="error-title">Server Offline</h3>
        <p className="error-message">
          {message || "Backend belum terhubung atau sedang offline."}
        </p>

        <button className="retry-btn" onClick={onRetry}>
          🔄 Coba Lagi
        </button>
      </div>
    </div>
  );
};

export default BackendErrPage;
