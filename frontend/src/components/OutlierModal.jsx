// src/components/OutlierModal.jsx
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

const OutlierModal = ({ show, onClose, outliers, onHandle, loading }) => {
  if (!show) return null;

  return (
    <div
      className="modal show fade d-block"
      tabIndex="-1"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        width: "100vw",
        height: "100vh",
      }}
      onClick={onClose} // klik backdrop tutup modal
    >
      <div
        className="modal-dialog modal-xl modal-dialog-centered"
        onClick={(e) => e.stopPropagation()} // cegah klik di konten tutup modal
      >
        <div className="modal-content">
          <div className="modal-header bg-danger text-white">
            <h5 className="modal-title">Data Outlier</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}></button>
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
            {/* {outliers.length > 0 && (
              <button
                className="btn btn-warning"
                onClick={onHandle}
                disabled={loading}>
                {loading ? "Now handling outlier..." : "Tangani"}
              </button>
            )} */}
            <button className="btn btn-secondary" onClick={onClose}>
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutlierModal;
