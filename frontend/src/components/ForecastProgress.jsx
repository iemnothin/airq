import { useState } from "react";

const ForecastProgress = ({ API_BASE }) => {
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState("");
  const [message, setMessage] = useState("");
  const [running, setRunning] = useState(false);

  const startForecast = () => {
    setProgress(0);
    setMessage("Starting forecast...");
    setRunning(true);

    const evtSource = new EventSource(
      `${API_BASE}/model/process-advanced/stream`
    );

    evtSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.status === "start") {
        setMessage("Initializing advanced forecast...");
      } else if (data.status === "processing") {
        setProgress(data.progress);
        setCurrent(data.pollutant);
        setMessage(`Processing ${data.pollutant}...`);
      } else if (data.status === "done") {
        setProgress(data.progress);
        setMessage(`${data.pollutant} completed.`);
      } else if (data.status === "complete") {
        setProgress(100);
        setMessage("✅ All forecasts completed!");
        evtSource.close();
        setTimeout(() => setRunning(false), 2000);
      } else if (data.status === "error") {
        setMessage(`❌ Error: ${data.message}`);
        evtSource.close();
        setRunning(false);
      }
    };

    evtSource.onerror = () => {
      setMessage("❌ Connection lost or backend stopped.");
      evtSource.close();
      setRunning(false);
    };
  };

  return (
    <div className="p-3 text-center border rounded bg-light mt-3">
      {!running ? (
        <button onClick={startForecast} className="btn btn-primary">
          Start Advanced Forecast (Live)
        </button>
      ) : (
        <>
          <div className="progress my-3" style={{ height: "25px" }}>
            <div
              className="progress-bar progress-bar-striped progress-bar-animated bg-info"
              role="progressbar"
              style={{ width: `${progress}%` }}>
              {progress.toFixed(1)}%
            </div>
          </div>
          <div>
            <strong>{message}</strong>
            {current && <div>Currently: {current}</div>}
          </div>
        </>
      )}
    </div>
  );
};

export default ForecastProgress;
