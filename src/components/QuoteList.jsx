import React, { useEffect, useState } from "react";
import axios from "axios";
import { createApiUrl } from "../config/api";
import MainLayout from "./Layout/MainLayout";
import StatusBadge from "./common/StatusBadge";
import SummaryCard from "./common/SummaryCard";
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
  InputAdornment,
  TextField,
  Fade,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Container,
  FormControl,
  Select,
  TablePagination
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import EventIcon from "@mui/icons-material/Event";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

const QuoteList = () => {
  const [quotes, setQuotes] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(createApiUrl("/api/quotes"));
      setQuotes(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch quotes");
      console.error(err);
    }
    setLoading(false);
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(createApiUrl("/api/customers"));
      setCustomers(response.data);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    }
  };

  useEffect(() => {
    fetchQuotes();
    fetchCustomers();
  }, []);

  const filteredQuotes = quotes.filter((quote) => {
    const customer = customers.find((c) => c.id === quote.customer_id);
    const customerName = customer ? customer.name : "";

    const matchesSearch =
      quote.quote_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.subject?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "All" || quote.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const paginatedQuotes = filteredQuotes.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Calculate summary metrics
  const totalQuoteValue = quotes.reduce((sum, quote) => sum + (quote.total_amount || 0), 0);
  
  const acceptedCount = quotes.filter((q) => q.status === "Accepted").length;
  
  const pendingCount = quotes.filter((q) => 
    q.status === "Draft" || q.status === "Sent"
  ).length;
  
  const expiredCount = quotes.filter((q) => q.status === "Expired").length;

  const handleEdit = (quote) => {
    navigate(`/quotes/edit/${quote.id}`);
  };

  const handleAdd = () => {
    navigate("/quotes/add");
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(createApiUrl(`/api/quotes/${id}`));
      fetchQuotes();
      setConfirmDeleteId(null);
      setError("");
    } catch (err) {
      setError("Failed to delete quote");
      console.error(err);
    }
    setLoading(false);
  };

  const handleActionMenuOpen = (event, quote) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedQuote(quote);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedQuote(null);
  };

  const handleConvertToInvoice = () => {
    if (selectedQuote) {
      navigate(`/quotes/convert/${selectedQuote.id}/invoice`);
    }
    handleActionMenuClose();
  };

  const handleConvertToSalesOrder = () => {
    if (selectedQuote) {
      navigate(`/quotes/convert/${selectedQuote.id}/sales-order`);
    }
    handleActionMenuClose();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.name : "Unknown";
  };

  const getStatusColor = (status) => {
    const statusColors = {
      Draft: "default",
      Sent: "info",
      Accepted: "success",
      Declined: "error",
      Expired: "warning",
      Converted: "secondary"
    };
    return statusColors[status] || "default";
  };

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Fade in timeout={500}>
          <Box>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
              <Box>
                <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5, display: "flex", alignItems: "center", gap: 1 }}>
                  <RequestQuoteIcon fontSize="large" color="primary" />
                  Quotes & Estimates
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Create and manage customer quotes
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAdd}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: 600,
                  boxShadow: 2,
                  "&:hover": { boxShadow: 4 }
                }}
              >
                New Quote
              </Button>
            </Box>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <SummaryCard
                  title="Total Quote Value"
                  value={`₹${totalQuoteValue.toLocaleString()}`}
                  icon={<AttachMoneyIcon />}
                  color="#667eea"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <SummaryCard
                  title="Accepted"
                  value={acceptedCount}
                  icon={<CheckCircleIcon />}
                  color="#48bb78"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <SummaryCard
                  title="Pending"
                  value={pendingCount}
                  icon={<EventIcon />}
                  color="#ed8936"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <SummaryCard
                  title="Expired"
                  value={expiredCount}
                  icon={<CancelIcon />}
                  color="#f56565"
                />
              </Grid>
            </Grid>

            {error && (
              <Fade in={!!error}>
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError("")}>
                  {error}
                </Alert>
              </Fade>
            )}

            {/* Filters */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.200" }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Search by quote number, customer, or subject..."
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
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        bgcolor: "grey.50"
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      sx={{ borderRadius: 2, bgcolor: "grey.50" }}
                    >
                      <MenuItem value="All">All Status</MenuItem>
                      <MenuItem value="Draft">Draft</MenuItem>
                      <MenuItem value="Sent">Sent</MenuItem>
                      <MenuItem value="Accepted">Accepted</MenuItem>
                      <MenuItem value="Declined">Declined</MenuItem>
                      <MenuItem value="Expired">Expired</MenuItem>
                      <MenuItem value="Converted">Converted</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary" textAlign="right">
                    {filteredQuotes.length} quote{filteredQuotes.length !== 1 ? 's' : ''} found
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Table */}
            <Paper sx={{ borderRadius: 3, border: "1px solid", borderColor: "grey.200", overflow: "hidden" }}>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead sx={{ bgcolor: "grey.50" }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Quote #</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Issue Date</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Expiry Date</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedQuotes.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                              <Typography color="text.secondary">No quotes found</Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedQuotes.map((quote) => (
                            <TableRow
                              key={quote.id}
                              sx={{
                                "&:hover": { bgcolor: "grey.50" },
                                cursor: "pointer"
                              }}
                              onClick={() => handleEdit(quote)}
                            >
                              <TableCell>
                                <Typography variant="body2" fontWeight={600}>
                                  {quote.quote_number}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {getCustomerName(quote.customer_id)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                  {quote.subject || "-"}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {new Date(quote.issue_date).toLocaleDateString()}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {new Date(quote.expiry_date).toLocaleDateString()}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight={600} color="primary">
                                  ₹{quote.total_amount?.toLocaleString() || "0"}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={quote.status} color={getStatusColor(quote.status)} />
                              </TableCell>
                              <TableCell align="center">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleActionMenuOpen(e, quote);
                                  }}
                                >
                                  <MoreVertIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    component="div"
                    count={filteredQuotes.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                  />
                </>
              )}
            </Paper>
          </Box>
        </Fade>
      </Container>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
      >
        <MenuItem onClick={() => { handleEdit(selectedQuote); handleActionMenuClose(); }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleConvertToInvoice} disabled={selectedQuote?.status === "Converted"}>
          <ListItemIcon>
            <ReceiptIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Convert to Invoice</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleConvertToSalesOrder} disabled={selectedQuote?.status === "Converted"}>
          <ListItemIcon>
            <ShoppingCartIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Convert to Sales Order</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setConfirmDeleteId(selectedQuote?.id); handleActionMenuClose(); }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this quote? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
          <Button onClick={() => handleDelete(confirmDeleteId)} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default QuoteList;
