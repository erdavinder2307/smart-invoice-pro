import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Timeline
} from '@mui/icons-material';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

const SpendingChart = ({ invoices }) => {

  const chartData = useMemo(() => {
    // Group invoices by month
    const monthlyData = {};
    
    invoices.forEach(invoice => {
      const date = new Date(invoice.date);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthName,
          amount: 0,
          count: 0
        };
      }
      
      monthlyData[monthKey].amount += invoice.amount;
      monthlyData[monthKey].count += 1;
    });

    // Convert to array and sort by date
    return Object.keys(monthlyData)
      .sort()
      .slice(-6) // Last 6 months
      .map(key => monthlyData[key]);
  }, [invoices]);

  const totalSpending = chartData.reduce((sum, data) => sum + data.amount, 0);
  const avgMonthlySpending = totalSpending / Math.max(chartData.length, 1);
  
  // Calculate trend (comparing last month vs previous month)
  const trend = chartData.length >= 2 
    ? chartData[chartData.length - 1].amount - chartData[chartData.length - 2].amount
    : 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(102, 126, 234, 0.2)',
            borderRadius: '8px',
            p: 2,
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            {label}
          </Typography>
          <Typography variant="body2" sx={{ color: '#667eea' }}>
            Amount: ${payload[0].value.toFixed(2)}
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Invoices: {payload[0].payload.count}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
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
          <Timeline sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Spending Data
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Spending trends will appear here once you have invoice history.
          </Typography>
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
          Spending Trends
        </Typography>

        {/* Summary Stats */}
        <Box sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Typography variant="body2" color="text.secondary">
              Monthly Average:
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              ${avgMonthlySpending.toFixed(2)}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">
              Trend:
            </Typography>
            {trend >= 0 ? (
              <TrendingUp sx={{ color: '#f44336', fontSize: '1rem' }} />
            ) : (
              <TrendingDown sx={{ color: '#4caf50', fontSize: '1rem' }} />
            )}
            <Typography 
              variant="body2" 
              fontWeight="bold"
              sx={{ color: trend >= 0 ? '#f44336' : '#4caf50' }}
            >
              ${Math.abs(trend).toFixed(2)} {trend >= 0 ? 'increase' : 'decrease'}
            </Typography>
          </Box>
        </Box>

        {/* Chart */}
        <Box sx={{ height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#667eea" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#667eea" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: '#666' }}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#666' }}
                axisLine={{ stroke: '#e0e0e0' }}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#667eea"
                strokeWidth={3}
                fill="url(#colorAmount)"
                dot={{ fill: '#667eea', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, fill: '#764ba2' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Last {chartData.length} months spending pattern
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SpendingChart;
