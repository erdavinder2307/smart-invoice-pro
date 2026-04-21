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
import BankReconciliation from './pages/BankReconciliation';
import PortalInvoiceView from './pages/PortalInvoiceView';
import ComingSoon from './pages/ComingSoon';
import Profile from './pages/Profile';
import QuoteList from './components/QuoteList';
import AddEditQuote from './components/AddEditQuote';
import ConvertQuote from './components/ConvertQuote';
import RecurringProfileList from './components/RecurringProfileList';
import AddEditRecurringProfile from './components/AddEditRecurringProfile';
import SalesOrderList from './components/SalesOrderList';
import AddEditSalesOrder from './components/AddEditSalesOrder';
import VendorList from './components/VendorList';
import AddEditVendor from './components/AddEditVendor';
import PurchaseOrderList from './components/PurchaseOrderList';
import AddEditPurchaseOrder from './components/AddEditPurchaseOrder';
import BillList from './components/BillList';
import AddEditBill from './components/AddEditBill';
import ExpenseList from './components/ExpenseList';
import AddEditExpense from './components/AddEditExpense';
import Reports from './pages/Reports';
import ProfitAndLoss from './pages/ProfitAndLoss';
import ARAgingReport from './pages/ARAgingReport';
import APAgingReport from './pages/APAgingReport';
import BalanceSheet from './pages/BalanceSheet';
import CashFlow from './pages/CashFlow';
import SalesSummary from './pages/SalesSummary';
import GSTTaxSummary from './pages/GSTTaxSummary';
import PaymentsReceived from './pages/PaymentsReceived';
import PaymentsMade from './pages/PaymentsMade';
import UserManagement from './pages/UserManagement';
import RoleManagement from './pages/RoleManagement';
import PendingApprovals from './pages/PendingApprovals';
import OrganizationProfile from './pages/OrganizationProfile';
import BrandingSettings from './pages/BrandingSettings';
import InvoicePreferences from './pages/InvoicePreferences';
import TaxSettings from './pages/TaxSettings';
import AutomationSettings from './pages/AutomationSettings';
import IntegrationSettings from './pages/IntegrationSettings';
import NotificationsPage from './pages/NotificationsPage';
import AuditLogPage from './pages/AuditLogPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import SearchResultsPage from './pages/SearchResultsPage';
import AdminRoutes from './admin/routes/AdminRoutes';
import AppLayout from './components/Layout/AppLayout';

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
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/invoices" element={<InvoiceList />} />
          <Route path="/invoices/add" element={<AddEditInvoice />} />
          <Route path="/invoices/edit/:id" element={<AddEditInvoice />} />
          <Route path="/quotes" element={<QuoteList />} />
          <Route path="/quotes/add" element={<AddEditQuote />} />
          <Route path="/quotes/edit/:id" element={<AddEditQuote />} />
          <Route path="/quotes/convert/:id/:type" element={<ConvertQuote />} />
          <Route path="/recurring-profiles" element={<RecurringProfileList />} />
          <Route path="/recurring-profiles/add" element={<AddEditRecurringProfile />} />
          <Route path="/recurring-profiles/edit/:id" element={<AddEditRecurringProfile />} />
          <Route path="/sales-orders" element={<SalesOrderList />} />
          <Route path="/sales-orders/add" element={<AddEditSalesOrder />} />
          <Route path="/sales-orders/edit/:id" element={<AddEditSalesOrder />} />
          <Route path="/vendors" element={<VendorList />} />
          <Route path="/vendors/add" element={<AddEditVendor />} />
          <Route path="/vendors/edit/:id" element={<AddEditVendor />} />
          <Route path="/purchase-orders" element={<PurchaseOrderList />} />
          <Route path="/purchase-orders/add" element={<AddEditPurchaseOrder />} />
          <Route path="/purchase-orders/edit/:id" element={<AddEditPurchaseOrder />} />
          <Route path="/bills" element={<BillList />} />
          <Route path="/bills/add" element={<AddEditBill />} />
          <Route path="/bills/edit/:id" element={<AddEditBill />} />
          <Route path="/expenses" element={<ExpenseList />} />
          <Route path="/expenses/add" element={<AddEditExpense />} />
          <Route path="/expenses/edit/:id" element={<AddEditExpense />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/profit-loss" element={<ProfitAndLoss />} />
          <Route path="/reports/ar-aging" element={<ARAgingReport />} />
          <Route path="/reports/ap-aging" element={<APAgingReport />} />
          <Route path="/reports/balance-sheet" element={<BalanceSheet />} />
          <Route path="/reports/cash-flow" element={<CashFlow />} />
          <Route path="/reports/sales-summary" element={<SalesSummary />} />
          <Route path="/reports/gst-tax-summary" element={<GSTTaxSummary />} />
          <Route path="/reports/payments-received" element={<PaymentsReceived />} />
          <Route path="/reports/payments-made" element={<PaymentsMade />} />
          <Route path="/customers" element={<CustomerList />} />
          <Route path="/customers/add" element={<AddEditCustomer />} />
          <Route path="/customers/edit/:id" element={<AddEditCustomer />} />
          <Route path="/customers/:id" element={<CustomerDetailPage />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/add" element={<AddEditProduct />} />
          <Route path="/products/edit/:id" element={<AddEditProduct />} />
          <Route path="/stock-adjustment" element={<StockAdjustment />} />
          <Route path="/bank-accounts" element={<BankAccounts />} />
          <Route path="/bank-reconciliation" element={<BankReconciliation />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<UserManagement />} />
          <Route path="/settings/users" element={<UserManagement />} />
          <Route path="/settings/organization-profile" element={<OrganizationProfile />} />
          <Route path="/settings/branding" element={<BrandingSettings />} />
          <Route path="/settings/invoice-preferences" element={<InvoicePreferences />} />
          <Route path="/settings/taxes" element={<TaxSettings />} />
          <Route path="/settings/roles" element={<RoleManagement />} />
          <Route path="/settings/automation" element={<AutomationSettings />} />
          <Route path="/settings/integrations" element={<IntegrationSettings />} />
          <Route path="/settings/audit-log" element={<AuditLogPage />} />
          <Route path="/settings/audit-logs" element={<AuditLogPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/approvals" element={<PendingApprovals />} />
        </Route>
        <Route path="/customer/login" element={<CustomerLogin />} />
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/customer/invoices/:id" element={<CustomerInvoiceDetail />} />

        {/* Public Invoice Portal — no auth required */}
        <Route path="/portal/invoice/:token" element={<PortalInvoiceView />} />

        {/* Coming Soon Pages */}
        <Route path="/api-docs" element={<ComingSoon />} />
        <Route path="/support" element={<ComingSoon />} />
        <Route path="/privacy" element={<ComingSoon />} />
        <Route path="/terms" element={<ComingSoon />} />
        <Route path="/cookies" element={<ComingSoon />} />
        <Route path="/pricing" element={<ComingSoon />} />

        {/* Super Admin Module — fully isolated */}
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
