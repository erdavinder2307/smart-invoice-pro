
import './App.css';
import React from 'react';
import AppRoutes from './routes';
import PlanLimitBanner from './components/PlanLimitBanner';

function App() {
  return (
    <div className="App">
      <AppRoutes />
      <PlanLimitBanner />
    </div>
  );
}

export default App;
