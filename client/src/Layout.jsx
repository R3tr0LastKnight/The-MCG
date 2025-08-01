import React, { lazy } from "react";
import { Outlet } from "react-router";
const Nav = lazy(() => import("./components/Nav"));
const Footer = lazy(() => import("./components/Footer"));

const Layout = () => {
  return (
    <div>
      <Nav />
      <Outlet />
      <Footer />
    </div>
  );
};

export default Layout;
