import { Link, useLocation } from "react-router-dom";

const SidebarResponsive = ({ show, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { name: "Beranda", icon: "fa-chart-line", path: "/dashboard" },
    { name: "Model", icon: "fa-brain", path: "/model" },
    // { name: "ISPU", icon: "fa-wind", path: "/ispu" },
  ];

  return (
    <>
      {/* Background overlay */}
      {show && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark"
          style={{ opacity: 0.5, zIndex: 998 }}
          onClick={onClose}></div>
      )}

      {/* Sidebar */}
      <div
        className={`position-fixed top-0 h-100 bg-light border-end p-3`}
        style={{
          width: "220px",
          zIndex: 999,
          left: show ? "0" : "-250px",
          transition: "all 0.3s ease",
        }}>
        

        <Link
          to="/"
          className="h-4 nav-item text-center mb-4 text-success fw-bold text-decoration-none d-flex flex-column align-items-center"
          onClick={onClose}>
          <img
            src={process.env.PUBLIC_URL + "/air-no-outline192.png"}
            alt="logo-AirQ"
            style={{ width: "60px", marginBottom: "10px" }}
          />
          <div className="text-primary">AirQ</div>
        </Link>

        <ul className="nav nav-pills flex-column">
          {menuItems.map((item) => (
            <li className="nav-item mb-2" key={item.name}>
              <Link
                to={item.path}
                onClick={onClose}
                className={`nav-link d-flex align-items-center ${
                  location.pathname === item.path
                    ? "active bg-primary text-white"
                    : "text-dark"
                }`}>
                <i className={`fas ${item.icon} me-2`}></i>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default SidebarResponsive;
