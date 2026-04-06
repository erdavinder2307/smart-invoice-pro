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

export const NAV_CONFIG = {
  dashboard: {
    id: "dashboard",
    label: "Dashboard",
    icon: <DashboardIcon />,
    path: "/dashboard",
  },
  items: {
    id: "items",
    label: "Items",
    icon: <Inventory2Icon />,
    path: "/products",
  },
  sales: {
    id: "sales",
    label: "Sales",
    icon: <PointOfSaleIcon />,
    expandable: true,
    children: [
      { id: "customers", label: "Customers", icon: <PeopleIcon />, path: "/customers" },
      { id: "quotes", label: "Quotes", icon: <RequestQuoteIcon />, path: "/quotes" },
      { id: "invoices", label: "Invoices", icon: <ReceiptIcon />, path: "/invoices" },
      { id: "recurring", label: "Recurring Invoices", icon: <EventRepeatIcon />, path: "/recurring-profiles" },
    ],
  },
  purchases: {
    id: "purchases",
    label: "Purchases",
    icon: <ShoppingCartIcon />,
    expandable: true,
    children: [
      { id: "vendors", label: "Vendors", icon: <LocalShippingIcon />, path: "/vendors" },
      { id: "purchase-orders", label: "Purchase Orders", icon: <ShoppingCartIcon />, path: "/purchase-orders" },
      { id: "bills", label: "Bills", icon: <AssignmentIcon />, path: "/bills" },
    ],
  },
  banking: {
    id: "banking",
    label: "Banking",
    icon: <AccountBalanceIcon />,
    expandable: true,
    children: [
      { id: "bank-accounts", label: "Bank Accounts", icon: <AccountBalanceIcon />, path: "/bank-accounts" },
    ],
  },
  reports: {
    id: "reports",
    label: "Reports",
    icon: <AssessmentIcon />,
    path: "/reports",
  },
  settings: {
    id: "settings",
    label: "Settings",
    icon: <SettingsIcon />,
    adminOnly: true,
    expandable: true,
    children: [
      { id: "org-profile", label: "Organization Profile", icon: <BusinessIcon sx={{ fontSize: 20 }} />, path: "/settings/organization-profile" },
      { id: "branding", label: "Branding", icon: <BrushIcon sx={{ fontSize: 20 }} />, path: "/settings/branding" },
      { id: "invoice-preferences", label: "Invoice Preferences", icon: <DescriptionIcon sx={{ fontSize: 20 }} />, path: "/settings/invoice-preferences" },
      { id: "taxes", label: "Taxes", icon: <ReceiptLongIcon sx={{ fontSize: 20 }} />, path: "/settings/taxes" },
      { id: "users", label: "User Management", icon: <PeopleIcon sx={{ fontSize: 20 }} />, path: "/settings/users" },
      { id: "roles", label: "Roles", icon: <AdminPanelSettingsIcon sx={{ fontSize: 20 }} />, path: "/settings/roles" },
      { id: "automation", label: "Automation", icon: <NotificationsActiveIcon sx={{ fontSize: 20 }} />, path: "/settings/automation" },
    ],
  },
};
