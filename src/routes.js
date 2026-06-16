import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import Login from './components/Auth/Login';
import Dashboard from './pages/Dashboard';
import InvoiceList from './components/InvoiceList';
import AddEditInvoice from './components/AddEditInvoice';
import InvoiceDetail from './pages/InvoiceDetail';
import CustomerList from './components/CustomerList';
import AddEditCustomer from './components/AddEditCustomer';
import ProductList from './components/ProductList';
import AddEditProduct from './components/AddEditProduct';
import ProductDetail from './pages/ProductDetail';
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
import BankImportWorkflow from './pages/BankImportWorkflow';
import BankReconciliation from './pages/BankReconciliation';
import PortalInvoiceView from './pages/PortalInvoiceView';
import ComingSoon from './pages/ComingSoon';
import Profile from './pages/Profile';
import QuoteList from './components/QuoteList';
import AddEditQuote from './components/AddEditQuote';
import ConvertQuote from './components/ConvertQuote';
import QuoteDetail from './pages/QuoteDetail';
import RecurringProfileList from './components/RecurringProfileList';
import AddEditRecurringProfile from './components/AddEditRecurringProfile';
import SalesOrderList from './components/SalesOrderList';
import AddEditSalesOrder from './components/AddEditSalesOrder';
import VendorList from './components/VendorList';
import AddEditVendor from './components/AddEditVendor';
import PurchaseOrderList from './components/PurchaseOrderList';
import AddEditPurchaseOrder from './components/AddEditPurchaseOrder';
import BillList from './components/BillList';
import BillDetails from './components/BillDetails';
import AddEditBill from './components/AddEditBill';
import ExpenseList from './components/ExpenseList';
import AddEditExpense from './components/AddEditExpense';
import ExpenseDetail from './pages/ExpenseDetail';
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
import InventorySettings from './pages/InventorySettings';
import NotificationsPage from './pages/NotificationsPage';
import AuditLogPage from './pages/AuditLogPage';
import ActivityCenterPage from './pages/ActivityCenterPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import SearchResultsPage from './pages/SearchResultsPage';
import AdminRoutes from './admin/routes/AdminRoutes';
import AppLayout from './components/Layout/AppLayout';
import PermissionRoute from './components/PermissionRoute';
import Forbidden from './pages/Forbidden';
import RouteSeoManager from './seo/RouteSeoManager';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Signup from './pages/Signup';
import PageTracker from './components/PageTracker';
import MyProfile from './pages/MyProfile';
import SecurityPage from './pages/SecurityPage';
import Preferences from './pages/Preferences';
import NotificationPreferences from './pages/NotificationPreferences';
import DemoRouteBlock from './components/DemoRouteBlock';
import { RootPage, DemoAwareLogin, DemoAwareSignup } from './components/DemoAwareRoutes';

const AppRoutes = () => {
  return (
    <Router>
      <PageTracker />
      <RouteSeoManager />
      <Routes>
        <Route path="/" element={<RootPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/theme-example" element={<ThemeExample />} />
        <Route path="/login" element={<DemoAwareLogin />} />
        <Route path="/signup" element={<DemoAwareSignup />} />
        <Route element={<AppLayout />}>
          {/* /forbidden — always accessible to authenticated users */}
          <Route path="/forbidden" element={<Forbidden />} />

          {/* Dashboard — always visible */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* ── Invoices ─────────────────────────────────────────── */}
          <Route element={<PermissionRoute module="invoices" action="view" />}>
            <Route path="/invoices" element={<InvoiceList />} />
            <Route path="/invoices/:id" element={<InvoiceDetail />} />
            <Route path="/recurring-profiles" element={<RecurringProfileList />} />
          </Route>
          <Route element={<PermissionRoute module="invoices" action="create" />}>
            <Route path="/invoices/add" element={<AddEditInvoice />} />
            <Route path="/recurring-profiles/add" element={<AddEditRecurringProfile />} />
          </Route>
          <Route element={<PermissionRoute module="invoices" action="edit" />}>
            <Route path="/invoices/edit/:id" element={<AddEditInvoice />} />
            <Route path="/recurring-profiles/edit/:id" element={<AddEditRecurringProfile />} />
          </Route>

          {/* ── Quotes ───────────────────────────────────────────── */}
          <Route element={<PermissionRoute module="quotes" action="view" />}>
            <Route path="/quotes" element={<QuoteList />} />
            <Route path="/quotes/:id" element={<QuoteDetail />} />
          </Route>
          <Route element={<PermissionRoute module="quotes" action="create" />}>
            <Route path="/quotes/add" element={<AddEditQuote />} />
          </Route>
          <Route element={<PermissionRoute module="quotes" action="edit" />}>
            <Route path="/quotes/edit/:id" element={<AddEditQuote />} />
            <Route path="/quotes/convert/:id/:type" element={<ConvertQuote />} />
          </Route>

          {/* ── Sales Orders ─────────────────────────────────────── */}
          <Route element={<PermissionRoute module="purchase_orders" action="view" />}>
            <Route path="/sales-orders" element={<SalesOrderList />} />
          </Route>
          <Route element={<PermissionRoute module="purchase_orders" action="create" />}>
            <Route path="/sales-orders/add" element={<AddEditSalesOrder />} />
          </Route>
          <Route element={<PermissionRoute module="purchase_orders" action="edit" />}>
            <Route path="/sales-orders/edit/:id" element={<AddEditSalesOrder />} />
          </Route>

          {/* ── Customers ────────────────────────────────────────── */}
          <Route element={<PermissionRoute module="customers" action="view" />}>
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/customers/:id" element={<CustomerDetailPage />} />
          </Route>
          <Route element={<PermissionRoute module="customers" action="create" />}>
            <Route path="/customers/add" element={<AddEditCustomer />} />
          </Route>
          <Route element={<PermissionRoute module="customers" action="edit" />}>
            <Route path="/customers/edit/:id" element={<AddEditCustomer />} />
          </Route>

          {/* ── Products / Inventory ─────────────────────────────── */}
          <Route element={<PermissionRoute module="products" action="view" />}>
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetail />} />
          </Route>
          <Route element={<PermissionRoute module="products" action="create" />}>
            <Route path="/products/add" element={<AddEditProduct />} />
          </Route>
          <Route element={<PermissionRoute module="products" action="edit" />}>
            <Route path="/products/edit/:id" element={<AddEditProduct />} />
            <Route path="/stock-adjustment" element={<StockAdjustment />} />
          </Route>

          {/* ── Vendors ──────────────────────────────────────────── */}
          <Route element={<PermissionRoute module="vendors" action="view" />}>
            <Route path="/vendors" element={<VendorList />} />
          </Route>
          <Route element={<PermissionRoute module="vendors" action="create" />}>
            <Route path="/vendors/add" element={<AddEditVendor />} />
          </Route>
          <Route element={<PermissionRoute module="vendors" action="edit" />}>
            <Route path="/vendors/edit/:id" element={<AddEditVendor />} />
          </Route>

          {/* ── Purchase Orders ──────────────────────────────────── */}
          <Route element={<PermissionRoute module="purchase_orders" action="view" />}>
            <Route path="/purchase-orders" element={<PurchaseOrderList />} />
          </Route>
          <Route element={<PermissionRoute module="purchase_orders" action="create" />}>
            <Route path="/purchase-orders/add" element={<AddEditPurchaseOrder />} />
          </Route>
          <Route element={<PermissionRoute module="purchase_orders" action="edit" />}>
            <Route path="/purchase-orders/edit/:id" element={<AddEditPurchaseOrder />} />
          </Route>

          {/* ── Bills ────────────────────────────────────────────── */}
          <Route element={<PermissionRoute module="bills" action="view" />}>
            <Route path="/bills" element={<BillList />} />
            <Route path="/bills/:id" element={<BillDetails />} />
          </Route>
          <Route element={<PermissionRoute module="bills" action="create" />}>
            <Route path="/bills/add" element={<AddEditBill />} />
          </Route>
          <Route element={<PermissionRoute module="bills" action="edit" />}>
            <Route path="/bills/edit/:id" element={<AddEditBill />} />
          </Route>

          {/* ── Expenses ─────────────────────────────────────────── */}
          <Route element={<PermissionRoute module="expenses" action="view" />}>
            <Route path="/expenses" element={<ExpenseList />} />
            <Route path="/expenses/:id" element={<ExpenseDetail />} />
          </Route>
          <Route element={<PermissionRoute module="expenses" action="create" />}>
            <Route path="/expenses/add" element={<AddEditExpense />} />
          </Route>
          <Route element={<PermissionRoute module="expenses" action="edit" />}>
            <Route path="/expenses/edit/:id" element={<AddEditExpense />} />
          </Route>

          {/* ── Banking ──────────────────────────────────────────── */}
          <Route element={<PermissionRoute module="banking" action="view" />}>
            <Route path="/bank-accounts" element={<BankAccounts />} />
            <Route path="/bank-import" element={<BankImportWorkflow />} />
            <Route path="/bank-reconciliation" element={<BankReconciliation />} />
          </Route>

          {/* ── Reports ──────────────────────────────────────────── */}
          <Route element={<PermissionRoute module="reports" action="view" />}>
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
          </Route>

          {/* ── Settings — admin / settings.view ─────────────────── */}
          <Route element={<PermissionRoute module="settings" action="view" />}>
            <Route path="/settings" element={<Navigate to="/settings/organization-profile" replace />} />
            <Route path="/settings/organization-profile" element={<DemoRouteBlock><OrganizationProfile /></DemoRouteBlock>} />
            <Route path="/settings/branding" element={<DemoRouteBlock><BrandingSettings /></DemoRouteBlock>} />
            <Route path="/settings/invoice-preferences" element={<DemoRouteBlock><InvoicePreferences /></DemoRouteBlock>} />
            <Route path="/settings/taxes" element={<DemoRouteBlock><TaxSettings /></DemoRouteBlock>} />
            <Route path="/settings/inventory" element={<DemoRouteBlock><InventorySettings /></DemoRouteBlock>} />
          </Route>
          <Route element={<PermissionRoute module="user_management" action="view" />}>
            <Route path="/settings/users" element={<DemoRouteBlock><UserManagement /></DemoRouteBlock>} />
          </Route>
          <Route element={<PermissionRoute module="roles" action="view" />}>
            <Route path="/settings/roles" element={<DemoRouteBlock><RoleManagement /></DemoRouteBlock>} />
          </Route>
          <Route element={<PermissionRoute module="audit_logs" action="view" />}>
            <Route path="/activity" element={<DemoRouteBlock><ActivityCenterPage /></DemoRouteBlock>} />
            <Route path="/settings/audit-log" element={<DemoRouteBlock><AuditLogPage /></DemoRouteBlock>} />
            <Route path="/settings/audit-logs" element={<DemoRouteBlock><AuditLogPage /></DemoRouteBlock>} />
          </Route>
          <Route element={<PermissionRoute module="automation" action="view" />}>
            <Route path="/settings/automation" element={<DemoRouteBlock><AutomationSettings /></DemoRouteBlock>} />
          </Route>
          <Route element={<PermissionRoute module="integrations" action="view" />}>
            <Route path="/settings/integrations" element={<DemoRouteBlock><IntegrationSettings /></DemoRouteBlock>} />
          </Route>

          {/* ── My Account — all authenticated users (no perm check) */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings/my-profile" element={<MyProfile />} />
          <Route path="/settings/security" element={<DemoRouteBlock><SecurityPage /></DemoRouteBlock>} />
          <Route path="/settings/preferences" element={<Preferences />} />
          <Route path="/settings/notifications" element={<NotificationPreferences />} />
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
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/cookies" element={<ComingSoon />} />
        <Route path="/pricing" element={<ComingSoon />} />

        {/* Authentication Pages */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Super Admin Module — fully isolated */}
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
