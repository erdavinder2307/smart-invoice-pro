import React, { useEffect, useState } from "react";
import axios from "axios";
import { createApiUrl } from "../config/api";
import Header from "./common/Header/Header";
import Footer from "./common/Header/Footer/Footer";
import Sidebar from "./Sidebar";
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
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  IconButton,
  Chip,
  Avatar,
  InputAdornment,
  Fade,
  Slide,
  Card,
  CardContent,
  Grid,
  Tooltip,
  Badge
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import BusinessIcon from '@mui/icons-material/Business';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PeopleIcon from '@mui/icons-material/People';

const initialForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  gst_number: "",
};

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm) ||
    customer.gst_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(createApiUrl("/api/customers"));
      setCustomers(res.data);
    } catch {
      setCustomers([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const getRandomCustomer = () => {
    const names = ["Amit Sharma", "Priya Singh", "Rahul Verma", "Sneha Patel", "Vikram Rao", "Neha Gupta", "Rohan Mehta", "Anjali Desai"];
    const emails = ["amit", "priya", "rahul", "sneha", "vikram", "neha", "rohan", "anjali"];
    const streets = ["MG Road", "Park Street", "Sector 21", "DLF Phase 3", "Bandra West", "Salt Lake", "Koramangala", "Powai"];
    const cities = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad"];
    const gst = ["27AAEPM1234C1ZV", "07AABCU9603R1Z2", "19AACCM9910C1ZP", "29AAACG2115R1Z6", "24AAACB2894G1ZB", "09AAACG2115R1Z2"];
    const idx = Math.floor(Math.random() * names.length);
    return {
      name: names[idx],
      email: emails[idx] + Math.floor(Math.random()*1000) + "@example.com",
      phone: "9" + Math.floor(100000000 + Math.random()*900000000),
      address: `${Math.floor(Math.random()*100)+1}, ${streets[idx]}, ${cities[idx]}`,
      gst_number: gst[Math.floor(Math.random()*gst.length)]
    };
  };

  const openModal = (customer = null) => {
    if (customer) {
      setForm(customer);
      setEditingId(customer.id);
    } else {
      setForm(getRandomCustomer());
      setEditingId(null);
    }
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(initialForm);
    setEditingId(null);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return "Valid email is required";
    if (!form.phone.trim()) return "Phone is required";
    if (!form.address.trim()) return "Address is required";
    if (!form.gst_number.trim()) return "GST Number is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateForm();
    if (err) return setError(err);
    setLoading(true);
    try {
      if (editingId) {
        await axios.put(createApiUrl(`/api/customers/${editingId}`), form);
      } else {
        await axios.post(createApiUrl("/api/customers"), form);
      }
      fetchCustomers();
      closeModal();
    } catch {
      setError("Failed to save customer");
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(createApiUrl(`/api/customers/${id}`));
      fetchCustomers();
      setConfirmDeleteId(null);
    } catch {
      setError("Failed to delete customer");
    }
    setLoading(false);
  };

  return (
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
                  <PeopleIcon sx={{ fontSize: 40, mb: 2, opacity: 0.9 }} />
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    {customers.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Customers
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
                  <BusinessIcon sx={{ fontSize: 40, mb: 2, opacity: 0.9 }} />
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    {customers.filter(c => c.gst_number).length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    GST Registered
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
                  <EmailIcon sx={{ fontSize: 40, mb: 2, opacity: 0.9 }} />
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    {customers.filter(c => c.email).length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    With Email
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
                  <PhoneIcon sx={{ fontSize: 40, mb: 2, opacity: 0.9 }} />
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    {customers.filter(c => c.phone).length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    With Phone
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
                    <PeopleIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
                      Customer Management
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Manage your customer database with ease
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PersonAddIcon />}
                  onClick={() => openModal()}
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
                  Add New Customer
                </Button>
              </Box>

              {/* Search and Filters */}
              <Box sx={{ mb: 4 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search customers by name, email, phone, or GST number..."
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
              </Box>

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
                      <TableCell>Customer Info</TableCell>
                      <TableCell>Contact Details</TableCell>
                      <TableCell>Address</TableCell>
                      <TableCell>GST Number</TableCell>
                      <TableCell align="center" width={120}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                          <CircularProgress size={40} />
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                            Loading customers...
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : filteredCustomers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                          <PeopleIcon sx={{ fontSize: 48, color: 'grey.300', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            {searchTerm ? 'No customers found' : 'No customers yet'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {searchTerm ? 'Try adjusting your search terms' : 'Add your first customer to get started'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCustomers.map((customer, index) => (
                        <Fade in={true} timeout={300 + index * 100} key={customer.id}>
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
                                  bgcolor: 'primary.main',
                                  width: 40,
                                  height: 40,
                                  fontSize: '1rem',
                                  fontWeight: 600
                                }}>
                                  {customer.name?.charAt(0)?.toUpperCase() || 'C'}
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                                    {customer.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Customer ID: #{customer.id}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                  <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.primary">
                                    {customer.email}
                                  </Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.primary">
                                    {customer.phone}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.primary">
                                  {customer.address}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              {customer.gst_number ? (
                                <Chip
                                  icon={<ReceiptIcon />}
                                  label={customer.gst_number}
                                  size="small"
                                  sx={{
                                    bgcolor: 'success.50',
                                    color: 'success.700',
                                    fontWeight: 600,
                                    border: '1px solid',
                                    borderColor: 'success.200'
                                  }}
                                />
                              ) : (
                                <Chip
                                  label="Not Registered"
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    color: 'text.secondary',
                                    borderColor: 'grey.300'
                                  }}
                                />
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <Box display="flex" justifyContent="center" gap={1}>
                                <Tooltip title="Edit Customer">
                                  <IconButton 
                                    size="small"
                                    onClick={() => openModal(customer)}
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
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Customer">
                                  <IconButton 
                                    size="small"
                                    onClick={() => setConfirmDeleteId(customer.id)}
                                    sx={{
                                      color: 'error.main',
                                      bgcolor: 'error.50',
                                      '&:hover': {
                                        bgcolor: 'error.100',
                                        transform: 'scale(1.1)'
                                      },
                                      transition: 'all 0.2s ease'
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        </Fade>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Modern Add/Edit Dialog */}
        <Dialog 
          open={showModal} 
          onClose={closeModal} 
          maxWidth="md" 
          fullWidth
          TransitionComponent={Slide}
          TransitionProps={{ direction: "up" }}
          PaperProps={{
            sx: {
              borderRadius: 4,
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
              backdropFilter: 'blur(20px)'
            }
          }}
        >
          <DialogTitle sx={{ 
            pb: 2, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            mb: 3
          }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                {editingId ? <EditIcon /> : <PersonAddIcon />}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  {editingId ? "Edit Customer" : "Add New Customer"}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {editingId ? "Update customer information" : "Enter customer details below"}
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ px: 4, pb: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Full Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&.Mui-focused': {
                        boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email Address"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  fullWidth
                  required
                  type="email"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&.Mui-focused': {
                        boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone Number"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&.Mui-focused': {
                        boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="GST Number"
                  name="gst_number"
                  value={form.gst_number}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ReceiptIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&.Mui-focused': {
                        boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  fullWidth
                  required
                  multiline
                  rows={3}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 2 }}>
                        <LocationOnIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&.Mui-focused': {
                        boxShadow: '0 0 0 3px rgba(102,126,234,0.1)'
                      }
                    }
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 4, pb: 4, pt: 2, gap: 2 }}>
            <Button
              onClick={closeModal}
              variant="outlined"
              size="large"
              sx={{ 
                borderRadius: 2,
                px: 3,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ 
                borderRadius: 2,
                px: 4,
                textTransform: 'none',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                }
              }}
            >
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                editingId ? "Update Customer" : "Add Customer"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modern Delete Confirmation Dialog */}
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
                Delete Customer
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This action cannot be undone
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pb: 2 }}>
            <Typography variant="body1" color="text.secondary">
              Are you sure you want to delete this customer? All associated data will be permanently removed.
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
      </Box>
      <Footer />
    </Box>
  );
};

export default CustomerList;
