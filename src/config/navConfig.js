import DashboardIcon from "@mui/icons-material/Dashboard";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import BrushIcon from "@mui/icons-material/Brush";
import DescriptionIcon from "@mui/icons-material/Description";
import PeopleIcon from "@mui/icons-material/People";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import BusinessIcon from "@mui/icons-material/Business";
import HistoryIcon from "@mui/icons-material/History";
import ExtensionIcon from "@mui/icons-material/Extension";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import TuneIcon from "@mui/icons-material/Tune";

export const NAV_CONFIG = {
  dashboard: {
    id: "dashboard",
    label: "Dashboard",
    labelKey: "sidebarNav.dashboard",
    icon: <DashboardIcon />,
    path: "/dashboard",
  },
  items: {
    id: "items",
    label: "Items",
    labelKey: "sidebarNav.items",
    icon: <Inventory2Icon />,
    path: "/products",
    permission: { module: "products", action: "view" },
  },
  sales: {
    id: "sales",
    label: "Sales",
    labelKey: "sidebarNav.sales",
    icon: <PointOfSaleIcon />,
    expandable: true,
    children: [
      { id: "customers", label: "Customers", labelKey: "sidebarNav.customers", icon: <PeopleIcon />, path: "/customers", permission: { module: "customers", action: "view" } },
      { id: "quotes", label: "Quotes", labelKey: "sidebarNav.quotes", icon: <RequestQuoteIcon />, path: "/quotes", permission: { module: "quotes", action: "view" } },
      { id: "invoices", label: "Invoices", labelKey: "sidebarNav.invoices", icon: <ReceiptIcon />, path: "/invoices", permission: { module: "invoices", action: "view" } },
      { id: "recurring", label: "Recurring Invoices", labelKey: "sidebarNav.recurringInvoices", icon: <EventRepeatIcon />, path: "/recurring-profiles", permission: { module: "invoices", action: "view" } },
    ],
  },
  purchases: {
    id: "purchases",
    label: "Purchases",
    labelKey: "sidebarNav.purchases",
    icon: <ShoppingCartIcon />,
    expandable: true,
    children: [
      { id: "vendors", label: "Vendors", labelKey: "sidebarNav.vendors", icon: <LocalShippingIcon />, path: "/vendors", permission: { module: "vendors", action: "view" } },
      { id: "purchase-orders", label: "Purchase Orders", labelKey: "sidebarNav.purchaseOrders", icon: <ShoppingCartIcon />, path: "/purchase-orders", permission: { module: "purchase_orders", action: "view" } },
      { id: "bills", label: "Bills", labelKey: "sidebarNav.bills", icon: <AssignmentIcon />, path: "/bills", permission: { module: "bills", action: "view" } },
    ],
  },
  banking: {
    id: "banking",
    label: "Banking",
    labelKey: "sidebarNav.banking",
    icon: <AccountBalanceIcon />,
    expandable: true,
    permission: { module: "banking", action: "view" },
    children: [
      { id: "bank-accounts", label: "Bank Accounts", labelKey: "sidebarNav.bankAccounts", icon: <AccountBalanceIcon />, path: "/bank-accounts", permission: { module: "banking", action: "view" } },
    ],
  },
  reports: {
    id: "reports",
    label: "Reports",
    labelKey: "sidebarNav.reports",
    icon: <AssessmentIcon />,
    path: "/reports",
    permission: { module: "reports", action: "view" },
  },
  // ── My Account (visible to all authenticated users) ───────────────────────
  myAccount: {
    id: "myAccount",
    label: "My Account",
    labelKey: "sidebarNav.myAccount",
    icon: <PersonOutlineIcon />,
    expandable: true,
    children: [
      { id: "my-profile",       label: "My Profile",       labelKey: "accountNav.myProfile",       icon: <PersonOutlineIcon sx={{ fontSize: 20 }} />,    path: "/settings/my-profile" },
      { id: "notifications-pref", label: "Notifications", labelKey: "accountNav.notifications",   icon: <NotificationsNoneIcon sx={{ fontSize: 20 }} />, path: "/settings/notifications" },
      { id: "preferences",      label: "Preferences",      labelKey: "accountNav.preferences",      icon: <TuneIcon sx={{ fontSize: 20 }} />,              path: "/settings/preferences" },
      { id: "security",         label: "Security",         labelKey: "accountNav.security",         icon: <LockOutlinedIcon sx={{ fontSize: 20 }} />,      path: "/settings/security" },
    ],
  },
  // ── Organisation Settings — section shows if ANY child is accessible ────────
  settings: {
    id: "settings",
    label: "Settings",
    labelKey: "sidebarNav.settings",
    icon: <SettingsIcon />,
    // No top-level permission — visibility driven by children (see renderExpandableSection)
    expandable: true,
    children: [
      { id: "org-profile",          label: "Organization Profile", labelKey: "settingsNav.organization",      icon: <BusinessIcon sx={{ fontSize: 20 }} />,           path: "/settings/organization-profile", permission: { module: "settings",        action: "view" } },
      { id: "branding",             label: "Branding",             labelKey: "settingsNav.branding",           icon: <BrushIcon sx={{ fontSize: 20 }} />,              path: "/settings/branding",             permission: { module: "settings",        action: "view" } },
      { id: "invoice-preferences",  label: "Invoice Preferences",  labelKey: "settingsNav.invoicePreferences", icon: <DescriptionIcon sx={{ fontSize: 20 }} />,        path: "/settings/invoice-preferences",  permission: { module: "settings",        action: "view" } },
      { id: "taxes",                label: "Taxes",                labelKey: "settingsNav.taxes",              icon: <ReceiptLongIcon sx={{ fontSize: 20 }} />,        path: "/settings/taxes",                permission: { module: "settings",        action: "view" } },
      { id: "users",                label: "User Management",      labelKey: "settingsNav.userManagement",     icon: <PeopleIcon sx={{ fontSize: 20 }} />,             path: "/settings/users",                permission: { module: "user_management", action: "view" } },
      { id: "roles",                label: "Roles",                labelKey: "settingsNav.roles",              icon: <AdminPanelSettingsIcon sx={{ fontSize: 20 }} />, path: "/settings/roles",                permission: { module: "roles",           action: "view" } },
      { id: "automation",           label: "Automation",           labelKey: "settingsNav.automation",         icon: <NotificationsActiveIcon sx={{ fontSize: 20 }} />, path: "/settings/automation",          permission: { module: "automation",      action: "view" } },
      { id: "integrations",         label: "Integrations",         labelKey: "settingsNav.integrations",       icon: <ExtensionIcon sx={{ fontSize: 20 }} />,          path: "/settings/integrations",         permission: { module: "integrations",    action: "view" } },
      { id: "activity",             label: "Activity",             labelKey: "settingsNav.activity",           icon: <HistoryIcon sx={{ fontSize: 20 }} />,            path: "/activity",                      permission: { module: "audit_logs",      action: "view" } },
    ],
  },
};
