// src/components/ErrorToast.jsx
import "../css/ErrorToast.css";

const ErrorToast = ({ show, text }) => {
  if (!show) return null;

  return (
    <div
      className="position-fixed top-0 end-0 m-3"
      style={{ zIndex: 3000 }}
    >
      <div className="error-toast d-flex align-items-center">
        <div className="error-icon">✖</div>
        <div className="error-text">{text}</div>
      </div>
    </div>
  );
};

export default ErrorToast;
