const ProcessingPanel = ({
  API_BASE,
  onStart,
  onDone,
  setIsProcessing,
  setForecastProgress,
  setForecastMessage,
  setCurrentPollutant,
}) => {
  const callEndpoint = async (path) => {
    if (onStart) onStart();

    if (path === "/model/process-advanced") {
      try {
        const evtSource = new EventSource(`${API_BASE}${path}/stream`);
        setForecastProgress(0);
        setForecastMessage("Preparing advanced forecast...");
        setCurrentPollutant("");

        evtSource.onmessage = (event) => {
          const data = JSON.parse(event.data);

          switch (data.status) {
            case "start":
              setForecastMessage("Initializing forecast model...");
              break;

            case "begin":
              setForecastProgress(0);
              setCurrentPollutant(data.pollutant);
              setForecastMessage(`Processing ${data.pollutant}...`);
              break;

            case "progress":
              setForecastProgress(data.progress);
              setForecastMessage(
                `Processing ${data.pollutant} (${data.progress}%)...`
              );
              break;

            case "done":
              setForecastProgress(100);
              setForecastMessage(`${data.pollutant} completed.`);
              break;

            case "complete":
              setForecastMessage("✅ All forecasts completed!");
              evtSource.close();
              setTimeout(() => onDone({ message: "Forecast complete" }), 1500);
              break;

            case "error":
              setForecastMessage(`❌ Error: ${data.message}`);
              evtSource.close();
              onDone({ error: data.message });
              break;
          }
        };

        evtSource.onerror = () => {
          setForecastMessage("❌ Connection lost or server stopped.");
          evtSource.close();
          onDone({ error: "Connection lost" });
        };
      } catch (err) {
        console.error(err);
        onDone({ error: err.message });
      }
      return;
    }

    // process-basic (default)
    try {
      const res = await fetch(`${API_BASE}${path}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Server error");
      onDone(data);
    } catch (err) {
      console.error(err);
      onDone({ error: err.message || "Failed to process model" });
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
        // onClick={() => callEndpoint("/model/process-advanced")}
        onClick={() => {
          setIsProcessing(true);
          const evtSource = new EventSource(
            `${API_BASE}/model/process-advanced/stream`
          );
          evtSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.status === "progress") {
              setCurrentPollutant(data.pollutant);
              setForecastProgress(data.progress);
              setForecastMessage(data.message);
            } else if (data.status === "complete") {
              setForecastMessage(data.message);
              setForecastProgress(100);
              setTimeout(() => setIsProcessing(false), 2000);
              evtSource.close();
            }
          };
          evtSource.onerror = () => {
            setForecastMessage("❌ Connection lost or failed.");
            setIsProcessing(false);
            evtSource.close();
          };
        }}
        title="Train model with tuning and holidays">
        <i className="fas fa-cogs" />
        Process With Parameters
      </button>
    </>
  );
};

export default ProcessingPanel;
