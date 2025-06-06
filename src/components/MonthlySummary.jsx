import React from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";

const MonthlySummary = () => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Paper elevation={1} sx={{ bgcolor: '#f0f9ff', p: 2, borderRadius: 2, textAlign: 'center', fontWeight: 'bold' }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>Recents</Typography>
          <Typography variant="h6" fontWeight={700}>₹ 23,000</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper elevation={1} sx={{ bgcolor: '#f0f9ff', p: 2, borderRadius: 2, textAlign: 'center', fontWeight: 'bold' }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>Total Income</Typography>
          <Typography variant="h6" fontWeight={700}>₹ 23,000</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper elevation={1} sx={{ bgcolor: '#f0f9ff', p: 2, borderRadius: 2, textAlign: 'center', fontWeight: 'bold' }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>Total Expenses</Typography>
          <Typography variant="h6" fontWeight={700}>₹ 23,000</Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default MonthlySummary;
