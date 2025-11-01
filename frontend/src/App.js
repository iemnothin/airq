import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./App.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ForecastPage from "./pages/ForecastPage";
import ModelPage from "./pages/ModelPage";
import ContainerPage from "./pages/ContainerPage";
import { useState } from "react";

import LoadingScreen from "./components/LoadingScreen";
import BackendErrPage from "./pages/BackendErrPage";

function App() {
  const [loading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Loading global
  if (loading) return <LoadingScreen />;

  // ✅ Backend error page (INI YANG KITA MAU)
  if (error) {
    return (
      <BackendErrPage
        message={error}
        onRetry={() => {
          setError(null);
          window.location.reload();
        }}
      />
    );
  }

  return (
    <Router>
      <Routes>
        {/* Halaman tanpa sidebar */}
        <Route path="/" element={<LandingPage />} />

        {/* Halaman dengan sidebar */}
        <Route element={<ContainerPage />}>
          <Route
            path="/forecast"
            element={<ForecastPage setError={setError} />}
          />
          <Route path="/model" element={<ModelPage setError={setError} />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
