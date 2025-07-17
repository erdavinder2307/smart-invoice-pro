import React from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

const barData = [5, 7, 6, 6, 7, 5, 6, 7];
const barLabels = [
  "Jan 25",
  "Feb 24",
  "Mar 25",
  "Apr 24",
  "May 24",
  "Jun 23",
  "Jul 23",
  "Aug 22",
];

const WeeklyStats = () => {
  return (
    <Paper
      elevation={1}
      sx={{
        bgcolor: "#f0f9ff",
        p: 3,
        borderRadius: 2,
        mb: 2,
      }}
    >
      <Typography
        variant="subtitle1"
        color="text.secondary"
        gutterBottom
      ></Typography>
      <Box
        sx={{
          display: "flex",
          gap: 1,
          alignItems: "flex-end",
          mt: 2,
        }}
      >
        {barData.map((val, idx) => (
          <Box
            key={idx}
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                width: 18,
                height: `${val * 10}px`,
                bgcolor: "linear-gradient(180deg, #4facfe, #00f2fe)",
                borderRadius: 1,
                mb: 0.5,
                background: "linear-gradient(180deg, #4facfe, #00f2fe)",
              }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
            ></Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default WeeklyStats;
