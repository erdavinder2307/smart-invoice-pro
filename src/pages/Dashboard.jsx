import React from "react";
import Sidebar from "../components/Sidebar.jsx";
import DashboardHeader from "../components/DashboardHeader";
import RevenueSummary from "../components/RevenueSummary";
import MonthlySummary from "../components/MonthlySummary";
import WeeklyStats from "../components/WeeklyStats";
import RecentInvoices from "../components/RecentInvoices";
import "./Dashboard.css"; // optional styles for layout

const DashboardPage = () => {
  return (
    <div className="dashboard-page">
      <Sidebar />
      <main className="dashboard-content">
        <div className="dashboard-main">
          <DashboardHeader />
          <RevenueSummary />
          <MonthlySummary />
          <WeeklyStats />
        </div>
        <div className="dashboard-sidebar">
          <RecentInvoices />
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
