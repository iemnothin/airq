// src/components/NoFileModal.jsx
import "../css/NoFileModal.css"; // Tambahkan CSS animasi

const NoFileModal = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div className="modal-backdrop-custom" onClick={onClose}>
      <div
        className="modal-dialog modal-sm modal-dialog-centered modal-pop"
        onClick={(e) => e.stopPropagation()}>
        <div className="modal-content shadow-lg border-0 rounded-3">
          <div className="modal-header bg-warning text-dark p-3">
            <h6 className="modal-title fw-bold">Tidak Ada File</h6>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}></button>
          </div>

          <div className="modal-body small p-3">
            ⚠️ Silakan pilih file CSV terlebih dahulu.
          </div>

          <div className="modal-footer p-3">
            <button className="btn btn-warning btn-sm w-100" onClick={onClose}>
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoFileModal;
