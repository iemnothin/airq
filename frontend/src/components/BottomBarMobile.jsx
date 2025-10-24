import { Link, useLocation } from "react-router-dom";

const BottomBarMobile = () => {
  const location = useLocation();

  const menuItems = [
    { name: "Beranda", icon: "fa-house", path: "/forecast" },
    { name: "Model", icon: "fa-brain", path: "/model" },
  ];

  return (
    <div
      className="d-md-none bg-light border-top fixed-bottom py-2 shadow-sm"
      style={{ zIndex: 1000 }}>
      <div className="d-flex justify-content-around">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`text-center text-decoration-none ${
              location.pathname === item.path ? "text-success" : "text-muted"
            }`}>
            <i className={`fas ${item.icon} fa-lg`}></i>
            <div style={{ fontSize: "12px" }}>{item.name}</div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BottomBarMobile;
