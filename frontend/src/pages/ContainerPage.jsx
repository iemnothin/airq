// src/pages/ContainerPage.jsx
import Navigation from "../components/Navigation";
import { Outlet } from "react-router-dom";

const ContainerPage = () => {
  return (
    <div className="d-flex">
      <Navigation />

      <div className="container-fluid p-0">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ContainerPage;
