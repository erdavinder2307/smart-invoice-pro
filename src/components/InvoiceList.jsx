import React, { useEffect, useState } from "react";
import {
  getInvoices,
  deleteInvoice,
} from "../services/invoiceService";
import { createApiUrl } from "../config/api";
import "./InvoiceList.css";
import Header from "./common/Header/Header";
import Footer from "./common/Header/Footer/Footer";
import Sidebar from "./Sidebar";
import axios from "axios";
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  CircularProgress, 
  Alert,
  Chip,
  Avatar,
  InputAdornment,
  TextField,
  Fade,
  Slide,
  Card,
  CardContent,
  Grid,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ReceiptIcon from '@mui/icons-material/Receipt';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ErrorIcon from '@mui/icons-material/Error';

const initialForm = {
  invoice_number: "",
  customer_id: "",
  issue_date: "",
  due_date: "",
  payment_terms: "",
  subtotal: 0,
  cgst_amount: 0,
  sgst_amount: 0,
  igst_amount: 0,
  total_tax: 0,
  total_amount: 0,
  amount_paid: 0,
  balance_due: 0,
  status: "Draft",
  payment_mode: "",
  notes: "",
  terms_conditions: "",
  is_gst_applicable: false,
  invoice_type: "Tax Invoice",
};

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const navigate = useNavigate();

  const filteredInvoices = invoices.filter(invoice => {
    const customer = customers.find(c => c.id === invoice.customer_id);
    const customerName = customer ? customer.name : '';
    
    const matchesSearch = 
      invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoice_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return <CheckCircleIcon fontSize="small" />;
      case 'pending': return <PendingIcon fontSize="small" />;
      case 'overdue': return <ErrorIcon fontSize="small" />;
      default: return <AssignmentIcon fontSize="small" />;
    }
  };

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const data = await getInvoices();
      setInvoices(data);
    } catch (err) {
      setError("Failed to fetch invoices");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
    // Fetch customers for dropdown
    axios.get(createApiUrl("/api/customers")).then(res => setCustomers(res.data)).catch(() => setCustomers([]));
    // Optionally, fetch next invoice number
    axios.get(createApiUrl("/api/invoices/next-number")).then(res => setForm(f => ({ ...f, invoice_number: res.data.invoice_number }))).catch(() => {});
  }, []);

  // Calculate fields
  useEffect(() => {
    const total_tax = Number(form.cgst_amount || 0) + Number(form.sgst_amount || 0) + Number(form.igst_amount || 0);
    const total_amount = Number(form.subtotal || 0) + total_tax;
    const balance_due = total_amount - Number(form.amount_paid || 0);
    setForm(f => ({ ...f, total_tax, total_amount, balance_due }));
    // eslint-disable-next-line
  }, [form.subtotal, form.cgst_amount, form.sgst_amount, form.igst_amount, form.amount_paid]);

  const handleEdit = (invoice) => {
    navigate(`/invoices/edit/${invoice.id}`);
  };

  const handleAdd = () => {
    navigate("/invoices/add");
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteInvoice(id);
      fetchInvoices();
      setConfirmDeleteId(null);
    } catch (err) {
      setError("Failed to delete invoice");
    }
    setLoading(false);
  };

  const handleActionMenuOpen = (event, invoice) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedInvoice(invoice);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedInvoice(null);
  };

  const handleDownloadPDF = async (invoice) => {
    try {
      const response = await axios.post(
        createApiUrl("/api/generate-invoice-pdf"),
        { invoice },
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${invoice.invoice_number || 'invoice'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download PDF");
    }
  };

  return (
    <>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc' }}>
        <Header />
        <Box sx={{ display: 'flex', flex: 1 }}>
          <Sidebar />
          <Box sx={{ 
            flex: 1, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            minHeight: 'calc(100vh - 128px)', 
            p: 3,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
              backdropFilter: 'blur(10px)'
            }
          }}>
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(102,126,234,0.3)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(102,126,234,0.4)'
                  }
                }}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <ReceiptIcon sx={{ fontSize: 40, mb: 2, opacity: 0.9 }} />
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                      {invoices.length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Invoices
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  color: 'white',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(67,233,123,0.3)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(67,233,123,0.4)'
                  }
                }}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <CheckCircleIcon sx={{ fontSize: 40, mb: 2, opacity: 0.9 }} />
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                      {invoices.filter(inv => inv.status?.toLowerCase() === 'paid').length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Paid Invoices
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(240,147,251,0.3)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(240,147,251,0.4)'
                  }
                }}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <PendingIcon sx={{ fontSize: 40, mb: 2, opacity: 0.9 }} />
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                      {invoices.filter(inv => inv.status?.toLowerCase() === 'pending').length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Pending Invoices
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(79,172,254,0.3)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(79,172,254,0.4)'
                  }
                }}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <AttachMoneyIcon sx={{ fontSize: 40, mb: 2, opacity: 0.9 }} />
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                      ₹{invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Revenue
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Main Content Card */}
            <Card elevation={0} sx={{ 
              borderRadius: 4, 
              overflow: 'visible',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
              position: 'relative',
              zIndex: 1
            }}>
              <CardContent sx={{ p: 4 }}>
                {/* Header Section */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ 
                      bgcolor: 'primary.main',
                      width: 56,
                      height: 56,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}>
                      <ReceiptIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
                        Invoice Management
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Track and manage all your customer invoices
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={handleAdd}
                    sx={{ 
                      borderRadius: 3,
                      px: 3,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: 'none',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 8px 24px rgba(102,126,234,0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                        boxShadow: '0 12px 32px rgba(102,126,234,0.4)',
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Create New Invoice
                  </Button>
                </Box>

                {/* Search and Filters */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={8}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Search invoices by number, customer, or type..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          bgcolor: 'grey.50',
                          '&:hover': {
                            bgcolor: 'grey.100',
                          },
                          '&.Mui-focused': {
                            bgcolor: 'white',
                            boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      fullWidth
                      variant="outlined"
                      label="Filter by Status"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      SelectProps={{
                        native: true,
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FilterListIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          bgcolor: 'grey.50',
                          '&:hover': {
                            bgcolor: 'grey.100',
                          },
                          '&.Mui-focused': {
                            bgcolor: 'white',
                            boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                          }
                        }
                      }}
                    >
                      <option value="All">All Status</option>
                      <option value="Draft">Draft</option>
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Overdue">Overdue</option>
                    </TextField>
                  </Grid>
                </Grid>

                {error && (
                  <Fade in={!!error}>
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mb: 3, 
                        borderRadius: 2,
                        '& .MuiAlert-icon': { fontSize: 24 }
                      }}
                    >
                      {error}
                    </Alert>
                  </Fade>
                )}

                {/* Modern Table */}
                <TableContainer sx={{ 
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'grey.200',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ 
                        bgcolor: 'grey.50',
                        '& .MuiTableCell-head': {
                          fontWeight: 700,
                          color: 'text.primary',
                          fontSize: '0.95rem',
                          borderBottom: '2px solid',
                          borderColor: 'grey.200',
                          py: 2
                        }
                      }}>
                        <TableCell>Invoice Details</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="center" width={120}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                            <CircularProgress size={40} />
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                              Loading invoices...
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : filteredInvoices.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                            <ReceiptIcon sx={{ fontSize: 48, color: 'grey.300', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                              {searchTerm || statusFilter !== "All" ? 'No invoices found' : 'No invoices yet'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {searchTerm || statusFilter !== "All" ? 'Try adjusting your search or filters' : 'Create your first invoice to get started'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredInvoices.map((invoice, index) => {
                          const customer = customers.find(c => c.id === invoice.customer_id);
                          return (
                            <Fade in={true} timeout={300 + index * 100} key={invoice.id}>
                              <TableRow sx={{
                                '&:hover': {
                                  bgcolor: 'grey.50',
                                  transform: 'scale(1.001)',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                },
                                transition: 'all 0.2s ease',
                                '& .MuiTableCell-root': {
                                  borderBottom: '1px solid',
                                  borderColor: 'grey.100',
                                  py: 2
                                }
                              }}>
                                <TableCell>
                                  <Box display="flex" alignItems="center" gap={2}>
                                    <Avatar sx={{ 
                                      bgcolor: 'primary.50',
                                      color: 'primary.main',
                                      width: 40,
                                      height: 40
                                    }}>
                                      <ReceiptIcon fontSize="small" />
                                    </Avatar>
                                    <Box>
                                      <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                                        {invoice.invoice_number}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {invoice.invoice_type}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    <Typography variant="body2" color="text.primary" fontWeight={500}>
                                      {customer ? customer.name : `Customer #${invoice.customer_id}`}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <AttachMoneyIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                    <Typography variant="body2" color="text.primary" fontWeight={600}>
                                      ₹{invoice.total_amount?.toLocaleString() || '0'}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    <Typography variant="body2" color="text.primary">
                                      {invoice.due_date}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    icon={getStatusIcon(invoice.status)}
                                    label={invoice.status}
                                    size="small"
                                    color={getStatusColor(invoice.status)}
                                    sx={{
                                      fontWeight: 600,
                                      minWidth: 80
                                    }}
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Tooltip title="More Actions">
                                    <IconButton 
                                      size="small"
                                      onClick={(e) => handleActionMenuOpen(e, invoice)}
                                      sx={{
                                        color: 'primary.main',
                                        bgcolor: 'primary.50',
                                        '&:hover': {
                                          bgcolor: 'primary.100',
                                          transform: 'scale(1.1)'
                                        },
                                        transition: 'all 0.2s ease'
                                      }}
                                    >
                                      <MoreVertIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            </Fade>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Action Menu */}
        <Menu
          anchorEl={actionMenuAnchor}
          open={Boolean(actionMenuAnchor)}
          onClose={handleActionMenuClose}
          PaperProps={{
            sx: {
              borderRadius: 2,
              minWidth: 180,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }
          }}
        >
          <MenuItem 
            onClick={() => {
              handleEdit(selectedInvoice);
              handleActionMenuClose();
            }}
            sx={{ py: 1.5 }}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText primary="Edit Invoice" />
          </MenuItem>
          <MenuItem 
            onClick={() => {
              handleDownloadPDF(selectedInvoice);
              handleActionMenuClose();
            }}
            sx={{ py: 1.5 }}
          >
            <ListItemIcon>
              <PictureAsPdfIcon fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText primary="Download PDF" />
          </MenuItem>
          <MenuItem 
            onClick={() => {
              setConfirmDeleteId(selectedInvoice.id);
              handleActionMenuClose();
            }}
            sx={{ py: 1.5, color: 'error.main' }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText primary="Delete Invoice" />
          </MenuItem>
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog 
          open={!!confirmDeleteId} 
          onClose={() => setConfirmDeleteId(null)} 
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
            }
          }}
        >
          <DialogTitle sx={{ 
            pb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            color: 'error.main'
          }}>
            <Avatar sx={{ bgcolor: 'error.100', color: 'error.main' }}>
              <DeleteIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Delete Invoice
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This action cannot be undone
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pb: 2 }}>
            <Typography variant="body1" color="text.secondary">
              Are you sure you want to delete this invoice? All associated data will be permanently removed.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
            <Button
              onClick={() => setConfirmDeleteId(null)}
              variant="outlined"
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleDelete(confirmDeleteId)}
              variant="contained"
              color="error"
              disabled={loading}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>

        <Footer />
      </Box>
    </>
  );
};

export default InvoiceList;
