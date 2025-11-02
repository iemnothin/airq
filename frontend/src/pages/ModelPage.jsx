import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/ModelPage.css";
import OutlierModal from "../components/OutlierModal";
import { fetchOutliers, handleOutliers } from "../helpers/OutlierHelper";

const API_BASE = "http://localhost:8000/api/v1";

const ModelPage = ({ setError }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedData, setUploadedData] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [outliers, setOutliers] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
        totalData: infoData.totalData,
        outlierClear: infoData.outlierClear,
        nanClear: infoData.nanClear,
        outlierCount: infoData.outlierCount ?? 0, // default 0
        nanCount: infoData.nanCount ?? 0, // default 0
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
      // Ambil outlier terbaru
      const outlierData = await fetchOutliers(API_BASE);
      setOutliers(outlierData);
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

  const handleDeleteAll = async () => {
    setIsUploading(true);
    try {
      const res = await fetch(`${API_BASE}/data/delete-all`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus data");
      await fetchUploadedData();
      setOutliers([]);
      setShowDeleteModal(false); // tutup modal setelah sukses
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus data."); // bisa diganti toast nanti
    } finally {
      setIsUploading(false);
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
            {/* Jumlah Data */}
            <div className="col-md-4 mb-2">
              <div className="card bg-primary h-100">
                <div className="card-body d-flex align-items-center gap-3">
                  <i className="fas fa-database fs-2"></i>
                  <div>
                    <h5 className="card-title fw-bold">Jumlah Data</h5>
                    <p className="card-text fs-5">{info.totalData}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Outlier */}
            <div className="col-md-4 mb-2">
              <div
                className={`card h-100 text-white ${
                  info.outlierCount === 0 ? "bg-success" : "bg-danger"
                }`}
                style={{ cursor: "pointer" }}
                onClick={handleOutlierClick}>
                <div className="card-body d-flex align-items-center gap-3">
                  <i
                    className={`fas ${
                      info.outlierCount === 0
                        ? "fa-check-circle"
                        : "fa-exclamation-triangle"
                    } fs-2`}></i>
                  <div>
                    <h5 className="card-title fw-bold">Status Outlier</h5>
                    <p className="card-text fs-5">
                      {info.outlierCount === 0
                        ? "Clear"
                        : `${info.outlierCount} data`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status NaN / Null */}
            <div className="col-md-4 mb-2">
              <div
                className={`card h-100 text-white ${
                  info.nanCount === 0 ? "bg-success" : "bg-warning"
                }`}>
                <div className="card-body d-flex align-items-center gap-3">
                  <i
                    className={`fas ${
                      info.nanCount === 0
                        ? "fa-check-circle"
                        : "fa-exclamation-triangle"
                    } fs-2`}></i>
                  <div>
                    <h5 className="card-title fw-bold">Status NaN / Null</h5>
                    <p className="card-text fs-5">
                      {info.nanCount === 0 ? "Clear" : `${info.nanCount} data`}
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
            <div
              className="upload-side p-4 rounded shadow"
              style={{ backgroundColor: "#f8f9fa" }}>
              <p
                className="text-center mb-4 fs-5 fw-bold"
                style={{ color: "#3B82F6" }}>
                Upload Data Kualitas Udara (CSV)
              </p>
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
              <h5
                className="text-center mb-3 fs-5 fw-bold"
                style={{ color: "#3B82F6" }}>
                Data Kualitas Udara Kota Bogor
              </h5>

              {/* ===== Tombol Tangani & Hapus Outlier ===== */}
              {uploadedData.length > 0 && (
                <div className="d-flex justify-content-between gap-3 mb-2">
                  <small className="text-secondary fw-bold">
                    (src: SPKU Tanah Sereal - Kota Bogor)
                  </small>

                  <div className="d-flex flex-row align-items-center justify-content-center gap-2">
                    {/* Tangani Outlier */}
                    {outliers.length > 0 && (
                      <button
                        className="btn btn-warning btn-sm d-flex align-items-center justify-content-center gap-1"
                        style={{ minWidth: "150px" }}
                        onClick={async () => {
                          setIsUploading(true);
                          await handleOutliers(API_BASE);
                          await fetchUploadedData();
                          const updatedOutliers = await fetchOutliers(API_BASE);
                          setOutliers(updatedOutliers);
                          setIsUploading(false);
                        }}
                        disabled={isUploading}>
                        <i className="fas fa-cogs"></i>
                        {isUploading ? "Now handling..." : "Handle Outlier"}
                      </button>
                    )}

                    {/* Hapus Semua Data */}
                    <button
                      className="btn btn-danger btn-sm d-flex align-items-center justify-content-center gap-1"
                      style={{ minWidth: "150px" }}
                      onClick={() => setShowDeleteModal(true)}
                      disabled={isUploading}>
                      <i className="fas fa-trash-alt"></i>
                      {isUploading ? "Deleting..." : "Hapus Data"}
                    </button>

                    {/* Modal Konfirmasi */}
                    {showDeleteModal && (
                      <div
                        className="modal show d-block"
                        tabIndex="-1"
                        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                        onClick={() => setShowDeleteModal(false)}>
                        <div
                          className="modal-dialog modal-dialog-centered"
                          onClick={(e) => e.stopPropagation()}>
                          <div className="modal-content">
                            <div className="modal-header bg-danger text-white">
                              <h5 className="modal-title">
                                Konfirmasi Hapus Data
                              </h5>
                              <button
                                type="button"
                                className="btn-close"
                                onClick={() =>
                                  setShowDeleteModal(false)
                                }></button>
                            </div>
                            <div className="modal-body">
                              <p>⚠️ Yakin ingin menghapus semua data?</p>
                            </div>
                            <div className="modal-footer">
                              <button
                                className="btn btn-secondary"
                                onClick={() => setShowDeleteModal(false)}>
                                Batal
                              </button>
                              <button
                                className="btn btn-danger"
                                onClick={handleDeleteAll}
                                disabled={isUploading}>
                                {isUploading ? "Deleting..." : "Hapus"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

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
          <>
            <h3
              className="text-center mb-4 fw-bold"
              style={{ color: "#3B82F6" }}>
              Upload Data Kualitas Udara (CSV)
            </h3>
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
          </>
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
