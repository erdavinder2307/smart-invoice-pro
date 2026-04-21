import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createApiUrl } from "../config/api";
import MainLayout from "./Layout/MainLayout";
import StatusBadge from "./common/StatusBadge";
import SummaryCard from "./common/SummaryCard";
import axios from "axios";
import {
  Box,
  Button,
  Typography,
  TableRow,
  TableCell,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
  Fade,
  Grid,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  Container,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import StandardDataTable from "./common/StandardDataTable";
import ResponsiveDataView from "./common/ResponsiveDataView";
import VendorCard from "./common/VendorCard";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import BusinessIcon from "@mui/icons-material/Business";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { useTranslation } from "react-i18next";

const VendorList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const response = await axios.get(createApiUrl("/api/vendors"));
      setVendors(response.data);
    } catch (error) {
      setError(t('vendorList.failedFetch'));
      console.error(error);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(createApiUrl(`/api/vendors/${id}`));
      await fetchVendors();
      setConfirmDeleteId(null);
    } catch (error) {
      setError(t('vendorList.failedDelete'));
    }
    setLoading(false);
  };

  // Filter vendors
  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.phone?.includes(searchTerm) ||
      vendor.contact_person?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "All" || vendor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Paginated vendors
  const paginatedVendors = filteredVendors.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Calculate totals
  const totalVendors = filteredVendors.length;
  const activeVendors = filteredVendors.filter(v => v.status === "Active").length;

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
            mb={3}
          >
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                {t('vendorList.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('vendorList.subtitle')}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/vendors/add')}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.25,
                fontWeight: 600,
                textTransform: "none",
                boxShadow: 2
              }}
            >
              {t('vendorList.newVendor')}
            </Button>
          </Box>

          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <SummaryCard
                label={t('vendorList.totalVendors')}
                value={totalVendors}
                icon={<LocalShippingIcon />}
                accentColor="primary.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <SummaryCard
                label={t('vendorList.activeVendors')}
                value={activeVendors}
                icon={<BusinessIcon />}
                accentColor="success.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <SummaryCard
                label={t('vendorList.inactiveVendors')}
                value={totalVendors - activeVendors}
                icon={<BusinessIcon />}
                accentColor="warning.main"
              />
            </Grid>
          </Grid>

          {/* Filters and Search */}
          <Box
            display="flex"
            gap={2}
            flexWrap="wrap"
            alignItems="center"
            sx={{
              bgcolor: "background.paper",
              p: 2,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "grey.200"
            }}
          >
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                displayEmpty
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="All">{t('common.allStatus')}</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
            <TextField
              size="small"
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
              sx={{
                flex: 1,
                minWidth: 250,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2
                }
              }}
            />
          </Box>
        </Box>

        {error && (
          <Fade in={!!error}>
            <Alert
              severity="error"
              onClose={() => setError("")}
              sx={{ mb: 3, borderRadius: 2 }}
            >
              {error}
            </Alert>
          </Fade>
        )}

        {/* Main Table */}
        <ResponsiveDataView
          isMobile={isMobile}
          renderCard={(vendor) => (
            <VendorCard
              vendor={vendor}
              onEdit={() => navigate(`/vendors/edit/${vendor.id}`)}
              onDelete={() => setConfirmDeleteId(vendor.id)}
            />
          )}
          columns={[
            { key: 'vendor_name', label: t('vendorList.columns.vendorName') },
            { key: 'contact_person', label: t('vendorList.columns.contactPerson') },
            { key: 'email', label: t('vendorList.columns.email') },
            { key: 'phone', label: t('vendorList.columns.phone') },
            { key: 'payment_terms', label: t('vendorList.columns.paymentTerms') },
            { key: 'status', label: t('common.status'), align: 'center' },
            { key: 'actions', label: t('common.actions'), align: 'center' },
          ]}
          rows={paginatedVendors}
          loading={loading}
          emptyIcon={<LocalShippingIcon sx={{ fontSize: 48 }} />}
          emptyTitle={searchTerm ? t('vendorList.noVendors') : t('vendorList.noVendorsYet')}
          emptySubtitle={searchTerm ? "Try adjusting your search terms" : "Click 'New Vendor' to add your first vendor"}
          renderRow={(vendor) => (
            <TableRow key={vendor.id} hover sx={{ cursor: 'pointer' }}>
              <TableCell>
                <Typography variant="body2" fontWeight={600}>{vendor.vendor_name}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{vendor.contact_person || "-"}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{vendor.email}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{vendor.phone || "-"}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{vendor.payment_terms || "Net 30"}</Typography>
              </TableCell>
              <TableCell align="center">
                <StatusBadge status={vendor.status || "Active"} />
              </TableCell>
              <TableCell align="center">
                <Box display="flex" gap={0.5} justifyContent="center">
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => navigate(`/vendors/edit/${vendor.id}`)} sx={{ color: 'primary.main' }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" onClick={() => setConfirmDeleteId(vendor.id)} sx={{ color: 'error.main' }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          )}
          pagination={{
            rowsPerPageOptions: [10, 25, 50],
            count: filteredVendors.length,
            rowsPerPage,
            page,
            onPageChange: handleChangePage,
            onRowsPerPageChange: handleChangeRowsPerPage,
          }}
        />
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: 4
          }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h6" fontWeight={700} color="error.main">
            Delete Vendor
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary">
            Are you sure you want to delete this vendor? All associated data will be permanently
            removed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
          <Button
            onClick={() => setConfirmDeleteId(null)}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleDelete(confirmDeleteId)}
            variant="contained"
            color="error"
            disabled={loading}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default VendorList;
