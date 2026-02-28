// ─────────────────────────────────────────────────────────────────────────────
// Dashboard dummy / roadmap data
// Real API data lives in Dashboard.jsx state — these are future/static values.
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PaymentsIcon from "@mui/icons-material/Payments";
import PeopleIcon from "@mui/icons-material/People";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import BarChartIcon from "@mui/icons-material/BarChart";

// ── KPI cards that are NOT backed by real API data yet ─────────────────────
export const dummyKpiCards = [
    {
        id: "receivables",
        label: "Total Receivables",
        value: "₹1,85,652",
        trend: null,
        accentColor: "warning.main",
        iconColor: "warning.main",
        iconBg: "warning.50",
        icon: <ReceiptLongIcon sx={{ fontSize: 22 }} />,
    },
    {
        id: "payables",
        label: "Total Payables",
        value: "₹0.00",
        trend: null,
        accentColor: "error.main",
        iconColor: "error.main",
        iconBg: "error.50",
        icon: <PaymentsIcon sx={{ fontSize: 22 }} />,
    },
    {
        id: "mrr",
        label: "Monthly Recurring Revenue",
        value: "Coming Soon",
        trend: null,
        accentColor: "secondary.main",
        iconColor: "secondary.main",
        iconBg: "secondary.50",
        icon: <BarChartIcon sx={{ fontSize: 22 }} />,
    },
    {
        id: "gst",
        label: "Pending GST Filing",
        value: "Coming Soon",
        trend: null,
        accentColor: "info.main",
        iconColor: "info.main",
        iconBg: "info.50",
        icon: <AssessmentIcon sx={{ fontSize: 22 }} />,
    },
];

// ── Dummy banking data ─────────────────────────────────────────────────────
export const dummyBankingData = {
    connectedAccounts: 2,
    recentTransactions: [
        { id: 1, desc: "Kotak Mahindra Bank", amount: "−₹1,21,938", date: "Feb 18" },
        { id: 2, desc: "ICICI Bank Transfer", amount: "+₹98,165", date: "Feb 17" },
        { id: 3, desc: "Zoho Payments Clearing", amount: "₹0.00", date: "Feb 16" },
        { id: 4, desc: "Razorpay Settlement", amount: "+₹12,540", date: "Feb 15" },
    ],
};

// ── Product capability feature list ───────────────────────────────────────
export const featureCapabilities = [
    // Implemented
    { id: "invoicing", title: "Invoicing", status: "Live", icon: <ReceiptIcon sx={{ fontSize: 22 }} /> },
    { id: "customers", title: "Customers", status: "Live", icon: <PeopleIcon sx={{ fontSize: 22 }} /> },
    { id: "products", title: "Products", status: "Live", icon: <Inventory2Icon sx={{ fontSize: 22 }} /> },
    { id: "stock", title: "Stock Control", status: "Live", icon: <SyncAltIcon sx={{ fontSize: 22 }} /> },

    // Upcoming
    { id: "bank-recon", title: "Bank Reconciliation", status: "In Progress", icon: <AccountBalanceIcon sx={{ fontSize: 22 }} /> },
    { id: "gst-auto", title: "GST Auto Filing", status: "Planned", icon: <AssessmentIcon sx={{ fontSize: 22 }} /> },
    { id: "smart-reports", title: "Smart Reports", status: "Planned", icon: <BarChartIcon sx={{ fontSize: 22 }} /> },
    { id: "expenses", title: "Expense Tracking", status: "Planned", icon: <ReceiptLongIcon sx={{ fontSize: 22 }} /> },
    { id: "payments", title: "Payment Gateway Integration", status: "Planned", icon: <CreditCardIcon sx={{ fontSize: 22 }} /> },
    { id: "ai", title: "AI Insights", status: "Planned", icon: <LightbulbIcon sx={{ fontSize: 22 }} /> },
];
