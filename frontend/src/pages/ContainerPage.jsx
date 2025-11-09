// // src/pages/ContainerPage.jsx
// import Navigation from "../components/Navigation";
// import { Outlet } from "react-router-dom";

// const ContainerPage = () => {
//   return (
//     <div className="d-flex">
//       <Navigation />

//       <div className="container-fluid p-0">
//         <div className="content-wrapper">
//           <Outlet />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ContainerPage;
// src/pages/ContainerPage.jsx
import Navigation from "../components/Navigation";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const ContainerPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  let touchStartX = 0;
  let touchEndX = 0;

  const handleTouchStart = (e) => {
    touchStartX = e.changedTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const distance = touchEndX - touchStartX;

    // Minimal swipe distance
    if (Math.abs(distance) < 60) return;

    if (distance < 0) {
      // Swipe LEFT
      if (location.pathname === "/dashboard") navigate("/model");
    } else {
      // Swipe RIGHT
      if (location.pathname === "/model") navigate("/dashboard");
    }
  };

  return (
    <div className="d-flex">
      {/* Top Bar Logo khusus Mobile */}
      <div className="mobile-top-logo-bar d-block d-md-none text-center">
        <img
          src={process.env.PUBLIC_URL + "/air-no-outline192.png"}
          alt="AirQ Logo"
        />
        <div className="logo-text">AirQ</div>
      </div>

      <Navigation className="flex-shrink-0" />

      <div
        className="flex-grow-1 container-fluid p-0 swipe-zone"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}>
        <div className="content-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ContainerPage;
