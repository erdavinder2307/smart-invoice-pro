import React, { useEffect, useState } from "react";
import axios from "axios";
import { createApiUrl } from "../config/api";
import MainLayout from "./Layout/MainLayout";
import StatusBadge from "./common/StatusBadge";
import SummaryCard from "./common/SummaryCard";
import {
  Box,
  Button,
  Typography,
  Paper,
  TableRow,
  TableCell,
  Alert,
  InputAdornment,
  TextField,
  Fade,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Container,
  FormControl,
  Select,
  Chip,
} from "@mui/material";
import StandardDataTable from "./common/StandardDataTable";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RepeatIcon from "@mui/icons-material/Repeat";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const RecurringProfileList = () => {
  const [profiles, setProfiles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(createApiUrl("/api/recurring-profiles"));
      setProfiles(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch recurring profiles");
      console.error(err);
    }
    setLoading(false);
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(createApiUrl("/api/customers"));
      setCustomers(response.data);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    }
  };

  useEffect(() => {
    fetchProfiles();
    fetchCustomers();
  }, []);

  const filteredProfiles = profiles.filter((profile) => {
    const customer = customers.find((c) => c.id === profile.customer_id);
    const customerName = customer ? customer.name : "";

    const matchesSearch =
      profile.profile_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.frequency?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "All" || profile.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const paginatedProfiles = filteredProfiles.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Calculate summary metrics
  const activeCount = profiles.filter((p) => p.status === "Active").length;
  
  const upcomingInvoices = profiles.filter((p) => {
    if (p.status !== "Active") return false;
    const nextRun = new Date(p.next_run_date);
    const today = new Date();
    const diffDays = Math.ceil((nextRun - today) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  }).length;

  const pausedCount = profiles.filter((p) => p.status === "Paused").length;

  const totalInvoicesGenerated = profiles.reduce(
    (sum, p) => sum + (p.occurrences_created || 0),
    0
  );

  const handleEdit = (profile) => {
    navigate(`/recurring-profiles/edit/${profile.id}`);
  };

  const handleAdd = () => {
    navigate("/recurring-profiles/add");
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(createApiUrl(`/api/recurring-profiles/${id}`));
      fetchProfiles();
      setConfirmDeleteId(null);
      setError("");
    } catch (err) {
      setError("Failed to delete recurring profile");
      console.error(err);
    }
    setLoading(false);
  };

  const handlePause = async (profile) => {
    try {
      await axios.post(createApiUrl(`/api/recurring-profiles/${profile.id}/pause`));
      fetchProfiles();
      setError("");
    } catch (err) {
      setError("Failed to pause profile");
      console.error(err);
    }
    handleActionMenuClose();
  };

  const handleResume = async (profile) => {
    try {
      await axios.post(createApiUrl(`/api/recurring-profiles/${profile.id}/resume`));
      fetchProfiles();
      setError("");
    } catch (err) {
      setError("Failed to resume profile");
      console.error(err);
    }
    handleActionMenuClose();
  };

  const handleActionMenuOpen = (event, profile) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedProfile(profile);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedProfile(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.name : "Unknown";
  };

  const getStatusColor = (status) => {
    const statusColors = {
      Active: "success",
      Paused: "warning",
      Expired: "error",
      Stopped: "default"
    };
    return statusColors[status] || "default";
  };

  const getFrequencyIcon = (frequency) => {
    return <RepeatIcon fontSize="small" />;
  };

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Fade in timeout={500}>
          <Box>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
              <Box>
                <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5, display: "flex", alignItems: "center", gap: 1 }}>
                  <EventRepeatIcon fontSize="large" color="primary" />
                  Recurring Invoices
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Automate invoice generation with recurring profiles
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAdd}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: 600,
                  boxShadow: 2,
                  "&:hover": { boxShadow: 4 }
                }}
              >
                New Recurring Profile
              </Button>
            </Box>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <SummaryCard
                  title="Active Profiles"
                  value={activeCount}
                  icon={<CheckCircleIcon />}
                  color="#48bb78"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <SummaryCard
                  title="Upcoming (7 Days)"
                  value={upcomingInvoices}
                  icon={<AccessTimeIcon />}
                  color="#ed8936"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <SummaryCard
                  title="Paused"
                  value={pausedCount}
                  icon={<PauseIcon />}
                  color="#667eea"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <SummaryCard
                  title="Total Generated"
                  value={totalInvoicesGenerated}
                  icon={<RepeatIcon />}
                  color="#9f7aea"
                />
              </Grid>
            </Grid>

            {error && (
              <Fade in={!!error}>
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError("")}>
                  {error}
                </Alert>
              </Fade>
            )}

            {/* Filters */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 3, border: "1px solid", borderColor: "grey.200" }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Search by profile name, customer, or frequency..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        bgcolor: "grey.50"
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      sx={{ borderRadius: 2, bgcolor: "grey.50" }}
                    >
                      <MenuItem value="All">All Status</MenuItem>
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="Paused">Paused</MenuItem>
                      <MenuItem value="Expired">Expired</MenuItem>
                      <MenuItem value="Stopped">Stopped</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary" textAlign="right">
                    {filteredProfiles.length} profile{filteredProfiles.length !== 1 ? 's' : ''} found
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Table */}
            <StandardDataTable
              columns={[
                { key: 'profile_name', label: 'Profile Name' },
                { key: 'customer', label: 'Customer' },
                { key: 'frequency', label: 'Frequency' },
                { key: 'next_run', label: 'Next Run' },
                { key: 'last_run', label: 'Last Run' },
                { key: 'generated', label: 'Generated' },
                { key: 'status', label: 'Status' },
                { key: 'actions', label: 'Actions', align: 'center' },
              ]}
              rows={paginatedProfiles}
              loading={loading}
              emptyIcon={<EventRepeatIcon sx={{ fontSize: 48 }} />}
              emptyTitle="No recurring profiles found"
              emptySubtitle="Create a recurring profile to automate invoice generation"
              onRowClick={(profile) => handleEdit(profile)}
              renderRow={(profile) => (
                <TableRow
                  key={profile.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleEdit(profile)}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{profile.profile_name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{getCustomerName(profile.customer_id)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip icon={getFrequencyIcon(profile.frequency)} label={profile.frequency} size="small" color="primary" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{profile.next_run_date ? new Date(profile.next_run_date).toLocaleDateString() : "-"}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">{profile.last_run_date ? new Date(profile.last_run_date).toLocaleDateString() : "Never"}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{profile.occurrences_created || 0}{profile.occurrence_limit ? ` / ${profile.occurrence_limit}` : ''}</Typography>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={profile.status} color={getStatusColor(profile.status)} />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleActionMenuOpen(e, profile); }}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )}
              pagination={{
                rowsPerPageOptions: [5, 10, 25, 50],
                count: filteredProfiles.length,
                rowsPerPage,
                page,
                onPageChange: handleChangePage,
                onRowsPerPageChange: handleChangeRowsPerPage,
              }}
            />
          </Box>
        </Fade>
      </Container>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
      >
        <MenuItem onClick={() => { handleEdit(selectedProfile); handleActionMenuClose(); }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        {selectedProfile?.status === "Active" && (
          <MenuItem onClick={() => handlePause(selectedProfile)}>
            <ListItemIcon>
              <PauseIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Pause</ListItemText>
          </MenuItem>
        )}
        {selectedProfile?.status === "Paused" && (
          <MenuItem onClick={() => handleResume(selectedProfile)}>
            <ListItemIcon>
              <PlayArrowIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Resume</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => { setConfirmDeleteId(selectedProfile?.id); handleActionMenuClose(); }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this recurring profile? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
          <Button onClick={() => handleDelete(confirmDeleteId)} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default RecurringProfileList;
