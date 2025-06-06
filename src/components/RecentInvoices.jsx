import React from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

const RecentInvoices = () => {
  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2, bgcolor: '#fff' }}>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Recent Invoices
      </Typography>
      <Stack spacing={2}>
        {[...Array(6)].map((_, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#f9f9f9', p: 2, borderRadius: 1, '&:hover': { bgcolor: '#f0f0f0' } }}>
            <Typography variant="h5" sx={{ mr: 2 }}>🛒</Typography>
            <Box sx={{ flex: 1, ml: 2 }}>
              <Typography variant="subtitle2" fontWeight={700}>Grocery Delivery</Typography>
              <Typography variant="caption" color="text.secondary">Food Delivery</Typography>
            </Box>
            <Typography variant="subtitle1" fontWeight={700} color="text.primary">₹ 350</Typography>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
};

export default RecentInvoices;
