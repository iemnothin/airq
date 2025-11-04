// src/components/ProcessingPanel.jsx
import React, { useState } from "react";
import LoadingModal from "./LoadingModal";
import ForecastResultModal from "./ForecastResultModal";

const ProcessingPanel = ({ API_BASE, onProcessed }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const callEndpoint = async (path) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}${path}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Server error");
      }
      setResult(data);
      setShowResult(true);
      if (onProcessed) onProcessed(data);
    } catch (err) {
      console.error(err);
      alert("Gagal memproses model: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoadingModal show={loading} text="Now processing model..." />
      <div className="d-flex gap-2">
        <button
          className="btn btn-info btn-sm d-flex align-items-center gap-2"
          onClick={() => callEndpoint("/model/process-basic")}
          disabled={loading}
          title="Train model basic">
          <i className="fas fa-magic" />
          Process Basic
        </button>

        <button
          className="btn btn-success btn-sm d-flex align-items-center gap-2"
          onClick={() => callEndpoint("/model/process-advanced")}
          disabled={loading}
          title="Train model with holiday, seasonality and tuning">
          <i className="fas fa-cogs" />
          Process With Parameters
        </button>
      </div>

      <ForecastResultModal
        show={showResult}
        onClose={() => setShowResult(false)}
        result={result}
      />
    </>
  );
};

export default ProcessingPanel;
