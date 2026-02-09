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
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        p: 2,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'grey.300',
        bgcolor: "grey.50",
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
          color: 'text.secondary',
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
            border: '1px solid',
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Date Chip */}
        <Chip
          icon={<CalendarToday />}
          label={currentDate}
          variant="outlined"
          size="medium"
          sx={{
            bgcolor: 'white',
            borderColor: 'grey.300',
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
            border: '1px solid',
            borderColor: 'grey.300',
            borderRadius: 2,
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
          sx={{ 
            bgcolor: 'white',
            border: '1px solid',
            borderColor: 'grey.300',
            borderRadius: 2,
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
