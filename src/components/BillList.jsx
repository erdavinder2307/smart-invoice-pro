import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { createApiUrl } from "../config/api";
import StatusBadge from "./common/StatusBadge";
import {
  Box,
  Button,
  Checkbox,
  Typography,
  TableRow,
  TableCell,
  CircularProgress,
  Alert,
  Fade,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { CHECKBOX_COLUMN_WIDTH } from "./common/StandardDataTable";
import BillCard from "./common/BillCard";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { useTranslation } from "react-i18next";
import ListPageLayout from "./list/ListPageLayout";
import ListHeader from "./list/ListHeader";
import FilterBar from "./list/FilterBar";
import ListSummary from "./list/ListSummary";
import DataTable from "./list/DataTable";
import BulkActionBar from "./list/BulkActionBar";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import useTableSorting from "../hooks/useTableSorting";

const BillList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [bills, setBills] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateRange, setDateRange] = useState("all");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [selectedBills, setSelectedBills] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const debouncedSearch = useDebouncedValue(searchTerm, 300);

  const { sortBy, sortOrder, handleSort, sortParams } = useTableSorting("created_at", "desc", "bills");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [billsResponse, vendorsResponse] = await Promise.all([
        axios.get(createApiUrl("/api/bills"), { params: sortParams }),
        axios.get(createApiUrl("/api/vendors"))
      ]);
      setBills(billsResponse.data);
      setVendors(vendorsResponse.data);
    } catch (error) {
      setError(t('billList.failedFetch'));
      console.error(error);
    }
    setLoading(false);
  }, [t, sortParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(createApiUrl(`/api/bills/${id}`));
      await fetchData();
      setConfirmDeleteId(null);
    } catch (error) {
      setError(error.response?.data?.error || t('billList.failedDelete'));
    }
    setLoading(false);
  };

  // Filter bills
  const filteredBills = bills.filter((bill) => {
    const vendor = vendors.find(v => v.id === bill.vendor_id);
    const vendorName = vendor ? vendor.vendor_name : "";
    const term = debouncedSearch.trim().toLowerCase();

    const matchesSearch =
      !term
      || bill.bill_number?.toLowerCase().includes(term)
      || bill.subject?.toLowerCase().includes(term)
      || vendorName.toLowerCase().includes(term);

    const matchesStatus = statusFilter === "All" || bill.payment_status === statusFilter;
    const createdAt = new Date(bill.bill_date || bill.created_at || 0).getTime();
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

  // Paginated bills
  const paginatedBills = filteredBills.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Calculate summary stats
  const totalBillAmount = filteredBills.reduce((sum, bill) => sum + (bill.total_amount || 0), 0);
  const totalPaid = filteredBills.reduce((sum, bill) => sum + (bill.amount_paid || 0), 0);
  const totalDue = filteredBills.reduce((sum, bill) => sum + (bill.balance_due || 0), 0);
  const unpaidCount = filteredBills.filter(b => b.payment_status === "Unpaid").length;
  const paidCount = filteredBills.filter(b => b.payment_status === "Paid").length;

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

  const allVisibleSelected = paginatedBills.length > 0
    && paginatedBills.every((bill) => selectedBills.includes(bill.id));
  const someVisibleSelected = paginatedBills.some((bill) => selectedBills.includes(bill.id));

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedBills(paginatedBills.map((bill) => bill.id));
      return;
    }
    setSelectedBills([]);
  };

  const handleSelectOne = (billId) => {
    setSelectedBills((prev) => (
      prev.includes(billId) ? prev.filter((id) => id !== billId) : [...prev, billId]
    ));
  };

  return (
    <ListPageLayout maxWidth="xl">
      <ListHeader
        title={t('billList.title')}
        summary={`${filteredBills.length} bills`}
        rightAction={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/bills/add')}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            {t('billList.newBill')}
          </Button>
        }
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search bills..."
      />

      <FilterBar
        statusValue={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={[
          { value: "All", label: t('common.allStatus') },
          { value: "Unpaid", label: "Unpaid" },
          { value: "Partially Paid", label: "Partially Paid" },
          { value: "Paid", label: "Paid" },
          { value: "Overdue", label: "Overdue" },
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
          { label: "Total", value: `₹${totalBillAmount.toLocaleString()}`, color: "default" },
          { label: "Paid", value: `₹${totalPaid.toLocaleString()}`, color: "success" },
          { label: "Due", value: `₹${totalDue.toLocaleString()}`, color: "error" },
          { label: "Unpaid/Paid", value: `${unpaidCount}/${paidCount}`, color: "warning" },
        ]}
      />

      <BulkActionBar
        selectedCount={selectedBills.length}
        actions={[
          {
            label: "Delete Selected",
            color: "error",
            onClick: () => setConfirmDeleteId(selectedBills[0] || null),
            disabled: selectedBills.length === 0,
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
          renderCard={(bill) => {
            const cardVendor = vendors.find(v => v.id === bill.vendor_id);
            return (
              <BillCard
                bill={bill}
                vendorName={cardVendor ? cardVendor.vendor_name : "Unknown Vendor"}
                onEdit={() => navigate(`/bills/edit/${bill.id}`)}
                onDelete={() => setConfirmDeleteId(bill.id)}
              />
            );
          }}
          columns={[
            { key: 'checkbox', label: '', width: CHECKBOX_COLUMN_WIDTH },
            { key: 'bill_number', label: 'Bill #', sortable: true },
            { key: 'vendor', label: 'Vendor' },
            { key: 'subject', label: 'Subject' },
            { key: 'bill_date', label: 'Bill Date', sortable: true },
            { key: 'due_date', label: 'Due Date', sortable: true },
            { key: 'total_amount', label: 'Amount', sortable: true },
            { key: 'paid', label: 'Paid' },
            { key: 'balance', label: 'Balance' },
            { key: 'status', label: 'Status' },
            { key: 'actions', label: 'Actions', align: 'center' },
          ]}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          rows={paginatedBills}
          loading={loading}
          emptyIcon={<ReceiptIcon sx={{ fontSize: 48 }} />}
          emptyTitle={searchTerm || statusFilter !== "All" ? t('billList.noBills') : t('billList.noBillsYet')}
          emptySubtitle={searchTerm || statusFilter !== "All" ? "Try adjusting your search or filters" : "Click 'New Bill' to create your first bill"}
          renderRow={(bill) => {
            const vendor = vendors.find(v => v.id === bill.vendor_id);
            return (
              <TableRow key={bill.id} hover onClick={() => navigate(`/bills/edit/${bill.id}`)} sx={{ cursor: "pointer" }}>
                <TableCell padding="checkbox" onClick={(event) => event.stopPropagation()}>
                  <Checkbox
                    checked={selectedBills.includes(bill.id)}
                    onChange={() => handleSelectOne(bill.id)}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>{bill.bill_number}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{vendor ? vendor.vendor_name : "Unknown Vendor"}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{bill.subject || "-"}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{new Date(bill.bill_date).toLocaleDateString()}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{bill.due_date ? new Date(bill.due_date).toLocaleDateString() : "-"}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>₹{bill.total_amount?.toLocaleString() || "0"}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="success.main">₹{bill.amount_paid?.toLocaleString() || "0"}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="error.main">₹{bill.balance_due?.toLocaleString() || "0"}</Typography>
                </TableCell>
                <TableCell>
                  <StatusBadge status={bill.payment_status} />
                </TableCell>
                <TableCell align="center">
                  <Box display="flex" gap={0.5} justifyContent="center" onClick={(event) => event.stopPropagation()}>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => navigate(`/bills/edit/${bill.id}`)} sx={{ color: 'primary.main' }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => setConfirmDeleteId(bill.id)} sx={{ color: 'error.main' }} disabled={bill.payment_status === "Paid"}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            );
          }}
          pagination={{
            rowsPerPageOptions: [10, 25, 50],
            count: filteredBills.length,
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
            Delete Bill
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary">
            Are you sure you want to delete this bill?
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

export default BillList;
