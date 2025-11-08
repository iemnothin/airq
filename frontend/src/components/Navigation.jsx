import { useState } from "react";
import SidebarDesktop from "./SidebarDesktop";
import SidebarResponsive from "./SidebarResponsive";
import BottomBarMobile from "./BottomBarMobile";

const Navigation = () => {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <>
      {/* ✅ Desktop Sidebar (≥1200px) */}
      <div className="d-none d-xl-block">
        <SidebarDesktop />
      </div>

      {/* ✅ Tablet & Mobile Sidebar (slide-in) */}
      <SidebarResponsive
        show={showSidebar}
        onClose={() => setShowSidebar(false)}
      />

      {/* ✅ Hamburger button (tampil di <1200px) */}
      <button
        className="btn btn-primary d-none d-md-block d-xl-none position-fixed"
        style={{
          top: "12px",
          left: "12px",
          zIndex: 1050,
          borderRadius: "10px",
        }}
        onClick={() => setShowSidebar(!showSidebar)}>
        <i className={`fas ${showSidebar ? "fa-times" : "fa-bars"}`}></i>
      </button>

      {/* ✅ Bottom Bar khusus Mobile (<768px) */}
      <div className="mobile-bottom-wrapper d-block d-md-none text-center">
        <BottomBarMobile />
      </div>
    </>
  );
};

export default Navigation;
