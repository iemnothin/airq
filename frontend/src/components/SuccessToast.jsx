// src/components/SuccessToast.jsx
import "../css/SuccessToast.css";

const SuccessToast = ({ show, text }) => {
  if (!show) return null;

  return (
    <div className="success-toast">
      <div className="success-check">
        <svg viewBox="0 0 52 52">
          <path
            className="success-checkmark"
            fill="none"
            d="M14 27l7 7 17-17"
          />
        </svg>
      </div>
      <p className="success-text mb-1">{text}</p>
    </div>
  );
};

export default SuccessToast;
