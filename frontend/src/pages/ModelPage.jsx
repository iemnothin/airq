import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/ModelPage.css"; // ✅ tambahkan ini

const API_BASE = "http://localhost:8000/api/v1";

const ModelPage = ({ setError }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedData, setUploadedData] = useState([]);
  const [showToast, setShowToast] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // FETCH INITIAL DATA
  useEffect(() => {
    const fetchUploadedData = async () => {
      try {
        const res = await fetch(`${API_BASE}/data`);
        if (!res.ok) throw new Error();

        const data = await res.json();
        setUploadedData(Array.isArray(data) ? data : []);
      } catch {
        setUploadedData([]);
        setError("⚠️ Aplikasi kamu belum terhubung dengan server.");
      }
    };

    fetchUploadedData();
  }, [setError]);

  // FILE CHANGE
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadProgress(0);
  };

  // FILE UPLOAD
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
      if (e.lengthComputable) {
        setUploadProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = async () => {
      setIsUploading(false);
      if (xhr.status !== 200) return alert("Upload gagal!");

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      const res = await fetch(`${API_BASE}/data`);
      const data = await res.json();
      setUploadedData(data);
    };

    xhr.onerror = () => {
      setError("Tidak dapat menghubungi backend.");
      setIsUploading(false);
    };

    xhr.send(formData);
  };

  // PAGINATION
  const totalPages = Math.ceil(uploadedData.length / rowsPerPage);
  const indexFirst = (currentPage - 1) * rowsPerPage;
  const indexLast = indexFirst + rowsPerPage;
  const currentRows = uploadedData.slice(indexFirst, indexLast);

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

  return (
    <div className="container py-4 model-container">
      <h3 className="text-center mb-4 text-success fw-bold">
        Upload Data Kualitas Udara (CSV)
      </h3>

      {/* FILE UPLOAD */}
      <form onSubmit={handleSubmit}>
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

      {/* TOAST */}
      {showToast && (
        <div className="toast text-bg-success show position-fixed bottom-0 end-0 m-4">
          <div className="d-flex">
            <div className="toast-body">✅ File berhasil diunggah!</div>
            <button
              className="btn-close btn-close-white me-2 m-auto"
              onClick={() => setShowToast(false)}
            />
          </div>
        </div>
      )}

      {/* DATA TABLE */}
      {uploadedData.length > 0 && (
        <div className="mt-4">
          <h5 className="text-center mb-3 text-secondary">
            Data Kualitas Udara Kota Bogor
          </h5>
          <small>(src: SPKU Tanah Sereal - kota bogor)</small>

          <div className="table-responsive" style={{ maxHeight: "500px" }}>
            <table className="table table-bordered table-striped">
              <thead className="table-success">
                <tr>
                  {Object.keys(uploadedData[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentRows.map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((v, i) => (
                      <td key={i}>{v ?? "-"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-footer-controls">
            {/* ROWS PER PAGE */}
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

            {/* PAGINATION */}
            <ul className="pagination pagination-centered">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
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
      )}
    </div>
  );
};

export default ModelPage;
