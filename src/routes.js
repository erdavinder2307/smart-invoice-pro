import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React from 'react';
import Login from './components/Auth/Login';
import Dashboard from './pages/Dashboard';
import InvoiceList from './components/InvoiceList';
import AddEditInvoice from './components/AddEditInvoice';
import CustomerList from './components/CustomerList';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/invoices" element={<InvoiceList />} />
        <Route path="/invoices/add" element={<AddEditInvoice />} />
        <Route path="/invoices/edit/:id" element={<AddEditInvoice />} />
        <Route path="/customers" element={<CustomerList />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
