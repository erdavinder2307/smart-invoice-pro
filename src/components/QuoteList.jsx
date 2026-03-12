import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { createApiUrl } from "../config/api";
import MainLayout from "./Layout/MainLayout";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

const statusStyle = {
  Draft: { color: "#9aa3af", bg: "transparent" },
  Sent: { color: "#0f6cbd", bg: "#eaf4ff" },
  Accepted: { color: "#1f7a36", bg: "#eaf7ee" },
  Declined: { color: "#a3320b", bg: "#feefe8" },
  Expired: { color: "#9a6700", bg: "#fff6d6" },
  Converted: { color: "#5b21b6", bg: "#f4efff" },
};

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
  const [selectedIds, setSelectedIds] = useState([]);
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

  const customerMap = useMemo(() => {
    const map = new Map();
    customers.forEach((customer) => map.set(String(customer.id), customer.name || ""));
    return map;
  }, [customers]);

  const filteredQuotes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return quotes
      .filter((quote) => {
        const customerName = customerMap.get(String(quote.customer_id)) || "";
        const matchesSearch =
          !term
          || quote.quote_number?.toLowerCase().includes(term)
          || customerName.toLowerCase().includes(term)
          || (quote.reference_number || "").toLowerCase().includes(term);

        const matchesStatus = statusFilter === "All" || quote.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const aDate = new Date(a.issue_date || a.created_at || 0).getTime();
        const bDate = new Date(b.issue_date || b.created_at || 0).getTime();
        return bDate - aDate;
      });
  }, [customerMap, quotes, searchTerm, statusFilter]);

  const paginatedQuotes = filteredQuotes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
    return customerMap.get(String(customerId)) || "Unknown";
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return "-";
    return parsed.toLocaleDateString("en-GB");
  };

  const formatAmount = (amountValue) => {
    const amount = Number(amountValue || 0);
    return `₹${amount.toFixed(2)}`;
  };

  const allVisibleSelected = paginatedQuotes.length > 0
    && paginatedQuotes.every((quote) => selectedIds.includes(quote.id));

  const handleSelectAllVisible = (checked) => {
    if (checked) {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...paginatedQuotes.map((quote) => quote.id)])));
      return;
    }

    setSelectedIds((prev) => prev.filter((id) => !paginatedQuotes.some((quote) => quote.id === id)));
  };

  const handleRowSelect = (quoteId, checked) => {
    setSelectedIds((prev) => {
      if (checked) {
        return prev.includes(quoteId) ? prev : [...prev, quoteId];
      }
      return prev.filter((id) => id !== quoteId);
    });
  };

  return (
    <MainLayout>
      <Container
        maxWidth={false}
        sx={{
          py: 2.5,
          px: { xs: 2, md: 3 },
          bgcolor: "#f5f6f8",
          minHeight: "calc(100vh - 72px)",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
          <Typography sx={{ fontSize: "1.7rem", fontWeight: 600, color: "#1f2937", lineHeight: 1.2 }}>
            All Quotes
          </Typography>
          <Button
            variant="contained"
            onClick={handleAdd}
            startIcon={<AddIcon fontSize="small" />}
            sx={{
              minWidth: 92,
              borderRadius: "6px",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.85rem",
              py: 0.7,
              px: 1.8,
              boxShadow: "none",
              bgcolor: "#3b82f6",
              "&:hover": { bgcolor: "#2563eb", boxShadow: "none" },
            }}
          >
            New
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Paper
          sx={{
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            boxShadow: "none",
            mb: 1.5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1.5,
              py: 1,
              flexWrap: "wrap",
              borderBottom: "1px solid #edf0f3",
              bgcolor: "#fbfcfd",
            }}
          >
            <TextField
              size="small"
              placeholder="Search in Quotes"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              sx={{
                width: { xs: "100%", sm: 320 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "6px",
                  fontSize: "0.84rem",
                  bgcolor: "#fff",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#8b96a6", fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl size="small" sx={{ minWidth: 145 }}>
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
                sx={{
                  borderRadius: "6px",
                  fontSize: "0.84rem",
                  bgcolor: "#fff",
                }}
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

            <Typography sx={{ fontSize: "0.82rem", color: "#6b7280" }}>
              {filteredQuotes.length} quote{filteredQuotes.length === 1 ? "" : "s"}
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress size={30} />
            </Box>
          ) : (
            <>
              <TableContainer
                sx={{
                  width: "100%",
                  overflowX: "hidden",
                }}
              >
                <Table size="small" sx={{ tableLayout: "fixed", width: "100%" }}>
                  <TableHead sx={{ bgcolor: "#f4f6f9" }}>
                    <TableRow>
                      <TableCell sx={{ width: 40, py: 0.6, borderBottom: "1px solid #e6e9ee" }}>
                        <Checkbox
                          size="small"
                          checked={allVisibleSelected}
                          indeterminate={!allVisibleSelected && selectedIds.length > 0}
                          onChange={(event) => handleSelectAllVisible(event.target.checked)}
                          sx={{ p: 0.5 }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 0.8, borderBottom: "1px solid #e6e9ee" }}>
                        <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#7b8493", letterSpacing: 0.3 }}>
                          DATE
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 0.8, borderBottom: "1px solid #e6e9ee" }}>
                        <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#7b8493", letterSpacing: 0.3 }}>
                          QUOTE NUMBER
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 0.8, borderBottom: "1px solid #e6e9ee" }}>
                        <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#7b8493", letterSpacing: 0.3 }}>
                          REFERENCE NUMBER
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 0.8, borderBottom: "1px solid #e6e9ee" }}>
                        <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#7b8493", letterSpacing: 0.3 }}>
                          CUSTOMER NAME
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 0.8, borderBottom: "1px solid #e6e9ee", width: 110 }}>
                        <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#7b8493", letterSpacing: 0.3 }}>
                          STATUS
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 0.8, borderBottom: "1px solid #e6e9ee", width: 120 }} align="right">
                        <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#7b8493", letterSpacing: 0.3 }}>
                          AMOUNT
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 0.8, borderBottom: "1px solid #e6e9ee", width: 62 }} align="center" />
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {paginatedQuotes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 7, color: "#7b8493", borderBottom: "none" }}>
                          No quotes found
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedQuotes.map((quote) => {
                        const s = statusStyle[quote.status] || statusStyle.Draft;
                        const checked = selectedIds.includes(quote.id);

                        return (
                          <TableRow
                            key={quote.id}
                            hover
                            onClick={() => handleEdit(quote)}
                            sx={{
                              cursor: "pointer",
                              "& .MuiTableCell-root": {
                                borderBottom: "1px solid #edf0f3",
                                fontSize: "0.82rem",
                                color: "#374151",
                                py: 0.72,
                              },
                            }}
                          >
                            <TableCell onClick={(event) => event.stopPropagation()}>
                              <Checkbox
                                size="small"
                                checked={checked}
                                onChange={(event) => handleRowSelect(quote.id, event.target.checked)}
                                sx={{ p: 0.5 }}
                              />
                            </TableCell>

                            <TableCell>{formatDate(quote.issue_date)}</TableCell>

                            <TableCell>
                              <Typography sx={{ fontSize: "0.82rem", color: "#1565d8", fontWeight: 600 }}>
                                {quote.quote_number || "-"}
                              </Typography>
                            </TableCell>

                            <TableCell>{quote.reference_number || "-"}</TableCell>

                            <TableCell>{getCustomerName(quote.customer_id)}</TableCell>

                            <TableCell>
                              <Box
                                component="span"
                                sx={{
                                  display: "inline-block",
                                  px: s.bg === "transparent" ? 0 : 0.8,
                                  py: s.bg === "transparent" ? 0 : 0.25,
                                  borderRadius: "10px",
                                  fontSize: "0.69rem",
                                  fontWeight: 700,
                                  letterSpacing: 0.22,
                                  color: s.color,
                                  bgcolor: s.bg,
                                  textTransform: "uppercase",
                                }}
                              >
                                {quote.status || "Draft"}
                              </Box>
                            </TableCell>

                            <TableCell align="right" sx={{ fontWeight: 600, color: "#111827" }}>
                              {formatAmount(quote.total_amount)}
                            </TableCell>

                            <TableCell align="center" onClick={(event) => event.stopPropagation()}>
                              <IconButton size="small" onClick={(event) => handleActionMenuOpen(event, quote)}>
                                <MoreVertIcon sx={{ fontSize: 18, color: "#7b8493" }} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })
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
                rowsPerPageOptions={[10, 25, 50]}
                sx={{
                  borderTop: "1px solid #edf0f3",
                  ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": { fontSize: "0.78rem" },
                }}
              />
            </>
          )}
        </Paper>
      </Container>

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
