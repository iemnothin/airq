// src/components/OutlierManager.jsx
import React, { useEffect, useState } from "react";
import OutlierModal from "./OutlierModal";
import { fetchOutliers, handleOutliers } from "../helpers/OutlierHelper";

const OutlierManager = ({ API_BASE }) => {
  const [outliers, setOutliers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadOutliers = async () => {
    setLoading(true);
    const data = await fetchOutliers(API_BASE);
    setOutliers(data);
    setLoading(false);
  };

  const handleOutlierProcess = async () => {
    if (outliers.length === 0) return;

    setLoading(true);
    const res = await handleOutliers(API_BASE);

    console.log(res.message); // optional: show toast
    await loadOutliers(); // refresh outlier list
    setShowModal(false);
    setLoading(false);
  };

  useEffect(() => {
    loadOutliers();
  }, []);

  return (
    <div>
      {/* Tombol di atas tabel */}
      {outliers.length > 0 && (
        <button
          className="btn btn-warning mb-3"
          onClick={() => setShowModal(true)}
          disabled={loading}>
          {loading
            ? "Now handling outlier..."
            : `Tangani Outlier (${outliers.length})`}
        </button>
      )}

      {/* Modal Outlier */}
      <OutlierModal
        show={showModal}
        onClose={() => setShowModal(false)}
        outliers={outliers}
        onHandle={handleOutlierProcess}
        loading={loading} // tambahkan ini
      />
    </div>
  );
};

export default OutlierManager;
