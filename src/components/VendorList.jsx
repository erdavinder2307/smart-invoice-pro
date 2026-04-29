import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createApiUrl } from "../config/api";
import StatusBadge from "./common/StatusBadge";
import axios from "axios";
import {
  Box,
  Button,
  Checkbox,
  Typography,
  TableRow,
  TableCell,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Fade,
  Tooltip,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { CHECKBOX_COLUMN_WIDTH } from "./common/StandardDataTable";
import VendorCard from "./common/VendorCard";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { useTranslation } from "react-i18next";
import ListPageLayout from "./list/ListPageLayout";
import ListHeader from "./list/ListHeader";
import FilterBar from "./list/FilterBar";
import ListSummary from "./list/ListSummary";
import DataTable from "./list/DataTable";
import BulkActionBar from "./list/BulkActionBar";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import useTableSorting from "../hooks/useTableSorting";

const VendorList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateRange, setDateRange] = useState("all");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const debouncedSearch = useDebouncedValue(searchTerm, 300);

  const { sortBy, sortOrder, handleSort, sortParams } = useTableSorting("vendor_name", "asc", "vendors");

  const fetchVendors = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const response = await axios.get(createApiUrl("/api/vendors"), { params });
      setVendors(response.data);
    } catch (error) {
      setError(t('vendorList.failedFetch'));
      console.error(error);
    }
    setLoading(false);
  }, [t]);

  useEffect(() => {
    fetchVendors(sortParams);
  }, [sortBy, sortOrder]); // eslint-disable-line react-hooks/exhaustive-deps

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
    const term = debouncedSearch.trim().toLowerCase();
    const matchesSearch =
      !term
      || vendor.vendor_name?.toLowerCase().includes(term)
      || vendor.email?.toLowerCase().includes(term)
      || vendor.phone?.includes(term)
      || vendor.contact_person?.toLowerCase().includes(term);

    const matchesStatus = statusFilter === "All" || vendor.status === statusFilter;

    const createdAt = new Date(vendor.created_at || vendor.date || 0).getTime();
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const matchesDate =
      dateRange === "all"
        ? true
        : dateRange === "this_week"
          ? createdAt >= now - (7 * oneDay)
          : dateRange === "this_month"
            ? createdAt >= now - (31 * oneDay)
            : createdAt >= now - (365 * oneDay);

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Paginated vendors
  const paginatedVendors = filteredVendors.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Calculate totals
  const totalVendors = filteredVendors.length;
  const activeVendors = filteredVendors.filter(v => v.status === "Active").length;

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, dateRange, statusFilter]);

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const allVisibleSelected = paginatedVendors.length > 0
    && paginatedVendors.every((vendor) => selectedVendors.includes(vendor.id));
  const someVisibleSelected = paginatedVendors.some((vendor) => selectedVendors.includes(vendor.id));

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedVendors(paginatedVendors.map((vendor) => vendor.id));
      return;
    }
    setSelectedVendors([]);
  };

  const handleSelectOne = (vendorId) => {
    setSelectedVendors((prev) => (
      prev.includes(vendorId) ? prev.filter((id) => id !== vendorId) : [...prev, vendorId]
    ));
  };

  return (
    <ListPageLayout maxWidth="xl">
      <ListHeader
        title={t('vendorList.title')}
        summary={`${totalVendors} vendors`}
        rightAction={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/vendors/add')}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            {t('vendorList.newVendor')}
          </Button>
        }
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search vendors..."
      />

      <FilterBar
        statusValue={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={[
          { value: "All", label: t('common.allStatus') },
          { value: "Active", label: "Active" },
          { value: "Inactive", label: "Inactive" },
        ]}
        dateValue={dateRange}
        onDateChange={setDateRange}
        dateOptions={[
          { value: "all", label: "All Time" },
          { value: "this_week", label: "This Week" },
          { value: "this_month", label: "This Month" },
          { value: "this_year", label: "This Year" },
        ]}
      />

      <ListSummary
        items={[
          { label: "Total", value: totalVendors, color: "default" },
          { label: "Active", value: activeVendors, color: "success" },
          { label: "Inactive", value: totalVendors - activeVendors, color: "warning" },
        ]}
      />

      <BulkActionBar
        selectedCount={selectedVendors.length}
        actions={[
          {
            label: "Delete Selected",
            color: "error",
            onClick: () => setConfirmDeleteId(selectedVendors[0] || null),
            disabled: selectedVendors.length === 0,
          },
        ]}
      />

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
        <DataTable
          isMobile={isMobile}
          renderCard={(vendor) => (
            <VendorCard
              vendor={vendor}
              onEdit={() => navigate(`/vendors/edit/${vendor.id}`)}
              onDelete={() => setConfirmDeleteId(vendor.id)}
            />
          )}
          columns={[
            { key: 'checkbox', label: '', width: CHECKBOX_COLUMN_WIDTH },
            { key: 'vendor_name', label: t('vendorList.columns.vendorName'), sortable: true },
            { key: 'contact_person', label: t('vendorList.columns.contactPerson') },
            { key: 'email', label: t('vendorList.columns.email') },
            { key: 'phone', label: t('vendorList.columns.phone') },
            { key: 'payment_terms', label: t('vendorList.columns.paymentTerms') },
            { key: 'status', label: t('common.status'), align: 'center' },
            { key: 'actions', label: t('common.actions'), align: 'center' },
          ]}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          rows={paginatedVendors}
          loading={loading}
          emptyIcon={<LocalShippingIcon sx={{ fontSize: 48 }} />}
          emptyTitle={searchTerm ? t('vendorList.noVendors') : t('vendorList.noVendorsYet')}
          emptySubtitle={searchTerm ? "Try adjusting your search terms" : "Click 'New Vendor' to add your first vendor"}
          renderRow={(vendor) => (
            <TableRow key={vendor.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/vendors/edit/${vendor.id}`)}>
              <TableCell padding="checkbox" onClick={(event) => event.stopPropagation()}>
                <Checkbox
                  checked={selectedVendors.includes(vendor.id)}
                  onChange={() => handleSelectOne(vendor.id)}
                />
              </TableCell>
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
                <Box display="flex" gap={0.5} justifyContent="center" onClick={(event) => event.stopPropagation()}>
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
          headerCheckbox={
            <Checkbox
              checked={allVisibleSelected}
              indeterminate={!allVisibleSelected && someVisibleSelected}
              onChange={handleSelectAll}
            />
          }
        />
      

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
    </ListPageLayout>
  );
};

export default VendorList;
