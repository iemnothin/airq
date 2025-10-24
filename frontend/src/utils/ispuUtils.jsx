export const getColorByISPU = (ispu) => {
  if (ispu <= 50) return "#4CAF50";
  if (ispu <= 100) return "#2196F3";
  if (ispu <= 200) return "#FF9800";
  if (ispu <= 300) return "#F44336";
  if (ispu > 300) return "#000000";
  return "#FFFFFF";
};

export const getLevelByISPU = (ispu) => {
  if (ispu <= 50) return "Baik";
  if (ispu <= 100) return "Sedang";
  if (ispu <= 200) return "Tidak Sehat";
  if (ispu <= 300) return "Sangat Tidak Sehat";
  if (ispu > 300) return "Berbahaya";
  return "Tidak Terdefinisi";
};
