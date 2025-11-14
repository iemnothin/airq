import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/ModelPage.css";
import OutlierModal from "../components/OutlierModal";
import NoFileModal from "../components/NoFileModal";
import { fetchOutliers, handleOutliers } from "../helpers/OutlierHelper";
import ProcessingPanel from "../components/ProcessingPanel";
import ConfirmModal from "../components/ConfirmModal";
import SuccessToast from "../components/SuccessToast";
import ErrorToast from "../components/ErrorToast";
import DragDropUpload from "../components/DragDropUpload";

const API_BASE = "https://airq.abiila.com/api/v1";

const ModelPage = ({ setError }) => {
  const [isClearingForecast, setIsClearingForecast] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [isHandlingOutlier, setIsHandlingOutlier] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedData, setUploadedData] = useState([]);
  const [outliers, setOutliers] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showOutlierModal, setShowOutlierModal] = useState(false);
  const [showNoFileModal, setShowNoFileModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showClearForecastModal, setShowClearForecastModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSingleUpload, setShowSingleUpload] = useState(false);
  const [forecastProgress, setForecastProgress] = useState(0);
  const [forecastMessage, setForecastMessage] = useState("");
  const [currentPollutant, setCurrentPollutant] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [searchDate, setSearchDate] = useState("");

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
      setUploadedData(Array.isArray(data.data) ? data.data : []);

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

  const filteredData = uploadedData.filter((row) => {
    if (!searchDate) return true; // kalau belum diisi, tampilkan semua
    const tanggalRow = new Date(row.waktu).toISOString().split("T")[0];
    return tanggalRow === searchDate;
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const indexFirst = (currentPage - 1) * rowsPerPage;
  const currentRows = filteredData.slice(indexFirst, indexFirst + rowsPerPage);

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
    setIsDeletingAll(true);
    try {
      const res = await fetch(`${API_BASE}/data/delete-all`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Gagal menghapus data");

      await fetchUploadedData();
      setOutliers([]);

      setShowDeleteModal(false);

      // ✅ Show success toast
      setToastMessage("Semua data berhasil dihapus!");
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (err) {
      console.error(err);
      setErrorMessage("❌ Gagal menghapus data!");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
    } finally {
      setIsDeletingAll(false);
    }
  };

  return (
    <>
      {/* TOAST */}
      <SuccessToast show={showSuccessToast} text={toastMessage} />
      <ErrorToast show={showErrorToast} text={errorMessage} />

      {/* Loading overlay untuk processing model dan upload */}
      {(isProcessing || isUploadingFile) && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column 
               align-items-center justify-content-center"
          style={{
            backgroundColor: "rgba(0,0,0,0.45)",
            zIndex: 2000,
            backdropFilter: "blur(3px)",
          }}>
          <div
            className="spinner-border text-light"
            style={{ width: "4rem", height: "4rem" }}></div>
          <p className="mt-3 text-white fs-5 fw-semibold">
            {isProcessing ? "Processing model..." : "Uploading file..."}
          </p>

          {/* Forecast progress per pollutant */}
          {isProcessing && (
            <>
              {currentPollutant && (
                <div className="text-white mb-2">
                  Currently processing: <strong>{currentPollutant}</strong>
                </div>
              )}

              <div className="progress mt-2" style={{ width: "250px" }}>
                <div
                  className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                  role="progressbar"
                  style={{
                    width: `${forecastProgress}%`,
                    transition: "width 0.3s ease",
                  }}
                  aria-valuenow={forecastProgress}
                  aria-valuemin="0"
                  aria-valuemax="100">
                  {forecastProgress.toFixed(0)}%
                </div>
              </div>

              {/* 🔴 Cancel Button */}
              <button
                className="btn btn-danger btn-sm mt-3 d-flex align-items-center gap-2"
                onClick={() => setShowCancelConfirm(true)}>
                <i className="fas fa-times-circle" />
                Cancel
              </button>

              {/* ⚠️ Cancel Confirmation Modal */}
              {showCancelConfirm && (
                <div
                  className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    zIndex: 3000,
                  }}>
                  <div
                    className="bg-white rounded p-4 shadow"
                    style={{ maxWidth: "400px" }}>
                    <h5 className="fw-bold text-center mb-3 text-danger">
                      Cancel Forecasting?
                    </h5>
                    <p className="text-center">
                      ⚠️ The current forecasting process will be stopped.
                    </p>

                    <div className="d-flex justify-content-center gap-2 mt-4">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setShowCancelConfirm(false)}>
                        Back
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          if (window.currentForecastStream) {
                            window.currentForecastStream.close();
                            window.currentForecastStream = null;
                            setForecastMessage("❌ Forecast canceled by user.");
                            setForecastProgress(0);
                            setCurrentPollutant("");
                            setShowCancelConfirm(false);
                            setTimeout(() => setIsProcessing(false), 500);
                          }
                        }}>
                        Yeah, do it.
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {isUploadingFile && uploadProgress > 0 && (
            <div className="progress mt-2" style={{ width: "200px" }}>
              <div
                className="progress-bar"
                role="progressbar"
                style={{ width: `${uploadProgress}%` }}
                aria-valuenow={uploadProgress}
                aria-valuemin="0"
                aria-valuemax="100">
                {uploadProgress}%
              </div>
            </div>
          )}
        </div>
      )}

      <div className="px-0 py-4 model-content-wrapper">
        <OutlierModal
          show={showOutlierModal}
          onClose={() => setShowOutlierModal(false)}
          outliers={outliers}
          outlierClear={info.outlierClear}
        />

        <NoFileModal
          show={showNoFileModal}
          onClose={() => setShowNoFileModal(false)}
        />

        {/* ================= INFO CARDS ================= */}
        {uploadedData.length > 0 && (
          <div className="row mb-4">
            {/* Jumlah Data */}
            <div className="col-12 col-md-4 mb-3">
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
            <div className="col-12 col-md-4 mb-3">
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
            <div className="col-12 col-md-4 mb-3">
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
          <div className="bg-white p-4 rounded shadow-sm">
            <div className="table-side">
              {/* ✅ Single Upload Section (Toggle-able) */}
              <div
                className="overflow-hidden"
                style={{
                  maxHeight: showSingleUpload ? "500px" : "0px",
                  transition: "max-height 0.4s ease",
                }}>
                {showSingleUpload && (
                  <div className="mb-4">
                    <DragDropUpload
                      apiBase={API_BASE}
                      onStart={() => {
                        setIsUploadingFile(true);
                        setUploadProgress(0);
                      }}
                      onProgress={(p) => setUploadProgress(p)}
                      onDone={async () => {
                        setIsUploadingFile(false);

                        setToastMessage("✅ File berhasil diunggah!");
                        setShowSuccessToast(true);
                        setTimeout(() => setShowSuccessToast(false), 3000);

                        await fetchUploadedData();
                        const updated = await fetchOutliers(API_BASE);
                        setOutliers(updated);
                      }}
                      onError={(err) => {
                        setIsUploadingFile(false);
                        setErrorMessage(err?.message || "Upload failed!");
                        setShowErrorToast(true);
                        setTimeout(() => setShowErrorToast(false), 4000);
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="d-flex flex-column justify-content-center align-items-center mb-3">
                <h5 className="text-center fs-4 fw-bold">
                  Data Kualitas Udara Kota Bogor
                </h5>

                <small className="text-muted">
                  Showing {filteredData.length} of {uploadedData.length} records
                  | (src: SPKU Tanah Sereal - Kota Bogor)
                </small>
              </div>

              {/* ================= SEARCH & ACTION PANEL ================= */}
              <div className="action-toolbar bg-white rounded p-2 mb-3 shadow-sm flex-wrap">
                {/* 🔍 Search Section */}
                <div className="search-toolbar d-flex flex-wrap align-items-center gap-2 mb-2 mb-md-0">
                  <label className="fw-bold text-secondary mb-0">
                    Search by Date:
                  </label>
                  <input
                    type="date"
                    className="form-control form-control-sm flex-grow-1 w-auto"
                    value={searchDate}
                    onChange={(e) => {
                      setSearchDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    style={{ maxWidth: "200px" }}
                  />
                  {searchDate && (
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => setSearchDate("")}>
                      <i className="fas fa-times"></i> Clear
                    </button>
                  )}
                </div>

                {/* ⚙️ Action Buttons */}
                {uploadedData.length > 0 && (
                  <div className="d-flex flex-wrap justify-content-center justify-content-md-end align-items-center gap-2 bg-sketch-secondary p-2 border rounded mobile-flex-stack w-100 w-md-auto">
                    {/* Upload New Data */}
                    <button
                      className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2"
                      onClick={() => setShowSingleUpload(!showSingleUpload)}
                      title="Upload new data">
                      <i
                        className={`fas ${
                          showSingleUpload ? "fa-times" : "fa-upload"
                        }`}></i>
                      {showSingleUpload ? "Close" : "New Data"}
                    </button>

                    {/* Processing Panel */}
                    <ProcessingPanel
                      API_BASE={API_BASE}
                      setIsProcessing={setIsProcessing}
                      onStart={() => setIsProcessing(true)}
                      onDone={(data) => {
                        setIsProcessing(false);
                        fetchUploadedData();
                        console.log("Processed result", data);
                        if (data && data.message) {
                          setToastMessage(data.message);
                          setShowSuccessToast(true);
                          setTimeout(() => setShowSuccessToast(false), 3500);
                        } else {
                          const errMsg =
                            (data && data.error) || "Failed to process model";
                          setErrorMessage(errMsg);
                          setShowErrorToast(true);
                          setTimeout(() => setShowErrorToast(false), 4500);
                        }
                      }}
                      setForecastProgress={setForecastProgress}
                      setForecastMessage={setForecastMessage}
                      setCurrentPollutant={setCurrentPollutant}
                    />

                    {/* Clear Forecast */}
                    <button
                      className="btn btn-danger btn-sm d-flex align-items-center justify-content-center gap-2"
                      onClick={() => setShowClearForecastModal(true)}
                      disabled={isClearingForecast}
                      title="Clear forecast table">
                      <i className="fas fa-trash-alt"></i>
                      {isClearingForecast ? "Clearing..." : "Clear Forecast"}
                    </button>

                    {/* Handle Outlier */}
                    {outliers.length > 0 && (
                      <button
                        className="btn btn-warning btn-sm d-flex align-items-center justify-content-center gap-1"
                        onClick={async () => {
                          setIsHandlingOutlier(true);
                          await handleOutliers(API_BASE);
                          await fetchUploadedData();
                          const updatedOutliers = await fetchOutliers(API_BASE);
                          setOutliers(updatedOutliers);
                          setIsHandlingOutlier(false);
                        }}
                        disabled={isHandlingOutlier}
                        title="Handle outlier data">
                        <i className="fas fa-hands-helping"></i>
                        {isHandlingOutlier
                          ? "Now handling..."
                          : "Handle Outlier"}
                      </button>
                    )}

                    {/* Delete All Data */}
                    <button
                      className="btn btn-danger btn-sm d-flex align-items-center justify-content-center gap-1"
                      onClick={() => setShowDeleteModal(true)}
                      disabled={isDeletingAll}>
                      <i className="fas fa-trash-alt"></i>
                      {isDeletingAll ? "Deleting..." : "Delete All"}
                    </button>

                    {/* Confirm Modals */}
                    <ConfirmModal
                      show={showDeleteModal}
                      onClose={() => setShowDeleteModal(false)}
                      title="Confirm Delete All Data"
                      message="⚠️ Are you sure you want to delete all data?"
                      confirmText="Yes, I'm sure"
                      loading={isDeletingAll}
                      onConfirm={handleDeleteAll}
                    />

                    <ConfirmModal
                      show={showClearForecastModal}
                      onClose={() => setShowClearForecastModal(false)}
                      title="Confirm Clear Forecast"
                      message="⚠️ Are you sure you want to delete all forecast data?"
                      confirmText="Yes, delete it"
                      loading={isClearingForecast}
                      onConfirm={async () => {
                        setIsClearingForecast(true);
                        try {
                          const res = await fetch(
                            `${API_BASE}/model/clear-forecast`,
                            {
                              method: "DELETE",
                            }
                          );
                          if (!res.ok)
                            throw new Error("Failed to clear forecast data");
                          setShowClearForecastModal(false);
                          setToastMessage(
                            "Forecast data successfully cleared!"
                          );
                          setShowSuccessToast(true);
                          setTimeout(() => setShowSuccessToast(false), 3000);
                        } catch (err) {
                          setErrorMessage("Failed to clear forecast data!");
                          setShowErrorToast(true);
                          setTimeout(() => setShowErrorToast(false), 3000);
                        } finally {
                          setIsClearingForecast(false);
                        }
                      }}
                    />
                  </div>
                )}
              </div>

              <div
                className="table-responsive shadow-sm rounded-3 border mt-3"
                style={{ maxHeight: "500px" }}>
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
                          searchDate &&
                          new Date(row.waktu).toISOString().split("T")[0] ===
                            searchDate
                            ? "table-info"
                            : ""
                        }>
                        <td>{indexFirst + idx + 1}</td>
                        {Object.entries(row)
                          .filter(([k]) => k !== "id")
                          .map(([key, val], i) => {
                            // Cek apakah cell ini adalah outlier
                            const isOutlier = outliers.some(
                              (o) =>
                                o.id === row.id &&
                                o.Kolom?.toLowerCase() === key.toLowerCase()
                            );

                            return (
                              <td
                                key={i}
                                className={
                                  isOutlier ? "table-danger fw-bold" : ""
                                }
                                title={isOutlier ? "Outlier detected" : ""}>
                                {key === "waktu"
                                  ? formatTanggalIndonesia(val)
                                  : val ?? "-"}
                              </td>
                            );
                          })}
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
          <>
            <div className="alert alert-warning text-center">
              ⚠️ Belum ada data diupload.
            </div>

            <DragDropUpload
              apiBase={API_BASE}
              onStart={() => {
                setIsUploadingFile(true);
                setUploadProgress(0);
              }}
              onProgress={(p) => {
                setUploadProgress(p);
              }}
              onDone={async (res) => {
                setIsUploadingFile(false);
                // Set success message and show toast
                setToastMessage(
                  "File berhasil diupload dan data telah dimuat!"
                );
                setShowSuccessToast(true);
                setTimeout(() => setShowSuccessToast(false), 3000);
                await fetchUploadedData();
                const outlierData = await fetchOutliers(API_BASE);
                setOutliers(outlierData);
              }}
              onError={(err) => {
                setIsUploadingFile(false);
                // show error toast (you asked to create an error toast earlier)
                setErrorMessage(err?.message || "Upload failed");
                setShowErrorToast(true); // reuse success toast component but show message; or create error toast component
                setTimeout(() => setShowErrorToast(false), 4000);
              }}
            />
          </>
        )}
      </div>
    </>
  );
};

export default ModelPage;
