import React, { useCallback, useEffect, useState } from "react";
import MainLayout from "../components/Layout/MainLayout";
import { Alert, Box, Pagination, Typography } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import { useTranslation } from "react-i18next";
import { usePermission } from "../context/PermissionContext";
import { exportActivityLogs, getActivityLogs } from "../services/auditLogService";
import ActivityFilters from "../components/Activity/ActivityFilters";
import ActivityTimeline from "../components/Activity/ActivityTimeline";
import ActivityGridView from "../components/Activity/ActivityGridView";
import ActivityDetailDrawer from "../components/Activity/ActivityDetailDrawer";

const EMPTY_FILTERS = {
  search: "",
  category: "",
  riskLevel: "",
  entityType: "",
  action: "",
  fromDate: "",
  toDate: "",
};

export default function ActivityCenterPage() {
  const { can, isAdmin } = usePermission();
  const canViewActivity = isAdmin || can("audit_logs", "view");
  const { t } = useTranslation();

  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [viewMode, setViewMode] = useState("timeline");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [exportLoading, setExportLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    if (!canViewActivity) return;
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: rowsPerPage };
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.riskLevel) params.risk_level = filters.riskLevel;
      if (filters.entityType) params.entity_type = filters.entityType;
      if (filters.action) params.action = filters.action;
      if (filters.fromDate) params.from_date = filters.fromDate;
      if (filters.toDate) params.to_date = filters.toDate;

      const result = await getActivityLogs(params);
      setLogs(result.logs ?? []);
      setTotal(result.total ?? 0);
    } catch (err) {
      setError(t("activity.failedFetch"));
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filters, t, canViewActivity]);

  useEffect(() => {
    if (canViewActivity) fetchLogs();
  }, [fetchLogs, canViewActivity]);

  const handleFiltersChange = (next) => {
    setFilters(next);
    setPage(0);
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.riskLevel) params.risk_level = filters.riskLevel;
      if (filters.entityType) params.entity_type = filters.entityType;
      if (filters.action) params.action = filters.action;
      if (filters.fromDate) params.from_date = filters.fromDate;
      if (filters.toDate) params.to_date = filters.toDate;
      await exportActivityLogs(params);
    } catch (err) {
      setError(t("activity.exportFailed"));
    } finally {
      setExportLoading(false);
    }
  };

  if (!canViewActivity) {
    return (
      <MainLayout>
        <Box sx={{ p: 3 }}>
          <Alert severity="error">{t("activity.accessDenied")}</Alert>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <HistoryIcon sx={{ mr: 1, color: "text.secondary" }} />
          <Typography variant="h6" fontWeight={700}>{t("activity.title")}</Typography>
        </Box>

        <ActivityFilters
          filters={filters}
          onChange={handleFiltersChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onExport={handleExport}
          exportLoading={exportLoading}
        />

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {viewMode === "timeline" ? (
          <>
            <ActivityTimeline
              logs={logs}
              loading={loading}
              emptyMessage={t("activity.noEntries")}
              onSelect={setSelectedLog}
            />
            {total > rowsPerPage && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <Pagination
                  count={Math.ceil(total / rowsPerPage)}
                  page={page + 1}
                  onChange={(_, value) => setPage(value - 1)}
                  color="primary"
                  size="small"
                />
              </Box>
            )}
          </>
        ) : (
          <ActivityGridView
            logs={logs}
            loading={loading}
            total={total}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            emptyMessage={t("activity.noEntries")}
            onSelect={setSelectedLog}
          />
        )}
      </Box>

      {selectedLog && (
        <ActivityDetailDrawer log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </MainLayout>
  );
}
