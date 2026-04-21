import React from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import StatusBadge from "./StatusBadge";

/**
 * RecurringProfileCard — Mobile card view for a single recurring invoice profile.
 *
 * Props:
 *   profile        {object}  — recurring profile data
 *   customerName   {string}  — resolved customer name
 *   onEdit         {fn}      — edit handler
 *   onActionMenu   {fn}      — opens action menu (e, profile)
 *   getStatusColor {fn}      — status → MUI color string
 *   getFrequencyIcon {fn}    — frequency → icon element
 */
const RecurringProfileCard = ({
  profile,
  customerName,
  onEdit,
  onActionMenu,
  getStatusColor,
  getFrequencyIcon,
}) => (
  <Card
    elevation={0}
    sx={{
      border: "1px solid #edf0f3",
      borderRadius: 2,
      transition: "box-shadow 0.15s ease, border-color 0.15s ease",
      "&:hover": {
        borderColor: "#c7d2e8",
        boxShadow: "0 2px 8px rgba(37, 99, 235, 0.08)",
      },
    }}
  >
    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
      {/* Row 1: profile name + status */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.25 }}>
        <Typography
          onClick={onEdit}
          sx={{
            fontSize: "0.9rem",
            fontWeight: 700,
            color: "#2563eb",
            cursor: "pointer",
            flex: 1,
            mr: 1,
            lineHeight: 1.3,
            "&:hover": { textDecoration: "underline" },
          }}
        >
          {profile.profile_name || `Profile #${profile.id}`}
        </Typography>
        <StatusBadge
          status={profile.status || "Active"}
          color={getStatusColor ? getStatusColor(profile.status) : undefined}
        />
      </Box>

      {/* Row 2: customer + frequency chip */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5, gap: 1, alignItems: "center" }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: "0.68rem",
              color: "#8b95a7",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              mb: 0.25,
            }}
          >
            Customer
          </Typography>
          <Typography
            sx={{
              fontSize: "0.82rem",
              fontWeight: 500,
              color: "#1a1a2e",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {customerName || "—"}
          </Typography>
        </Box>
        {profile.frequency && (
          <Chip
            icon={getFrequencyIcon ? getFrequencyIcon(profile.frequency) : undefined}
            label={profile.frequency}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontSize: "0.7rem", flexShrink: 0, height: 24 }}
          />
        )}
      </Box>

      <Divider sx={{ borderColor: "#f0f2f5", mb: 1.25 }} />

      {/* Row 3: next run + occurrences + actions */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <Stack direction="row" spacing={2}>
          <Box>
            <Typography
              sx={{
                fontSize: "0.68rem",
                color: "#9aa0a6",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Next Run
            </Typography>
            <Typography sx={{ fontSize: "0.78rem", color: "#374151" }}>
              {profile.next_run_date
                ? new Date(profile.next_run_date).toLocaleDateString()
                : "—"}
            </Typography>
          </Box>
          <Box>
            <Typography
              sx={{
                fontSize: "0.68rem",
                color: "#9aa0a6",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Occurrences
            </Typography>
            <Typography sx={{ fontSize: "0.78rem", color: "#374151" }}>
              {profile.occurrences_created || 0}
              {profile.occurrence_limit ? ` / ${profile.occurrence_limit}` : ""}
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
          <Tooltip title="Edit profile">
            <IconButton
              size="small"
              onClick={onEdit}
              sx={{ color: "#5f87e7", "&:hover": { bgcolor: "#eff4ff" }, width: 34, height: 34 }}
            >
              <EditIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          {onActionMenu && (
            <Tooltip title="More actions">
              <IconButton
                size="small"
                onClick={onActionMenu}
                sx={{ color: "#6b7280", "&:hover": { bgcolor: "#f3f4f6" }, width: 34, height: 34 }}
              >
                <MoreVertIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default RecurringProfileCard;
