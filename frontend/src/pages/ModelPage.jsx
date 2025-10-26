import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const ModelPage = () => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedData, setUploadedData] = useState([]); // data dari backend
  const [showToast, setShowToast] = useState(false);

  // 🔹 Ambil semua data dari backend saat halaman pertama kali dimuat
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/data"); // tanpa limit
        if (!res.ok) throw new Error("Gagal mengambil data");
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setUploadedData(data);
        } else {
          setUploadedData([]); // jika kosong, jangan tampilkan tabel
        }
      } catch (err) {
        console.error("Error fetch data:", err);
        setUploadedData([]); // error juga dianggap kosong
      }
    };

    fetchData();
  }, []);

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
        const res = await fetch("http://localhost:8000/api/data"); // tanpa limit
        const data = await res.json();
        setUploadedData(data);
      } else {
        alert("Upload gagal!");
      }
    };

    xhr.onerror = function () {
      alert("Terjadi kesalahan saat upload.");
      setIsUploading(false);
    };

    xhr.send(formData);
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

      {/* Tabel hasil upload */}
      {uploadedData.length > 0 && (
        <div className="mt-4">
          <h5 className="text-center mb-3 text-secondary">
            Data dari File yang Diupload
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
                {uploadedData.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((val, i) => (
                      <td key={i}>{val !== null ? val : "-"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelPage;
