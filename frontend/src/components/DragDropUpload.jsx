import React, { useRef, useState } from "react";
import PropTypes from "prop-types";

/**
 * DragDropUpload
 *
 * Props:
 * - apiBase (string) : base API URL, e.g. "http://localhost:8000/api/v1"
 * - onStart()        : optional callback saat upload mulai
 * - onProgress(pct)  : optional callback progress (0-100)
 * - onDone(response) : optional callback ketika upload sukses (response JSON)
 * - onError(err)     : optional callback ketika error
 * - accept (string)  : file accept string, default ".csv"
 */
const DragDropUpload = ({
  apiBase,
  onStart = () => {},
  onProgress = () => {},
  onDone = () => {},
  onError = () => {},
  accept = ".csv",
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [filename, setFilename] = useState(null);
  const inputRef = useRef();

  const uploadFile = (file) => {
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      onError(new Error("File must be .csv"));
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    onStart();
    onProgress(0);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${apiBase}/upload-csv`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        onProgress(pct);
      }
    };

    xhr.onload = async () => {
      try {
        if (xhr.status !== 200) {
          // try parse json message
          let msg = "Upload failed";
          try {
            const j = JSON.parse(xhr.responseText);
            msg = j.error || j.message || msg;
          } catch {}
          throw new Error(msg);
        }

        let parsed = {};
        try {
          parsed = JSON.parse(xhr.responseText);
        } catch {
          parsed = { message: "Upload succeeded" };
        }
        onProgress(100);
        setFilename(null);
        setTimeout(() => onProgress(0), 500); // reset progress in parent maybe
        onDone(parsed);
      } catch (err) {
        onError(err);
      }
    };

    xhr.onerror = () => {
      onError(new Error("Network error during upload"));
    };

    xhr.send(formData);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) {
      setFilename(f.name);
      uploadFile(f);
    }
  };

  const handleFileSelect = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) {
      setFilename(f.name);
      uploadFile(f);
    }
  };

  const handleClickChoose = () => {
    inputRef.current && inputRef.current.click();
  };

  return (
    <div>
      <div
        className={`dd-zone p-4 rounded d-flex flex-column align-items-center justify-content-center text-center ${
          dragOver ? "dd-over" : ""
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleClickChoose();
        }}
        aria-label="Upload CSV file - drag and drop or click to browse"
        style={{ cursor: "pointer" }}>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="d-none"
          onChange={handleFileSelect}
        />

        <div className="dd-icon mb-2" style={{ fontSize: 36 }}>
          <i className="fas fa-cloud-upload-alt" />
        </div>

        <div className="dd-title fw-bold">
          Drop CSV here, or click to browse
        </div>
        <div className="dd-sub text-muted">
          Upload file .csv (PM10, PM25, SO2, CO, O3, NO2, HC, Kelembaban, Suhu)
        </div>

        {filename && (
          <div className="mt-3 w-100 d-flex align-items-center justify-content-center">
            <div className="small text-truncate" style={{ maxWidth: 220 }}>
              Selected: {filename}
            </div>
            <button
              type="button"
              className="btn btn-link btn-sm ms-2"
              onClick={() => {
                setFilename(null);
                inputRef.current.value = "";
              }}>
              Change
            </button>
          </div>
        )}

        <div className="mt-3 w-100">
          <div className="d-flex gap-2 justify-content-center">
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={handleClickChoose}>
              Choose file
            </button>
            {/* <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                // if user clicked primary but no file selected -> open chooser
                if (!filename) handleClickChoose();
              }}>
              {filename ? "Upload Selected" : "Select & Upload"}
            </button> */}
          </div>
        </div>
      </div>

      <style jsx>{`
        .dd-zone {
          border: 2px dashed rgba(59, 130, 246, 0.4);
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.9),
            rgba(248, 249, 250, 0.9)
          );
        }
        .dd-over {
          border-color: rgba(59, 130, 246, 1);
          box-shadow: 0 6px 18px rgba(59, 130, 246, 0.12);
          transform: translateY(-2px);
          transition: all 120ms ease;
        }
      `}</style>
    </div>
  );
};

DragDropUpload.propTypes = {
  apiBase: PropTypes.string.isRequired,
  onStart: PropTypes.func,
  onProgress: PropTypes.func,
  onDone: PropTypes.func,
  onError: PropTypes.func,
  accept: PropTypes.string,
};

export default DragDropUpload;
