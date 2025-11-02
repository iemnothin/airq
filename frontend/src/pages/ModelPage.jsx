import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/ModelPage.css";
import OutlierModal from "../components/OutlierModal";

import { fetchOutliers } from "../helpers/OutlierHelper";

const API_BASE = "http://localhost:8000/api/v1";

const ModelPage = ({ setError }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedData, setUploadedData] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [outliers, setOutliers] = useState([]);
  const [showOutlierModal, setShowOutlierModal] = useState(false);

  // Info cards
  const [info, setInfo] = useState({
    totalData: 0,
    outlierClear: true,
    nanClear: true,
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // Mapping key backend ke nama custom
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
    const hari = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
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
    return `${hari[date.getDay()]}, ${String(date.getDate()).padStart(
      2,
      "0"
    )} ${bulan[date.getMonth()]} ${date.getFullYear()}`;
  };

  // FETCH DATA & INFO
  const fetchUploadedData = async () => {
    try {
      const resData = await fetch(`${API_BASE}/data`);
      if (!resData.ok) throw new Error();
      const data = await resData.json();
      setUploadedData(Array.isArray(data) ? data : []);

      const resInfo = await fetch(`${API_BASE}/data/info`);
      if (!resInfo.ok) throw new Error();
      const infoData = await resInfo.json();
      setInfo({
        totalData: Array.isArray(data) ? data.length : 0,
        outlierClear: infoData.outlierClear,
        nanClear: infoData.nanClear,
      });
    } catch {
      setUploadedData([]);
      setInfo({ totalData: 0, outlierClear: true, nanClear: true });
      setError("⚠️ Aplikasi belum terhubung dengan server.");
    }
  };

  useEffect(() => {
    fetchUploadedData();
  }, [setError]);

  useEffect(() => {
    const getOutliers = async () => {
      const data = await fetchOutliers(API_BASE);
      setOutliers(data);
    };
    getOutliers();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadProgress(0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return alert("Pilih file CSV terlebih dahulu!");
    const formData = new FormData();
    formData.append("file", file);
    setIsUploading(true);
    setUploadProgress(0);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/upload-csv`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable)
        setUploadProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = async () => {
      setIsUploading(false);
      if (xhr.status !== 200) return alert("Upload gagal!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      fetchUploadedData();
    };
    xhr.onerror = () => {
      setError("Tidak dapat menghubungi backend.");
      setIsUploading(false);
    };
    xhr.send(formData);
  };

  const totalPages = Math.ceil(uploadedData.length / rowsPerPage);
  const indexFirst = (currentPage - 1) * rowsPerPage;
  const currentRows = uploadedData.slice(indexFirst, indexFirst + rowsPerPage);

  const getPageNumbers = () => {
    if (totalPages <= 5) return [...Array(totalPages).keys()].map((x) => x + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, "...", totalPages];
    if (currentPage >= totalPages - 2)
      return [
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  const handleOutlierClick = async () => {
    try {
      const data = await fetchOutliers(API_BASE); // fetchOutliers dari helper
      setOutliers(data);
      setShowOutlierModal(true);
    } catch (err) {
      setError("Gagal mengambil data outlier.");
    }
  };

  return (
    <>
      <div className="container px-0 py-4">
        <OutlierModal
          show={showOutlierModal}
          onClose={() => setShowOutlierModal(false)}
          outliers={outliers}
          outlierClear={info.outlierClear}
        />

        {/* ================= INFO CARDS ================= */}
        {uploadedData.length > 0 && (
          <div className="row mb-4">
            <div className="col-md-4 mb-2">
              <div className="card text-white bg-primary h-100">
                <div className="card-body d-flex align-items-center gap-3">
                  <i className="bi bi-database fs-2"></i>
                  <div>
                    <h6 className="card-title">Jumlah Data</h6>
                    <p className="card-text fs-5">{info.totalData}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-2">
              <div
                className={`card h-100 text-white ${
                  info.outlierClear ? "bg-success" : "bg-danger"
                }`}
                style={{ cursor: "pointer" }} // <-- ubah cursor biar terlihat klikable
                onClick={handleOutlierClick} // <-- event handler
              >
                <div className="card-body d-flex align-items-center gap-3">
                  <i
                    className={`bi ${
                      info.outlierClear
                        ? "bi-check-circle"
                        : "bi-exclamation-triangle"
                    } fs-2`}></i>
                  <div>
                    <h6 className="card-title">Status Outlier</h6>
                    <p className="card-text fs-5">
                      {info.outlierClear ? "Clear" : "Ada Outlier"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-2">
              <div
                className={`card h-100 text-white ${
                  info.nanClear ? "bg-success" : "bg-warning"
                }`}>
                <div className="card-body d-flex align-items-center gap-3">
                  <i
                    className={`bi ${
                      info.nanClear
                        ? "bi-check-circle"
                        : "bi-exclamation-triangle"
                    } fs-2`}></i>
                  <div>
                    <h6 className="card-title">Status NaN / Null</h6>
                    <p className="card-text fs-5">
                      {info.nanClear ? "Clear" : "Ada Null / NaN"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= UPLOAD & TABLE ================= */}
        {uploadedData.length > 0 ? (
          <div className="model-grid">
            {/* LEFT SIDE: Form Upload */}
            <div className="upload-side">
              <h5 className="text-center mb-4 text-success fw-bold">
                Upload Data Kualitas Udara (CSV)
              </h5>
              <form onSubmit={handleSubmit} className="upload-box">
                <div className="mb-3">
                  <input
                    type="file"
                    accept=".csv"
                    className="form-control model-file-input"
                    onChange={handleFileChange}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-success w-100"
                  disabled={isUploading}>
                  {isUploading ? "Mengupload..." : "Upload CSV"}
                </button>
                {isUploading && (
                  <div className="mt-3">
                    <div className="progress" style={{ height: "25px" }}>
                      <div
                        className="progress-bar progress-bar-striped progress-bar-animated bg-info"
                        style={{ width: `${uploadProgress}%` }}>
                        Upload File: {uploadProgress}%
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* RIGHT SIDE: Table */}
            <div className="table-side">
              <h5 className="text-center mb-3 text-secondary">
                Data Kualitas Udara Kota Bogor
              </h5>
              <small>(src: SPKU Tanah Sereal - kota bogor)</small>

              <div className="table-responsive" style={{ maxHeight: "500px" }}>
                <table className="table table-bordered table-striped">
                  <thead className="table-success">
                    <tr>
                      <th>No</th>
                      {Object.keys(uploadedData[0])
                        .filter((k) => k !== "id")
                        .map((key) => (
                          <th key={key}>{customHeaderMap[key] || key}</th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className={
                          outliers.some((o) => o.id === row.id)
                            ? "table-danger"
                            : ""
                        }>
                        <td>{indexFirst + idx + 1}</td>
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

              {/* Footer controls */}
              <div className="table-footer-controls">
                <div className="rows-select-wrapper">
                  <select
                    className="form-select rows-select"
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}>
                    <option value={10}>10 rows</option>
                    <option value={20}>20 rows</option>
                    <option value={50}>50 rows</option>
                    <option value={100}>100 rows</option>
                  </select>
                </div>
                <ul className="pagination pagination-centered">
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage((p) => p - 1)}>
                      Previous
                    </button>
                  </li>
                  {getPageNumbers().map((num, idx) =>
                    num === "..." ? (
                      <li key={idx} className="page-item disabled">
                        <span className="page-link">…</span>
                      </li>
                    ) : (
                      <li
                        key={idx}
                        className={`page-item ${
                          currentPage === num ? "active" : ""
                        }`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(num)}>
                          {num}
                        </button>
                      </li>
                    )
                  )}
                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage((p) => p + 1)}>
                      Next
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          // Centered form
          <form
            onSubmit={handleSubmit}
            className="upload-box mx-auto mt-3"
            style={{ maxWidth: "500px" }}>
            <div className="mb-3">
              <input
                type="file"
                accept=".csv"
                className="form-control model-file-input"
                onChange={handleFileChange}
              />
            </div>
            <button
              type="submit"
              className="btn btn-success w-100"
              disabled={isUploading}>
              {isUploading ? "Mengupload..." : "Upload CSV"}
            </button>
            {isUploading && (
              <div className="mt-3">
                <div className="progress" style={{ height: "25px" }}>
                  <div
                    className="progress-bar progress-bar-striped progress-bar-animated bg-info"
                    style={{ width: `${uploadProgress}%` }}>
                    Upload File: {uploadProgress}%
                  </div>
                </div>
              </div>
            )}
          </form>
        )}
      </div>

      {/* TOAST */}
      {showToast && (
        <div className="toast text-bg-success show position-fixed top-0 end-0 mt-3 me-2">
          <div className="d-flex">
            <div className="toast-body">✅ File berhasil diunggah!</div>
            <button
              className="btn-close btn-close-white me-2 m-auto"
              onClick={() => setShowToast(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ModelPage;
