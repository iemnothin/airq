const ProcessingPanel = ({
  API_BASE,
  setIsProcessing,
  setForecastProgress,
  setForecastMessage,
  setCurrentPollutant,
}) => {
  const callEndpoint = async (path) => {
    if (setIsProcessing) setIsProcessing(true);

    try {
      const res = await fetch(`${API_BASE}${path}`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Server error");
      setForecastMessage(
        data?.message || "✅ Forecast completed successfully."
      );
      setForecastProgress(100);
    } catch (err) {
      console.error(err);
      setForecastMessage(err.message || "❌ Forecast failed.");
    } finally {
      setTimeout(() => setIsProcessing(false), 2000);
    }
  };

  const handleAdvancedForecast = () => {
    if (setIsProcessing) setIsProcessing(true);
    setForecastMessage("🔄 Starting advanced forecast...");
    setForecastProgress(0);
    setCurrentPollutant("");

    const evtSource = new EventSource(
      `${API_BASE}/model/process-advanced/stream`
    );
    window.currentForecastStream = evtSource; // ✅ simpan global supaya bisa di-cancel dari ModelPage.jsx

    evtSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.status === "start") {
        setForecastMessage(data.message);
        setForecastProgress(0);
      } else if (data.status === "begin") {
        setCurrentPollutant(data.pollutant);
        setForecastMessage(data.message);
        setForecastProgress(0);
      } else if (data.status === "progress") {
        setCurrentPollutant(data.pollutant);
        setForecastMessage(data.message);
        setForecastProgress(data.progress);
      } else if (data.status === "done") {
        setForecastProgress(100);
        setForecastMessage(`✅ ${data.pollutant} completed.`);
      } else if (data.status === "complete") {
        setForecastProgress(100);
        setForecastMessage("✅ All forecasts completed successfully!");
        setTimeout(() => setIsProcessing(false), 2000);
        evtSource.close();
        window.currentForecastStream = null;
      } else if (data.status === "error") {
        setForecastMessage(`Error: ${data.message}`);
        setIsProcessing(false);
        evtSource.close();
        window.currentForecastStream = null;
      }
    };

    evtSource.onerror = () => {
      setForecastMessage("❌ Connection lost or backend stopped.");
      setIsProcessing(false);
      evtSource.close();
      window.currentForecastStream = null;
    };
  };

  return (
    <div className="d-flex align-items-center gap-2">
      <button
        className="btn btn-sketch-primary btn-sm d-flex align-items-center gap-2"
        onClick={() => callEndpoint("/model/process-basic")}
        title="Train model basic">
        <i className="fas fa-magic" />
        Process Basic
      </button>

      <button
        className="btn btn-sketch-secondary btn-sm d-flex align-items-center gap-2"
        onClick={handleAdvancedForecast}
        title="Train model with holiday, seasonality and tuning">
        <i className="fas fa-cogs" />
        Process With Parameters
      </button>
    </div>
  );
};

export default ProcessingPanel;
