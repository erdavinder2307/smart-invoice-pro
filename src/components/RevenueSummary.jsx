import React from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

const RevenueSummary = () => {
  return (
    <Paper elevation={1} sx={{ bgcolor: '#d9fbd5', p: 3, borderRadius: 2, textAlign: 'center', boxShadow: 2 }}>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Total Revenue
      </Typography>
      <Box sx={{ bgcolor: '#fff', p: 2, borderRadius: 2, boxShadow: 1, mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Pending Payments
        </Typography>
        <Typography variant="h5" fontWeight={700} color="success.main">
          ₹ 9,632,517
        </Typography>
      </Box>
    </Paper>
  );
};

export default RevenueSummary;
