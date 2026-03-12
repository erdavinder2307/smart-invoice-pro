import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Container,
  Paper,
  Divider
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TimelineIcon from '@mui/icons-material/Timeline';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';

const Reports = () => {
  const navigate = useNavigate();

  const reports = [
    {
      title: 'Profit & Loss',
      description: 'View revenue, expenses, and net profit over time',
      icon: <TrendingUpIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      path: '/reports/profit-loss',
      color: '#4CAF50'
    },
    {
      title: 'Balance Sheet',
      description: 'Overview of assets, liabilities, and equity',
      icon: <AccountBalanceIcon sx={{ fontSize: 48, color: 'info.main' }} />,
      path: '/reports/balance-sheet',
      color: '#2196F3'
    },
    {
      title: 'A/R Aging',
      description: 'Track overdue invoices by age brackets',
      icon: <MoneyOffIcon sx={{ fontSize: 48, color: 'warning.main' }} />,
      path: '/reports/ar-aging',
      color: '#FF9800'
    },
    {
      title: 'Cash Flow',
      description: 'Monitor cash inflows and outflows',
      icon: <TimelineIcon sx={{ fontSize: 48, color: 'success.main' }} />,
      path: '/reports/cash-flow',
      color: '#00BCD4'
    },
    {
      title: 'Sales Summary',
      description: 'Detailed analysis of sales by product and customer',
      icon: <ReceiptLongIcon sx={{ fontSize: 48, color: 'secondary.main' }} />,
      path: '/reports/sales-summary',
      color: '#9C27B0'
    },
    {
      title: 'Expense Report',
      description: 'Track and categorize business expenses',
      icon: <AssessmentIcon sx={{ fontSize: 48, color: 'error.main' }} />,
      path: '/reports/expense-report',
      color: '#F44336'
    }
  ];

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}
        >
          <Typography variant="h4" gutterBottom fontWeight="bold">
            📊 Financial Reports
          </Typography>
          <Typography variant="body1">
            Generate comprehensive financial reports to track your business performance,
            analyze trends, and make informed decisions.
          </Typography>
        </Paper>

        <Grid container spacing={3}>
          {reports.map((report, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardActionArea
                  onClick={() => navigate(report.path)}
                  sx={{ height: '100%', p: 2 }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box
                      sx={{
                        mb: 2,
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: `${report.color}15`,
                        display: 'inline-block'
                      }}
                    >
                      {report.icon}
                    </Box>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      {report.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {report.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 6 }}>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: 'primary.50', borderLeft: 4, borderColor: 'primary.main' }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    💡 Quick Tip
                  </Typography>
                  <Typography variant="body2">
                    Use date filters to compare performance across different periods.
                    Export reports to PDF or Excel for presentations.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: 'success.50', borderLeft: 4, borderColor: 'success.main' }}>
                <CardContent>
                  <Typography variant="h6" color="success.main" gutterBottom>
                    📈 Track Trends
                  </Typography>
                  <Typography variant="body2">
                    Monitor month-over-month changes to identify growth opportunities
                    and areas requiring attention.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: 'warning.50', borderLeft: 4, borderColor: 'warning.main' }}>
                <CardContent>
                  <Typography variant="h6" color="warning.main" gutterBottom>
                    ⏰ Real-Time Data
                  </Typography>
                  <Typography variant="body2">
                    All reports are generated from live data, ensuring you always
                    have the most accurate information.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </MainLayout>
  );
};

export default Reports;
