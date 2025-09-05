import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React from 'react';
import Login from './components/Auth/Login';
import Dashboard from './pages/Dashboard';
import InvoiceList from './components/InvoiceList';
import AddEditInvoice from './components/AddEditInvoice';
import CustomerList from './components/CustomerList';
import ProductList from './components/ProductList';
import AddEditProduct from './components/AddEditProduct';
import StockAdjustment from './components/StockAdjustment';
import CustomerLogin from './components/CustomerLogin';
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerInvoiceDetail from './pages/CustomerInvoiceDetail';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/invoices" element={<InvoiceList />} />
        <Route path="/invoices/add" element={<AddEditInvoice />} />
        <Route path="/invoices/edit/:id" element={<AddEditInvoice />} />
        <Route path="/customers" element={<CustomerList />} />
        <Route path="/customer/login" element={<CustomerLogin />} />
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/customer/invoices/:id" element={<CustomerInvoiceDetail />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/add" element={<AddEditProduct />} />
        <Route path="/products/edit/:id" element={<AddEditProduct />} />
        <Route path="/stock-adjustment" element={<StockAdjustment />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
