import React from "react";
import "./DashboardHeader.css";

const DashboardHeader = () => {
  return (
    <div className="dashboard-header">
      <input type="text" placeholder="Search invoices, payments, and reports" />
      <img src="https://i.pravatar.cc/40" alt="user avatar" />
    </div>
  );
};

export default DashboardHeader;
