import React from "react";
import { Box, Grid, Typography, Divider } from "@mui/material";

const StandardFormLayout = ({
  title,
  subtitle,
  children,
  actions,
  maxWidth = "xl",
}) => {
  return (
    <Box sx={{ maxWidth, mx: "auto" }}>
      {(title || subtitle) && (
        <Box sx={{ mb: 2 }}>
          {title && <Typography variant="h5">{title}</Typography>}
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      )}

      <Grid container spacing={2}>
        {children}
      </Grid>

      {actions && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.25 }}>
            {actions}
          </Box>
        </>
      )}
    </Box>
  );
};

export default StandardFormLayout;
