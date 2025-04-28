import React from "react";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <h2>Smart Invoice Pro</h2>
      <button className="active">Home</button>
      <button>Invoices</button>
      <button>Payments</button>
      <button>Reports</button>
      <button >User</button>
      <button className="signout">Sign out</button>
    </aside>
  );
};

export default Sidebar;
