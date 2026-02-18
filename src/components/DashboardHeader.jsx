import React from "react";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import {
  Search,
  FilterList,
  CalendarToday,
  GetApp
} from "@mui/icons-material";
import '../styles/components/dashboard-header.css';

const DashboardHeader = () => {
  const theme = useTheme();
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Paper
      elevation={0}
      className="dashboard-header"
      sx={{
        borderColor: 'grey.300',
        bgcolor: "grey.50"
      }}
    >
      {/* Search Bar */}
      <Box className="dashboard-search-container">
        <Search className="dashboard-search-icon" sx={{ color: 'text.secondary' }} />
        <InputBase
          placeholder="Search invoices, customers, products..."
          className="dashboard-search-input"
          sx={{
            borderColor: 'grey.300',
            '&:hover': {
              borderColor: 'grey.400'
            },
            '&:focus-within': {
              borderColor: 'primary.main',
              boxShadow: `0 0 0 3px ${theme.palette.primary.main}20`
            }
          }}
          inputProps={{ 'aria-label': 'search invoices, customers, products' }}
        />
      </Box>

      {/* Action Buttons */}
      <Box className="dashboard-actions">
        {/* Date Chip */}
        <Chip
          icon={<CalendarToday />}
          label={currentDate}
          variant="outlined"
          size="medium"
          className="dashboard-date-chip"
          sx={{
            borderColor: 'grey.300'
          }}
        />

        {/* Filter Button */}
        <IconButton
          size="large"
          className="dashboard-action-button"
          sx={{
            borderColor: 'grey.300',
            '&:hover': {
              bgcolor: 'grey.100',
              borderColor: 'grey.400'
            }
          }}
        >
          <FilterList />
        </IconButton>

        {/* Export Button */}
        <IconButton
          size="large"
          className="dashboard-action-button"
          sx={{
            borderColor: 'grey.300',
            '&:hover': {
              bgcolor: 'grey.100',
              borderColor: 'grey.400'
            }
          }}
        >
          <GetApp />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default DashboardHeader;
