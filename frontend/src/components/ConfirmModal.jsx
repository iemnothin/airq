// src/components/ConfirmModal.jsx
import React from "react";

const ConfirmModal = ({
  show,
  title,
  message,
  confirmText,
  cancelText = "Batal",
  loading,
  onClose,
  onConfirm,
  confirmBtnClass = "btn-danger",
}) => {
  if (!show) return null;

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}>
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          {/* HEADER */}
          <div className="modal-header bg-danger">
            <h4 className="modal-title w-100 text-center text-dark">
              {title}
            </h4>
            <button
              type="button"
              className="btn-close position-absolute end-0 me-3"
              onClick={onClose}
            />
          </div>

          {/* BODY */}
          <div className="modal-body text-center">
            <h5 className="text-dark">{message}</h5>
          </div>

          {/* FOOTER */}
          <div className="modal-footer d-flex justify-content-center gap-3">
            <button className="btn btn-secondary" onClick={onClose}>
              {cancelText}
            </button>

            <button
              className={`btn ${confirmBtnClass}`}
              onClick={onConfirm}
              disabled={loading}>
              {loading ? "Processing..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
