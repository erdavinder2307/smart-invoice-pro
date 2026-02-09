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
    // Get customer data from localStorage
    const token = localStorage.getItem('customerToken');
    const customer = localStorage.getItem('customerData');
    
    if (!token || !customer) {
      navigate('/customer/login');
      return;
    }

    try {
      setCustomerData(JSON.parse(customer));
      fetchDashboardData();
    } catch (error) {
      console.error('Error parsing customer data:', error);
      navigate('/customer/login');
    }
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('customerToken');
      
      // Fetch invoices
      try {
        const response = await getCustomerInvoices(token);
        setInvoices(response.data || []);
      } catch (error) {
        console.error('Error fetching invoices:', error);
        // Use comprehensive mock data
        setInvoices([
          {
            id: 'INV-001',
            date: '2024-01-15',
            dueDate: '2024-02-15',
            status: 'Paid',
            amount: 1250.00,
            description: 'Web Development Services'
          },
          {
            id: 'INV-002',
            date: '2024-02-15',
            dueDate: '2024-03-15',
            status: 'Unpaid',
            amount: 890.50,
            description: 'UI/UX Design Package'
          },
          {
            id: 'INV-003',
            date: '2024-03-15',
            dueDate: '2024-04-15',
            status: 'Overdue',
            amount: 1100.75,
            description: 'Monthly Maintenance'
          },
          {
            id: 'INV-004',
            date: '2024-04-15',
            dueDate: '2024-05-15',
            status: 'Paid',
            amount: 750.00,
            description: 'Mobile App Development'
          },
          {
            id: 'INV-005',
            date: '2024-05-15',
            dueDate: '2024-06-15',
            status: 'Unpaid',
            amount: 2100.25,
            description: 'E-commerce Platform'
          }
        ]);
      }

      // Mock payment history
      setPayments([
        {
          id: 'PAY-001',
          invoiceId: 'INV-001',
          amount: 1250.00,
          date: '2024-02-10',
          method: 'Credit Card',
          status: 'Completed'
        },
        {
          id: 'PAY-002',
          invoiceId: 'INV-004',
          amount: 750.00,
          date: '2024-05-10',
          method: 'PayPal',
          status: 'Completed'
        },
        {
          id: 'PAY-003',
          invoiceId: 'INV-002',
          amount: 445.25,
          date: '2024-03-05',
          method: 'Bank Transfer',
          status: 'Partial'
        }
      ]);

      // Mock notifications
      setNotifications([
        {
          id: 1,
          type: 'overdue',
          message: 'Invoice INV-003 is overdue by 15 days',
          date: '2024-08-20',
          priority: 'high'
        },
        {
          id: 2,
          type: 'due',
          message: 'Invoice INV-002 is due in 3 days',
          date: '2024-08-18',
          priority: 'medium'
        },
        {
          id: 3,
          type: 'payment',
          message: 'Payment received for Invoice INV-004',
          date: '2024-08-15',
          priority: 'low'
        }
      ]);

      setError('Using sample data - API endpoint not available');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerData');
    navigate('/customer/login');
  };

  // Calculate stats
  const calculateStats = () => {
    const unpaidInvoices = invoices.filter(inv => inv.status === 'Unpaid' || inv.status === 'Overdue');
    const outstandingBalance = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalInvoices = invoices.length;
    const lastPayment = payments.length > 0 ? payments[payments.length - 1] : null;
    const nextDueInvoice = unpaidInvoices
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];

    return {
      outstandingBalance,
      totalInvoices,
      lastPayment,
      nextDueDate: nextDueInvoice?.dueDate || null
    };
  };

  const stats = calculateStats();

  // Filter invoices based on search and status
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.description?.toLowerCase().includes(searchQuery.toLowerCase());
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
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
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
        pb: 4
      }}
    >
      <Container maxWidth="xl" sx={{ pt: 3 }}>
        {error && (
          <Alert 
            severity="info" 
            sx={{ 
              mb: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)'
            }}
          >
            {error}
          </Alert>
        )}

        {/* Welcome + Profile Card */}
        <WelcomeProfileCard 
          customerData={customerData} 
          onLogout={handleLogout}
          isMobile={isMobile}
        />

        {/* Stats Cards Row */}
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
              value={stats.lastPayment ? `$${stats.lastPayment.amount.toFixed(2)}` : 'No payments'}
              subtitle={stats.lastPayment?.date}
              icon={<Payment />}
              color="rgba(76, 175, 80, 0.1)"
              iconColor="#4caf50"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Next Due Date"
              value={stats.nextDueDate ? new Date(stats.nextDueDate).toLocaleDateString() : 'No due dates'}
              icon={<CalendarToday />}
              color="rgba(255, 152, 0, 0.1)"
              iconColor="#ff9800"
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} lg={8}>
            {/* Invoice Table */}
            <InvoiceTable
              invoices={filteredInvoices}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              onViewInvoice={(id) => navigate(`/customer/invoice/${id}`)}
              isMobile={isMobile}
            />

            {/* Payment Section */}
            <PaymentSection
              unpaidInvoices={invoices.filter(inv => inv.status === 'Unpaid' || inv.status === 'Overdue')}
              onPayment={(invoiceId, amount) => {
                console.log('Payment initiated for:', invoiceId, amount);
                // Integrate with payment gateway
              }}
            />

            {/* Payment History */}
            <PaymentHistory payments={payments} />
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} lg={4}>
            {/* Notifications Panel */}
            <NotificationsPanel notifications={notifications} />

            {/* Spending Trends Chart */}
            <SpendingChart invoices={invoices} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CustomerDashboard;
