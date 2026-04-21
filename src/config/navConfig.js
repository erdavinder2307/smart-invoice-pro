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
  },
  sales: {
    id: "sales",
    label: "Sales",
    labelKey: "sidebarNav.sales",
    icon: <PointOfSaleIcon />,
    expandable: true,
    children: [
      { id: "customers", label: "Customers", labelKey: "sidebarNav.customers", icon: <PeopleIcon />, path: "/customers" },
      { id: "quotes", label: "Quotes", labelKey: "sidebarNav.quotes", icon: <RequestQuoteIcon />, path: "/quotes" },
      { id: "invoices", label: "Invoices", labelKey: "sidebarNav.invoices", icon: <ReceiptIcon />, path: "/invoices" },
      { id: "recurring", label: "Recurring Invoices", labelKey: "sidebarNav.recurringInvoices", icon: <EventRepeatIcon />, path: "/recurring-profiles" },
    ],
  },
  purchases: {
    id: "purchases",
    label: "Purchases",
    labelKey: "sidebarNav.purchases",
    icon: <ShoppingCartIcon />,
    expandable: true,
    children: [
      { id: "vendors", label: "Vendors", labelKey: "sidebarNav.vendors", icon: <LocalShippingIcon />, path: "/vendors" },
      { id: "purchase-orders", label: "Purchase Orders", labelKey: "sidebarNav.purchaseOrders", icon: <ShoppingCartIcon />, path: "/purchase-orders" },
      { id: "bills", label: "Bills", labelKey: "sidebarNav.bills", icon: <AssignmentIcon />, path: "/bills" },
    ],
  },
  banking: {
    id: "banking",
    label: "Banking",
    labelKey: "sidebarNav.banking",
    icon: <AccountBalanceIcon />,
    expandable: true,
    children: [
      { id: "bank-accounts", label: "Bank Accounts", labelKey: "sidebarNav.bankAccounts", icon: <AccountBalanceIcon />, path: "/bank-accounts" },
    ],
  },
  reports: {
    id: "reports",
    label: "Reports",
    labelKey: "sidebarNav.reports",
    icon: <AssessmentIcon />,
    path: "/reports",
  },
  settings: {
    id: "settings",
    label: "Settings",
    labelKey: "sidebarNav.settings",
    icon: <SettingsIcon />,
    adminOnly: true,
    expandable: true,
    children: [
      { id: "org-profile", label: "Organization Profile", labelKey: "settingsNav.organization", icon: <BusinessIcon sx={{ fontSize: 20 }} />, path: "/settings/organization-profile" },
      { id: "branding", label: "Branding", labelKey: "settingsNav.branding", icon: <BrushIcon sx={{ fontSize: 20 }} />, path: "/settings/branding" },
      { id: "invoice-preferences", label: "Invoice Preferences", labelKey: "settingsNav.invoicePreferences", icon: <DescriptionIcon sx={{ fontSize: 20 }} />, path: "/settings/invoice-preferences" },
      { id: "taxes", label: "Taxes", labelKey: "settingsNav.taxes", icon: <ReceiptLongIcon sx={{ fontSize: 20 }} />, path: "/settings/taxes" },
      { id: "users", label: "User Management", labelKey: "settingsNav.userManagement", icon: <PeopleIcon sx={{ fontSize: 20 }} />, path: "/settings/users" },
      { id: "roles", label: "Roles", labelKey: "settingsNav.roles", icon: <AdminPanelSettingsIcon sx={{ fontSize: 20 }} />, path: "/settings/roles" },
      { id: "automation", label: "Automation", labelKey: "settingsNav.automation", icon: <NotificationsActiveIcon sx={{ fontSize: 20 }} />, path: "/settings/automation" },
      { id: "integrations", label: "Integrations", labelKey: "settingsNav.integrations", icon: <ExtensionIcon sx={{ fontSize: 20 }} />, path: "/settings/integrations" },
      { id: "audit-log", label: "Audit Log", labelKey: "settingsNav.auditLog", icon: <HistoryIcon sx={{ fontSize: 20 }} />, path: "/settings/audit-log" },
    ],
  },
};
