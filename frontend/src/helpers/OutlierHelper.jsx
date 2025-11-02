// src/helpers/OutlierHelper.jsx
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

export const handleOutliers = async (API_BASE) => {
  try {
    const res = await fetch(`${API_BASE}/data/outliers-handle`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Gagal menangani outlier");
    return await res.json();
  } catch (err) {
    console.error(err);
    return { message: "Gagal menangani outlier" };
  }
};
