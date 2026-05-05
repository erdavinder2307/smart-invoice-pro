import React from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MainLayout from "./Layout/MainLayout";
import StatusBadge from "./common/StatusBadge";
import { getBillById, markBillAsPaid } from "../services/billService";

const formatAmount = (value) => `₹${Number(value || 0).toFixed(2)}`;

const formatDate = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("en-GB");
};

const BillDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const billQuery = useQuery({
    queryKey: ["bill-detail", id],
    queryFn: ({ signal }) => getBillById(id, signal),
    enabled: Boolean(id),
  });

  const markPaidMutation = useMutation({
    mutationFn: markBillAsPaid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bill-detail", id] });
      queryClient.invalidateQueries({ queryKey: ["bills-list"] });
    },
  });

  const bill = billQuery.data || {};

  return (
    <MainLayout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h5" fontWeight={700}>Bill Details</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="outlined" onClick={() => navigate("/bills")} sx={{ textTransform: "none" }}>Back</Button>
            <Button
              variant="outlined"
              onClick={() => navigate(`/bills/edit/${id}`)}
              sx={{ textTransform: "none" }}
            >
              Edit
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => markPaidMutation.mutate(bill)}
              disabled={Number(bill.balance_due || 0) <= 0 || markPaidMutation.isPending}
              sx={{ textTransform: "none" }}
            >
              {markPaidMutation.isPending ? "Updating..." : "Mark as Paid"}
            </Button>
          </Box>
        </Box>

        {billQuery.isLoading && (
          <Paper sx={{ p: 3, display: "flex", alignItems: "center", gap: 1 }}>
            <CircularProgress size={20} />
            <Typography>Loading bill details...</Typography>
          </Paper>
        )}

        {billQuery.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to load bill details.
          </Alert>
        )}

        {!billQuery.isLoading && !billQuery.isError && (
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Bill Number</Typography>
                <Typography variant="body1" fontWeight={700}>{bill.bill_number || "-"}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <StatusBadge status={bill.status_bucket || bill.payment_status || "Open"} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Vendor</Typography>
                <Typography>{bill.vendor_name || "-"}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Reference</Typography>
                <Typography>{bill.reference || "-"}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Bill Date</Typography>
                <Typography>{formatDate(bill.bill_date)}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Due Date</Typography>
                <Typography>{formatDate(bill.due_date)}</Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                <Typography fontWeight={700}>{formatAmount(bill.total_amount)}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">Amount Paid</Typography>
                <Typography fontWeight={700} color="success.main">{formatAmount(bill.amount_paid)}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">Balance Due</Typography>
                <Typography fontWeight={700} color="error.main">{formatAmount(bill.balance_due)}</Typography>
              </Grid>
            </Grid>

            {bill.notes && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary">Notes</Typography>
                <Typography>{bill.notes}</Typography>
              </>
            )}
          </Paper>
        )}
      </Box>
    </MainLayout>
  );
};

export default BillDetails;
