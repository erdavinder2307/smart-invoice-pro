import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <aside className="sidebar">
      <h2>Smart Invoice Pro</h2>
      <button className={location.pathname === "/dashboard" ? "active" : ""} onClick={() => navigate("/dashboard")}>Home</button>
      <button className={location.pathname === "/customers" ? "active" : ""} onClick={() => navigate("/customers")}>Customers</button>
      <button className={location.pathname === "/invoices" ? "active" : ""} onClick={() => navigate("/invoices")}>Invoices</button>
      <button className={location.pathname === "/payments" ? "active" : ""}>Payments</button>
      <button className={location.pathname === "/reports" ? "active" : ""}>Reports</button>
      <button className={location.pathname === "/user" ? "active" : ""}>User</button>

      <button className="signout">Sign out</button>
    </aside>
  );
};

export default Sidebar;
