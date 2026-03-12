import React from "react";
import { Box, Paper, Tabs, Tab } from "@mui/material";

const TabbedFormWrapper = ({ tabs = [], value, onChange, children }) => {
  return (
    <Paper>
      <Box sx={{ borderBottom: "1px solid", borderColor: "divider", px: 1 }}>
        <Tabs value={value} onChange={onChange} variant="scrollable" scrollButtons="auto">
          {tabs.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </Tabs>
      </Box>

      <Box sx={{ p: 2 }}>
        {children}
      </Box>
    </Paper>
  );
};

export default TabbedFormWrapper;
