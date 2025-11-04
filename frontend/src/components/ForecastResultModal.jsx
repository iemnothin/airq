// src/components/ForecastResultModal.jsx
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const ForecastResultModal = ({ show, onClose, result }) => {
  if (!show || !result) return null;
  const rows = result.forecast || [];
  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.45)" }} onClick={onClose}>
      <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">Forecast Result</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p className="small text-muted">{result.message}</p>
            <div className="table-responsive" style={{ maxHeight: "420px" }}>
              <table className="table table-sm table-bordered">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>yhat</th>
                    <th>lower</th>
                    <th>upper</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{r.ds}</td>
                      <td>{r.yhat}</td>
                      <td>{r.yhat_lower}</td>
                      <td>{r.yhat_upper}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-2">
              <pre style={{ whiteSpace: "pre-wrap" }}>
                Best params: {JSON.stringify(result.best_params || {}, null, 2)}
                {"\n"}MAPE: {result.mape ?? "N/A"}
              </pre>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForecastResultModal;
