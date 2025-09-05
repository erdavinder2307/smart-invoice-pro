import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  IconButton
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Search,
  Visibility,
  FileDownload,
  Payment,
  FilterList
} from '@mui/icons-material';

const InvoiceTable = ({ 
  invoices, 
  searchQuery, 
  setSearchQuery, 
  statusFilter, 
  setStatusFilter, 
  onViewInvoice,
  isMobile 
}) => {

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return { backgroundColor: '#4caf50', color: 'white' };
      case 'Unpaid':
        return { backgroundColor: '#ff9800', color: 'white' };
      case 'Overdue':
        return { backgroundColor: '#f44336', color: 'white' };
      default:
        return { backgroundColor: '#757575', color: 'white' };
    }
  };

  const columns = [
    { 
      field: 'id', 
      headerName: 'Invoice ID', 
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold" color="primary">
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'date', 
      headerName: 'Date', 
      width: 120,
      renderCell: (params) => new Date(params.value).toLocaleDateString()
    },
    { 
      field: 'dueDate', 
      headerName: 'Due Date', 
      width: 120,
      renderCell: (params) => new Date(params.value).toLocaleDateString()
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 110,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            ...getStatusColor(params.value),
            fontWeight: 'bold',
            fontSize: '0.75rem'
          }}
        />
      )
    },
    { 
      field: 'amount', 
      headerName: 'Amount', 
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold">
          ${params.value.toFixed(2)}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <IconButton
            size="small"
            onClick={() => onViewInvoice(params.row.id)}
            sx={{
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              color: '#667eea',
              '&:hover': {
                backgroundColor: 'rgba(102, 126, 234, 0.2)'
              }
            }}
          >
            <Visibility fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            sx={{
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              color: '#4caf50',
              '&:hover': {
                backgroundColor: 'rgba(76, 175, 80, 0.2)'
              }
            }}
          >
            <FileDownload fontSize="small" />
          </IconButton>
          {(params.row.status === 'Unpaid' || params.row.status === 'Overdue') && (
            <IconButton
              size="small"
              sx={{
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                color: '#ff9800',
                '&:hover': {
                  backgroundColor: 'rgba(255, 152, 0, 0.2)'
                }
              }}
            >
              <Payment fontSize="small" />
            </IconButton>
          )}
        </Box>
      )
    }
  ];

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
          Invoice Management
        </Typography>

        {/* Filters and Search */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={8}>
            <TextField
              fullWidth
              placeholder="Search by Invoice ID or Description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: '#666' }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  '&:hover fieldset': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  }
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                label="Status Filter"
                onChange={(e) => setStatusFilter(e.target.value)}
                startAdornment={<FilterList sx={{ mr: 1, color: '#666' }} />}
                sx={{
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#667eea',
                  }
                }}
              >
                <MenuItem value="All">All Status</MenuItem>
                <MenuItem value="Paid">Paid</MenuItem>
                <MenuItem value="Unpaid">Unpaid</MenuItem>
                <MenuItem value="Overdue">Overdue</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* DataGrid */}
        <Box 
          sx={{ 
            height: 400, 
            width: '100%',
            '& .MuiDataGrid-root': {
              border: 'none',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid rgba(224, 224, 224, 0.5)',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              borderBottom: '2px solid rgba(102, 126, 234, 0.2)',
              borderRadius: '12px 12px 0 0',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 'bold',
              color: '#2c3e50'
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'rgba(102, 126, 234, 0.05)',
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: '1px solid rgba(224, 224, 224, 0.5)',
              backgroundColor: 'rgba(248, 250, 252, 0.8)',
            }
          }}
        >
          <DataGrid
            rows={invoices}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 25]}
            disableSelectionOnClick
            autoHeight={false}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default InvoiceTable;
