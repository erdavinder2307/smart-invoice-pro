import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Alert,
  CircularProgress,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Receipt,
  AccountBalanceWallet,
  CalendarToday,
  Payment
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getCustomerInvoices } from '../config/api';

// Subcomponents
import WelcomeProfileCard from '../components/customer/WelcomeProfileCard';
import StatsCard from '../components/customer/StatsCard';
import InvoiceTable from '../components/customer/InvoiceTable';
import PaymentSection from '../components/customer/PaymentSection';
import PaymentHistory from '../components/customer/PaymentHistory';
import SpendingChart from '../components/customer/SpendingChart';
import NotificationsPanel from '../components/customer/NotificationsPanel';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [customerData, setCustomerData] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('customerToken');
    const customer = localStorage.getItem('customerData');

    if (!token || !customer) {
      navigate('/customer/login');
      return;
    }

    try {
      setCustomerData(JSON.parse(customer));
      fetchDashboardData(token);
    } catch {
      navigate('/customer/login');
    }
  }, [navigate]);

  const fetchDashboardData = async (token) => {
    try {
      setLoading(true);
      setError('');

      const response = await getCustomerInvoices(token);
      setInvoices(response.data || []);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerData');
        navigate('/customer/login');
        return;
      }
      setError('Unable to load your invoices. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerData');
    navigate('/customer/login');
  };

  const calculateStats = () => {
    const unpaidInvoices = invoices.filter(inv => inv.status === 'Unpaid' || inv.status === 'Overdue');
    const outstandingBalance = unpaidInvoices.reduce((sum, inv) => sum + (inv.amount || inv.total_amount || 0), 0);
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(inv => inv.status === 'Paid');
    const lastPayment = paidInvoices.length > 0 ? paidInvoices[paidInvoices.length - 1] : null;
    const nextDueInvoice = unpaidInvoices
      .sort((a, b) => new Date(a.dueDate || a.due_date) - new Date(b.dueDate || b.due_date))[0];

    return {
      outstandingBalance,
      totalInvoices,
      lastPayment,
      nextDueDate: nextDueInvoice?.dueDate || nextDueInvoice?.due_date || null,
    };
  };

  const stats = calculateStats();

  const filteredInvoices = invoices.filter(invoice => {
    const invoiceId = invoice.id || invoice.invoice_number || '';
    const description = invoice.description || '';
    const matchesSearch =
      invoiceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
      >
        <CircularProgress sx={{ color: 'white' }} size={60} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        pb: 4,
      }}
    >
      <Container maxWidth="xl" sx={{ pt: 3 }}>
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {error}
          </Alert>
        )}

        <WelcomeProfileCard
          customerData={customerData}
          onLogout={handleLogout}
          isMobile={isMobile}
        />

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Outstanding Balance"
              value={`$${stats.outstandingBalance.toFixed(2)}`}
              icon={<AccountBalanceWallet />}
              color="rgba(244, 67, 54, 0.1)"
              iconColor="#f44336"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Invoices"
              value={stats.totalInvoices}
              icon={<Receipt />}
              color="rgba(33, 150, 243, 0.1)"
              iconColor="#2196f3"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Last Payment"
              value={stats.lastPayment ? `$${(stats.lastPayment.amount || stats.lastPayment.total_amount || 0).toFixed(2)}` : 'No payments yet'}
              subtitle={stats.lastPayment?.date || stats.lastPayment?.issue_date}
              icon={<Payment />}
              color="rgba(76, 175, 80, 0.1)"
              iconColor="#4caf50"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Next Due Date"
              value={stats.nextDueDate ? new Date(stats.nextDueDate).toLocaleDateString() : 'None outstanding'}
              icon={<CalendarToday />}
              color="rgba(255, 152, 0, 0.1)"
              iconColor="#ff9800"
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <InvoiceTable
              invoices={filteredInvoices}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              onViewInvoice={(id) => navigate(`/customer/invoice/${id}`)}
              isMobile={isMobile}
            />

            <PaymentSection
              unpaidInvoices={invoices.filter(inv => inv.status === 'Unpaid' || inv.status === 'Overdue')}
              onPayment={(invoiceId, amount) => {
                console.log('Payment initiated for:', invoiceId, amount);
              }}
            />

            <PaymentHistory payments={payments} />
          </Grid>

          <Grid item xs={12} lg={4}>
            <NotificationsPanel notifications={notifications} />
            <SpendingChart invoices={invoices} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CustomerDashboard;
