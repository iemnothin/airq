import { Link, useLocation } from "react-router-dom";
import LandingPage from "../pages/LandingPage";

const SidebarDesktop = () => {
  const location = useLocation();

  const menuItems = [
    { name: "Beranda", icon: "fa-chart-line", path: "/forecast" },
    { name: "Model", icon: "fa-brain", path: "/model" },
  ];

  return (
    <div
      className="d-none d-md-flex flex-column vh-100 p-3 bg-light border-end"
      style={{ width: "220px", position: "fixed" }}>
      {/* <Link
        to="/"
        className="h-4 nav-item text-center mb-4 text-success fw-bold text-decoration-none"
        element={<LandingPage />}>
          <img src="%PUBLIC_URL%/air-no-outline192.png" alt="logo-AirQ" />
        AirQ
      </Link> */}

      <Link
        to="/"
        className="h-4 nav-item text-center mb-4 text-success fw-bold text-decoration-none d-flex flex-column align-items-center">
        <img
          src={process.env.PUBLIC_URL + "/air-no-outline192.png"}
          alt="logo-AirQ"
          style={{ width: "60px", marginBottom: "10px" }}
        />
        <div>AirQ</div>
      </Link>

      <ul className="nav nav-pills flex-column mb-auto">
        {menuItems.map((item) => (
          <li className="nav-item mb-2" key={item.name}>
            <Link
              to={item.path}
              className={`nav-link d-flex align-items-center ${
                location.pathname === item.path
                  ? "active bg-success text-white"
                  : "text-dark"
              }`}>
              <i className={`fas ${item.icon} me-2`}></i>
              {item.name}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-auto text-center small text-muted">
        <p>© 2025 AirQ</p>
      </div>
    </div>
  );
};

export default SidebarDesktop;
