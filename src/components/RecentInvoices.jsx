import React from "react";
import "./RecentInvoices.css";

const RecentInvoices = () => {
  return (
    <div className="recent-invoices">
      <h3>Recent Invoices</h3>
      {[...Array(6)].map((_, i) => (
        <div className="invoice" key={i}>
          <span>🛒</span>
          <div>
            <strong>Grocery Delivery</strong>
            <p>Food Delivery</p>
          </div>
          <strong>₹ 350</strong>
        </div>
      ))}
    </div>
  );
};

export default RecentInvoices;
