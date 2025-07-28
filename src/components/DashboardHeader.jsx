import React from "react";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import {
  Search,
  FilterList,
  CalendarToday,
  GetApp
} from "@mui/icons-material";

const DashboardHeader = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Paper
      elevation={0}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        p: 2,
        borderRadius: 3,
        border: '1px solid #e5e7eb',
        bgcolor: "#f8fafc",
        gap: 2
      }}
    >
      {/* Search Bar */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        flex: 1, 
        maxWidth: 500,
        position: 'relative'
      }}>
        <Search sx={{ 
          position: 'absolute', 
          left: 16, 
          color: '#6b7280',
          zIndex: 1
        }} />
        <InputBase
          placeholder="Search invoices, customers, products..."
          sx={{
            flex: 1,
            pl: 6,
            pr: 2,
            py: 1.5,
            borderRadius: 3,
            bgcolor: "white",
            fontSize: 16,
            border: '1px solid #d1d5db',
            '&:hover': {
              borderColor: '#9ca3af'
            },
            '&:focus-within': {
              borderColor: '#3b82f6',
              boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
            }
          }}
          inputProps={{ 'aria-label': 'search invoices, customers, products' }}
        />
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Date Chip */}
        <Chip
          icon={<CalendarToday />}
          label={currentDate}
          variant="outlined"
          size="medium"
          sx={{
            bgcolor: 'white',
            borderColor: '#d1d5db',
            '& .MuiChip-label': {
              fontSize: '0.875rem',
              fontWeight: 500
            }
          }}
        />

        {/* Filter Button */}
        <IconButton 
          size="large" 
          sx={{ 
            bgcolor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: 2,
            '&:hover': { 
              bgcolor: '#f3f4f6',
              borderColor: '#9ca3af'
            }
          }}
        >
          <FilterList />
        </IconButton>

        {/* Export Button */}
        <IconButton 
          size="large" 
          sx={{ 
            bgcolor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: 2,
            '&:hover': { 
              bgcolor: '#f3f4f6',
              borderColor: '#9ca3af'
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
