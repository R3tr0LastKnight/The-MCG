import React from "react";
import ReactDOM from "react-dom/client";
import "./Index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
// import { AuthProvider } from "./context/AuthContext";
// import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserProvider } from "./utils/userContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <ToastContainer theme="dark" autoClose={900} />
    <UserProvider>
      <App />
    </UserProvider>
  </BrowserRouter>
);
