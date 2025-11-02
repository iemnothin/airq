// src/helpers/outlierHelper.js
export const fetchOutliers = async (API_BASE) => {
  try {
    const res = await fetch(`${API_BASE}/data/outliers`);
    if (!res.ok) throw new Error("Gagal fetch outlier");
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error(err);
    return [];
  }
};
