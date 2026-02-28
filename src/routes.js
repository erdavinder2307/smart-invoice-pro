import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React from 'react';
import Login from './components/Auth/Login';
import Dashboard from './pages/Dashboard';
import InvoiceList from './components/InvoiceList';
import AddEditInvoice from './components/AddEditInvoice';
import CustomerList from './components/CustomerList';
import AddEditCustomer from './components/AddEditCustomer';
import ProductList from './components/ProductList';
import AddEditProduct from './components/AddEditProduct';
import StockAdjustment from './components/StockAdjustment';
import CustomerLogin from './components/CustomerLogin';
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerInvoiceDetail from './pages/CustomerInvoiceDetail';
import Home from './pages/Home';
import About from './pages/About';
import Features from './pages/Features';
import Contact from './pages/Contact';
import ThemeExample from './components/ThemeExample';
import BankAccounts from './pages/BankAccounts';
import ComingSoon from './pages/ComingSoon';
import Profile from './pages/Profile';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/theme-example" element={<ThemeExample />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/invoices" element={<InvoiceList />} />
        <Route path="/invoices/add" element={<AddEditInvoice />} />
        <Route path="/invoices/edit/:id" element={<AddEditInvoice />} />
        <Route path="/customers" element={<CustomerList />} />
        <Route path="/customers/add" element={<AddEditCustomer />} />
        <Route path="/customers/edit/:id" element={<AddEditCustomer />} />
        <Route path="/customer/login" element={<CustomerLogin />} />
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/customer/invoices/:id" element={<CustomerInvoiceDetail />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/add" element={<AddEditProduct />} />
        <Route path="/products/edit/:id" element={<AddEditProduct />} />
        <Route path="/stock-adjustment" element={<StockAdjustment />} />
        <Route path="/bank-accounts" element={<BankAccounts />} />
        <Route path="/profile" element={<Profile />} />

        {/* Coming Soon Pages */}
        <Route path="/api-docs" element={<ComingSoon />} />
        <Route path="/support" element={<ComingSoon />} />
        <Route path="/privacy" element={<ComingSoon />} />
        <Route path="/terms" element={<ComingSoon />} />
        <Route path="/cookies" element={<ComingSoon />} />
        <Route path="/pricing" element={<ComingSoon />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
