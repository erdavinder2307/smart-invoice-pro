import React from "react";
import "./WeeklyStats.css";

const WeeklyStats = () => {
  return (
    <div className="weekly-stats">
      <h3>Weekly Invoicing Stats</h3>
      <div className="bar-chart">
        {[5, 7, 6, 6, 7, 5, 6, 7].map((val, idx) => (
          <div key={idx} className="bar" style={{ height: `${val * 10}px` }}>
            <span>Jan {25 + idx * 30}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyStats;
