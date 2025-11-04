// src/components/LoadingModal.jsx
import React from "react";
import "../css/ProcessingModal.css"; 

const LoadingModal = ({ show, text = "Processing..." }) => {
  if (!show) return null;
  return (
    <div
      className="pm-modal-backdrop d-block"
      onClick={(e) => e.stopPropagation()}
      role="presentation">
      <div className="pm-modal small popin">
        <div className="pm-modal-body d-flex align-items-center gap-3">
          <div
            className="spinner-border"
            role="status"
            aria-hidden="true"></div>
          <div>
            <div className="fw-bold">{text}</div>
            <div className="small text-muted">This may take a while</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingModal;
