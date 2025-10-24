// src/pages/ContainerPage.jsx
import Navigation from "../components/Navigation";
import { Outlet } from "react-router-dom";
//

const ContainerPage = () => {
  return (
    <div className="d-flex">
      <Navigation />
      <>
        {/* Kontainer Desktop */}
        <div
          className="d-none d-md-block"
          style={{ marginLeft: "220px", padding: "20px", width: "100%" }}>
          <Outlet />
        </div>

        {/* Kontainer Mobile */}
        <div className="d-block d-md-none p-3">
          <Outlet />
        </div>
      </>
    </div>
  );
};

export default ContainerPage;
