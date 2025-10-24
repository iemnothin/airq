import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./App.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ForecastPage from "./pages/ForecastPage";
import ModelPage from "./pages/ModelPage";
import ContainerPage from "./pages/ContainerPage";
import { useState } from "react";

// 🔹 Komponen Loading & Error dibuat terpisah agar reusable
import LoadingScreen from "./components/LoadingScreen";
import ErrorScreen from "./components/ErrorScreen";
// import Sidebar from "./components/Sidebar";

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;

  return (
    <Router>
      <Routes>
        {/* Halaman tanpa sidebar */}
        <Route path="/" element={<LandingPage />} />

        {/* Halaman dengan sidebar */}
        <Route element={<ContainerPage />}>
          <Route path="/forecast" element={<ForecastPage />} />
          <Route path="/model" element={<ModelPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
