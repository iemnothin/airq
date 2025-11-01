import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const ModelPage = ({ setError }) => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedData, setUploadedData] = useState([]); // data dari backend
  const [showToast, setShowToast] = useState(false);
  // const [errorMessage, setErrorMessage] = useState(null);

  // 🔹 Ambil semua data dari backend saat halaman pertama kali dimuat
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/data");

        if (!res.ok) throw new Error("Gagal mengambil data");
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          setUploadedData(data);
        } else {
          setUploadedData([]);
        }
      } catch (err) {
        console.error("Error fetch data:", err);
        setUploadedData([]);
        setError("⚠️ Aplikasi kamu belum terhubung dengan server.");
      }
    };

    fetchData();
  }, [setError]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadProgress(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Pilih file CSV terlebih dahulu!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    setUploadProgress(0);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:8000/api/v1/upload-csv", true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    };

    xhr.onload = async function () {
      setIsUploading(false);
      if (xhr.status === 200) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);

        // Ambil data terbaru dari server setelah upload sukses
        const res = await fetch("http://localhost:8000/api/v1/data");
        const data = await res.json();
        setUploadedData(data);
      } else {
        alert("Upload gagal!");
      }
    };

    xhr.onerror = function () {
      setError("Tidak dapat menghubungi backend. Pastikan server hidup.");
      setIsUploading(false);
    };

    xhr.send(formData);
  };

  // ✅ Pagination Premium
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = uploadedData.slice(indexOfFirstRow, indexOfLastRow);

  const totalPages = Math.ceil(uploadedData.length / rowsPerPage);

  // Helper untuk menampilkan 5 halaman di tengah
  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }

    return pages;
  };

  return (
    <div className="container py-4" style={{ maxWidth: "900px" }}>
      <h3 className="text-center mb-4 text-success fw-bold">
        Upload Data Kualitas Udara (CSV)
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="file"
            accept=".csv"
            className="form-control"
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
                role="progressbar"
                style={{ width: `${uploadProgress}%` }}>
                Upload File: {uploadProgress}%
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Toast sukses */}
      {showToast && (
        <div
          className="toast align-items-center text-bg-success border-0 show position-fixed bottom-0 end-0 m-4"
          role="alert">
          <div className="d-flex">
            <div className="toast-body">
              ✅ File berhasil diunggah & disimpan!
            </div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              onClick={() => setShowToast(false)}></button>
          </div>
        </div>
      )}

      {/* {errorMessage && (
        <div className="alert alert-danger text-center mt-2">
          {errorMessage}
        </div>
      )} */}

      {/* Tabel hasil upload */}
      {uploadedData.length > 0 && (
        <div className="mt-4">
          <h5 className="text-center mb-3 text-secondary">
            Data Kualitas Udara Kota Bogor
          </h5>

          <div
            className="table-responsive"
            style={{ maxHeight: "500px", overflowY: "auto" }}>
            <table className="table table-bordered table-striped">
              <thead className="table-success">
                <tr>
                  {Object.keys(uploadedData[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {currentRows.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((val, i) => (
                      <td key={i}>{val !== null ? val : "-"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* ✅ Pagination Controls */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            {/* ROWS PER PAGE */}
            <div>
              <select
                className="form-select"
                style={{ width: "120px" }}
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value));
                  setCurrentPage(1);
                }}>
                <option value="10">10 rows</option>
                <option value="20">20 rows</option>
                <option value="50">50 rows</option>
                <option value="100">100 rows</option>
              </select>
            </div>

            {/* PAGINATION */}
            <nav>
              <ul className="pagination mb-0">
                {/* Previous */}
                <li
                  className={`page-item ${
                    currentPage === 1 ? "disabled" : ""
                  }`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((prev) => prev - 1)}>
                    Previous
                  </button>
                </li>

                {/* Numbered pages with ellipsis */}
                {getPageNumbers().map((page, index) =>
                  page === "..." ? (
                    <li key={index} className="page-item disabled">
                      <span className="page-link">...</span>
                    </li>
                  ) : (
                    <li
                      key={index}
                      className={`page-item ${
                        currentPage === page ? "active" : ""
                      }`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(page)}>
                        {page}
                      </button>
                    </li>
                  )
                )}

                {/* Next */}
                <li
                  className={`page-item ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((prev) => prev + 1)}>
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          <small>(src: spku tanah sereal - kota bogor)</small>
        </div>
      )}
    </div>
  );
};

export default ModelPage;
