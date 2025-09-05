import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Paper,
  Avatar
} from '@mui/material';
import {
  Receipt,
  CreditCard,
  AccountBalance,
  Payment as PaymentIcon,
  GetApp
} from '@mui/icons-material';

const PaymentHistory = ({ payments }) => {
  const getPaymentMethodIcon = (method) => {
    switch (method.toLowerCase()) {
      case 'credit card':
        return <CreditCard />;
      case 'paypal':
        return <PaymentIcon />;
      case 'bank transfer':
        return <AccountBalance />;
      default:
        return <PaymentIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return { backgroundColor: '#4caf50', color: 'white' };
      case 'Partial':
        return { backgroundColor: '#ff9800', color: 'white' };
      case 'Failed':
        return { backgroundColor: '#f44336', color: 'white' };
      default:
        return { backgroundColor: '#757575', color: 'white' };
    }
  };

  if (payments.length === 0) {
    return (
      <Card
        sx={{
          mb: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
        }}
      >
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          <Box sx={{ py: 4 }}>
            <Receipt sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Payment History
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your payment history will appear here once you make payments.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        mb: 3,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography 
          variant="h6" 
          gutterBottom
          sx={{
            fontWeight: 'bold',
            color: '#2c3e50',
            mb: 3
          }}
        >
          Payment History
        </Typography>

        <TableContainer 
          component={Paper} 
          sx={{ 
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            boxShadow: 'none',
            border: '1px solid rgba(224, 224, 224, 0.3)'
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(102, 126, 234, 0.1)' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  Payment ID
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  Invoice ID
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  Amount
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  Date
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  Method
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((payment) => (
                <TableRow 
                  key={payment.id}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(102, 126, 234, 0.05)'
                    }
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold" color="primary">
                      {payment.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {payment.invoiceId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      ${payment.amount.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(payment.date).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          backgroundColor: 'rgba(102, 126, 234, 0.1)',
                          color: '#667eea'
                        }}
                      >
                        {getPaymentMethodIcon(payment.method)}
                      </Avatar>
                      <Typography variant="body2">
                        {payment.method}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={payment.status}
                      size="small"
                      sx={{
                        ...getStatusColor(payment.status),
                        fontWeight: 'bold',
                        fontSize: '0.75rem'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        color: '#667eea',
                        '&:hover': {
                          backgroundColor: 'rgba(102, 126, 234, 0.2)'
                        }
                      }}
                    >
                      <GetApp fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Showing {payments.length} payment record(s)
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PaymentHistory;
