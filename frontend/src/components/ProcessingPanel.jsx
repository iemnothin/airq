// src/components/ProcessingPanel.jsx

const ProcessingPanel = ({ API_BASE, onStart, onDone }) => {
  const callEndpoint = async (path) => {
    if (onStart) onStart(); // ✅ Aktifkan overlay dari ModelPage

    try {
      const res = await fetch(`${API_BASE}${path}`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Server error");

      if (onDone) onDone(data);
    } catch (err) {
      console.error(err);
      alert("Gagal memproses model: " + err.message);
      if (onDone) onDone(null);
    }
  };

  return (
    <>
      <button
        className="btn btn-sketch-primary btn-sm d-flex align-items-center gap-2"
        onClick={() => callEndpoint("/model/process-basic")}
        title="Train model basic">
        <i className="fas fa-magic" />
        Process Basic
      </button>

      <button
        className="btn btn-sketch-secondary btn-sm d-flex align-items-center gap-2"
        onClick={() => callEndpoint("/model/process-advanced")}
        title="Train model with holiday, seasonality and tuning">
        <i className="fas fa-cogs" />
        Process With Parameters
      </button>
    </>
  );
};

export default ProcessingPanel;
