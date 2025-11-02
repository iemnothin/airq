import React, { useEffect, useState } from "react";
import "../css/OutlierModal.css";
import "bootstrap/dist/css/bootstrap.min.css";

const customHeaderMap = {
  waktu: "Waktu",
  pm10: "PM10",
  pm25: "PM25",
  so2: "SO2",
  co: "CO",
  no2: "NO2",
  o3: "O3",
  hc: "HC",
  kelembaban: "Kelembaban",
  suhu: "Suhu",
};

const formatTanggalIndonesia = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const bulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return `${hari[date.getDay()]}, ${String(date.getDate()).padStart(2, "0")} ${
    bulan[date.getMonth()]
  } ${date.getFullYear()}`;
};

const OutlierModal = ({ show, onClose, outliers, outlierClear }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) setIsVisible(true);
  }, [show]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // delay agar animasi selesai
  };

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("outlier-modal-backdrop")) {
      handleClose();
    }
  };

  if (!show && !isVisible) return null;

  return (
    <div
      className={`modal show fade d-block outlier-modal-backdrop ${
        isVisible ? "fade-in" : "fade-out"
      }`}
      tabIndex="-1"
      onClick={handleBackdropClick}>
      <div className="modal-dialog modal-xl modal-dialog-centered outlier-modal-dialog">
        <div className="modal-content">
          <div
            className={`modal-header text-white ${
              outlierClear ? "bg-success" : "bg-danger"
            }`}>
            <h5 className="modal-title">Data Outlier</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}></button>
          </div>
          <div className="modal-body">
            {outliers.length === 0 ? (
              <p>Tidak ada data outlier.</p>
            ) : (
              <div className="table-responsive" style={{ maxHeight: "500px" }}>
                <table className="table table-bordered table-striped">
                  <thead className="table-danger">
                    <tr>
                      <th>No</th>
                      {Object.keys(outliers[0])
                        .filter((k) => k !== "id")
                        .map((key) => (
                          <th key={key}>{customHeaderMap[key] || key}</th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {outliers.map((row, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        {Object.entries(row)
                          .filter(([k]) => k !== "id")
                          .map(([key, val], i) => (
                            <td key={i}>
                              {key === "waktu"
                                ? formatTanggalIndonesia(val)
                                : val ?? "-"}
                            </td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={handleClose}>
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutlierModal;
