import React, { useState } from "react";
import MainLayout from "../components/Layout/MainLayout";
import {
  Alert,
  Box,
  Chip,
  Divider,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Typography,
} from "@mui/material";
import InventoryIcon from "@mui/icons-material/Inventory2Outlined";
import { C } from "../components/common/formStyles";

const VALUATION_METHODS = [
  {
    value: "fifo",
    label: "FIFO (First In, First Out)",
    description:
      "The first items purchased are the first items sold. Best for perishable goods and most common for compliance.",
  },
  {
    value: "lifo",
    label: "LIFO (Last In, First Out)",
    description:
      "The most recently purchased items are sold first. Less common; not permitted under IFRS.",
  },
  {
    value: "weighted_average",
    label: "Weighted Average Cost",
    description:
      "Average cost of all units on hand is used to value inventory. Smooths out price fluctuations.",
  },
];

const InventorySettings = () => {
  const [selectedMethod, setSelectedMethod] = useState("weighted_average");

  return (
    <MainLayout showBreadcrumbs={false}>
      <Box sx={{ pb: 6 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <InventoryIcon sx={{ color: C.primary }} />
          <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#111827" }}>
            Inventory Settings
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{ border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden", mb: 3 }}
        >
          <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${C.divider}` }}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#111827" }}>
              Inventory Valuation Method
            </Typography>
            <Typography sx={{ fontSize: "0.8125rem", color: "#6b7280", mt: 0.5 }}>
              Choose how the cost of goods sold (COGS) and closing inventory value are calculated.
            </Typography>
          </Box>

          <Box sx={{ px: 3, py: 3 }}>
            <Alert
              severity="info"
              sx={{ mb: 3, borderRadius: "6px", fontSize: "0.8125rem" }}
            >
              <strong>Coming Soon —</strong> Automated COGS calculation using the selected method is
              under development. Your selection here will be applied once the feature is released.
              Existing stock records will not be affected.
            </Alert>

            <FormControl size="small" sx={{ minWidth: 360, maxWidth: "100%" }}>
              <Select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                inputProps={{ "aria-label": "Inventory valuation method" }}
                sx={{ fontSize: "0.875rem" }}
              >
                {VALUATION_METHODS.map((method) => (
                  <MenuItem key={method.value} value={method.value}>
                    {method.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Divider sx={{ my: 3 }} />

            {VALUATION_METHODS.map((method) => (
              <Box
                key={method.value}
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "flex-start",
                  py: 1.5,
                  opacity: selectedMethod === method.value ? 1 : 0.5,
                  transition: "opacity 0.15s",
                }}
              >
                <Chip
                  label={method.value === "fifo" ? "FIFO" : method.value === "lifo" ? "LIFO" : "WAC"}
                  size="small"
                  color={selectedMethod === method.value ? "primary" : "default"}
                  variant={selectedMethod === method.value ? "filled" : "outlined"}
                  sx={{ minWidth: 56, fontWeight: 700, fontSize: "0.75rem" }}
                />
                <Box>
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827", mb: 0.25 }}>
                    {method.label}
                  </Typography>
                  <Typography sx={{ fontSize: "0.8rem", color: "#6b7280" }}>
                    {method.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    </MainLayout>
  );
};

export default InventorySettings;
