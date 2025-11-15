import "bootstrap/dist/css/bootstrap.min.css";
import "animate.css/animate.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./css/ContainerPage.css";
import "./css/ContainerSwipe.css";
import "./css/Backgrounds.css";
import "./css/Borders.css";
import "./css/Buttons.css";
import "./App.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import ForecastPage from "./pages/ForecastPage";
import ModelPage from "./pages/ModelPage";
import ContainerPage from "./pages/ContainerPage";
import { useState } from "react";
import IspuPage from "./pages/IspuPage";

import LoadingScreen from "./components/LoadingScreen";
import BackendErrPage from "./pages/BackendErrPage";

function App() {
  const [loading] = useState(false);
  const [error, setError] = useState(null);

  // Loading global
  if (loading) return <LoadingScreen />;

  // Backend error page
  if (error) {
    const randomChance = Math.random() < 0.05;

    return (
      <BackendErrPage
        message={error}
        onRetry={() => {
          setError(null);
          window.location.reload();
        }}
        isIsekai={randomChance}
      />
    );
  }

  return (
    <Router>
      <Routes>
        {/* Halaman landing page */}
        <Route path="/" element={<LandingPage />} />

        {/* Halaman processing page */}
        <Route element={<ContainerPage />}>
          {/* Halaman Forecast page */}
          <Route
            path="/dashboard"
            element={<DashboardPage setError={setError} />}
          />
          {/* Halaman Forecast page */}
          {/* <Route
            path="/forecast"
            element={<ForecastPage setError={setError} />}
          /> */}
          {/* Halaman Model page */}
          <Route path="/model" element={<ModelPage setError={setError} />} />
          {/* Halaman ISPU page */}
          {/* <Route path="/ispu" element={<IspuPage setError={setError} />} /> */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
