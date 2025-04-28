import React from "react";
import "./RevenueSummary.css";

const RevenueSummary = () => {
  return (
    <div className="revenue-summary">
      <h3>Total Revenue</h3>
      <div className="revenue-box">
        <p>Pending Payments</p>
        <h2>₹ 9,632,517</h2>
      </div>
    </div>
  );
};

export default RevenueSummary;
