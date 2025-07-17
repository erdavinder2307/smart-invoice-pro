import React, { useEffect, useState } from "react";
import axios from "axios";
import { createApiUrl } from "../config/api";
import Header from "./common/Header/Header";
import Footer from "./common/Header/Footer/Footer";
import Sidebar from "./Sidebar";
import { Box, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

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
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <Box sx={{ flex: 1, bgcolor: '#f5f6fa', minHeight: 'calc(100vh - 128px)', p: 3 }}>
          <Paper elevation={3} sx={{ width: '95%', mx: 0, p: 4, mb: 4, borderRadius: 3, overflow: 'visible' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" fontWeight={700} color="primary.main">
                Customers
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => openModal()}
                sx={{ fontWeight: 600 }}
              >
                + Add Customer
              </Button>
            </Box>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TableContainer sx={{ maxWidth: '100%', overflowX: { xs: 'auto', md: 'visible' } }}>
              <Table sx={{ minWidth: 650, width: '100%' }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>GST Number</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customers.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{c.email}</TableCell>
                      <TableCell>{c.phone}</TableCell>
                      <TableCell>{c.address}</TableCell>
                      <TableCell>{c.gst_number}</TableCell>
                      <TableCell align="center">
                        <IconButton color="primary" onClick={() => openModal(c)} title="Edit">
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => setConfirmDeleteId(c.id)} title="Delete">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {customers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ color: 'text.secondary', py: 6 }}>
                        No customers found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {loading && (
                <Box display="flex" justifyContent="center" alignItems="center" py={3}>
                  <CircularProgress />
                </Box>
              )}
            </TableContainer>
          </Paper>
        </Box>
        {/* Add/Edit Dialog */}
        <Dialog open={showModal} onClose={closeModal} maxWidth="sm" fullWidth>
          <DialogTitle>{editingId ? "Edit" : "Add"} Customer</DialogTitle>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth margin="normal" required />
              <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth margin="normal" required type="email" />
              <TextField label="Phone" name="phone" value={form.phone} onChange={handleChange} fullWidth margin="normal" required />
              <TextField label="Address" name="address" value={form.address} onChange={handleChange} fullWidth margin="normal" required />
              <TextField label="GST Number" name="gst_number" value={form.gst_number} onChange={handleChange} fullWidth margin="normal" required />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeModal} color="secondary" variant="outlined">Cancel</Button>
            <Button onClick={handleSubmit} color="primary" variant="contained" disabled={loading}>
              {editingId ? "Update" : "Add"}
            </Button>
          </DialogActions>
        </Dialog>
        {/* Delete Confirmation Dialog */}
        <Dialog open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} maxWidth="xs">
          <DialogTitle>Delete Customer</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this customer?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDeleteId(null)} color="secondary" variant="outlined">Cancel</Button>
            <Button onClick={() => handleDelete(confirmDeleteId)} color="error" variant="contained" disabled={loading}>Delete</Button>
          </DialogActions>
        </Dialog>
      </Box>
      <Footer />
    </Box>
  );
};

export default CustomerList;
