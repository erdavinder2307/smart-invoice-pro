/**
 * LifecycleArchiveDialog — unified lifecycle management dialog.
 *
 * Modes:
 *   "archive"        — single-entity archive with dependency analysis
 *   "restore"        — single-entity restore (no dependency check needed)
 *   "bulk-archive"   — bulk archive (no per-item dep loading; shows count + warning)
 *   "bulk-restore"   — bulk restore (shows count)
 *
 * Props:
 *   open          {boolean}
 *   onClose       {function}
 *   mode          {"archive"|"restore"|"bulk-archive"|"bulk-restore"}  default "archive"
 *   entityType    {string}   e.g. "invoice", "customer"
 *   entityId      {string}   required for single modes
 *   entityIds     {string[]} required for bulk modes
 *   entityLabel   {string}   human-readable name, e.g. "Invoice"
 *   entityCount   {number}   override count display for bulk modes
 *   onConfirmed   {function} called with the API result on success
 */
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import ArchiveIcon from "@mui/icons-material/Archive";
import { archiveEntity, checkDependencies, restoreEntity } from "../../services/archiveService";
import { bulkArchiveEntities, parseBulkArchiveResult } from "../../services/bulkArchiveService";

const toLabel = (value) => {
  if (!value) return "";
  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const LifecycleArchiveDialog = ({
  open,
  onClose,
  mode = "archive",
  entityType,
  entityId,
  entityIds,
  entityLabel = "record",
  entityCount,
  onConfirmed,
}) => {
  const isBulk = mode === "bulk-archive" || mode === "bulk-restore";
  const isRestore = mode === "restore" || mode === "bulk-restore";

  const [loadingDeps, setLoadingDeps] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [dependencyData, setDependencyData] = useState({ hasDependencies: false, dependencySummary: {} });
  const [error, setError] = useState("");
  const [partialResult, setPartialResult] = useState(null);

  // Load dependencies only for single-entity archive mode
  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!open || isBulk || isRestore || !entityId) return;
      setLoadingDeps(true);
      setError("");
      setPartialResult(null);
      try {
        const data = await checkDependencies(entityType, entityId);
        if (!active) return;
        setDependencyData({
          hasDependencies: Boolean(data?.hasDependencies),
          dependencySummary: data?.dependencySummary || {},
        });
      } catch (err) {
        if (!active) return;
        setError(err?.response?.data?.error || "Failed to check dependencies.");
      } finally {
        if (active) setLoadingDeps(false);
      }
    };

    load();
    return () => { active = false; };
  }, [open, entityId, entityType, isBulk, isRestore]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setError("");
      setPartialResult(null);
      setDependencyData({ hasDependencies: false, dependencySummary: {} });
    }
  }, [open]);

  const dependencyEntries = useMemo(
    () => Object.entries(dependencyData.dependencySummary || {}).filter(([, count]) => Number(count || 0) > 0),
    [dependencyData.dependencySummary]
  );
  const dependencyTotal = useMemo(
    () => dependencyEntries.reduce((acc, [, count]) => acc + Number(count || 0), 0),
    [dependencyEntries]
  );

  const displayCount = entityCount ?? (isBulk ? (entityIds?.length ?? 0) : 1);

  const handleConfirm = async () => {
    setProcessing(true);
    setError("");
    setPartialResult(null);

    try {
      let result;

      if (mode === "bulk-archive") {
        const raw = await bulkArchiveEntities(entityType, entityIds || []);
        result = parseBulkArchiveResult(raw);
        if (result.hasPartialFailure) {
          setPartialResult(result);
          setProcessing(false);
          return; // Stay open to show partial result; user can close manually
        }
      } else if (mode === "bulk-restore") {
        // Sequential restore for bulk; no dedicated bulk-restore endpoint yet
        const results = await Promise.allSettled(
          (entityIds || []).map((id) => restoreEntity(entityType, id))
        );
        const succeeded = results.filter((r) => r.status === "fulfilled").length;
        const failed = results.filter((r) => r.status === "rejected").length;
        result = { successCount: succeeded, failedCount: failed };
        if (failed > 0) {
          setPartialResult({ ...result, hasPartialFailure: true });
          setProcessing(false);
          return;
        }
      } else if (mode === "restore") {
        result = await restoreEntity(entityType, entityId);
      } else {
        // mode === "archive"
        result = await archiveEntity(entityType, entityId);
      }

      onConfirmed?.(result);
      onClose?.();
    } catch (err) {
      setError(err?.response?.data?.error || `Failed to ${isRestore ? "restore" : "archive"} ${entityLabel.toLowerCase()}.`);
    } finally {
      setProcessing(false);
    }
  };

  // ── Dialog title & button labels ─────────────────────────────────────────
  const titleText = isRestore
    ? isBulk
      ? `Restore ${displayCount} ${entityLabel}${displayCount !== 1 ? "s" : ""}?`
      : `Restore ${entityLabel}?`
    : isBulk
    ? `Archive ${displayCount} ${entityLabel}${displayCount !== 1 ? "s" : ""}?`
    : `Archive ${entityLabel}?`;

  const confirmLabel = isRestore
    ? processing
      ? <CircularProgress size={18} color="inherit" />
      : <><RestoreIcon sx={{ mr: 0.5, fontSize: 18 }} /> Restore</>
    : processing
    ? <CircularProgress size={18} color="inherit" />
    : <><ArchiveIcon sx={{ mr: 0.5, fontSize: 18 }} /> {isBulk ? "Archive All" : `Archive ${entityLabel}`}</>;

  return (
    <Dialog open={Boolean(open)} onClose={processing ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>{titleText}</DialogTitle>

      <DialogContent>
        {loadingDeps ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={22} />
          </Box>
        ) : (
          <>
            {/* Error */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Partial result feedback */}
            {partialResult && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {partialResult.successCount} succeeded, {partialResult.failedCount} failed.
                Failed records were skipped and remain unchanged.
              </Alert>
            )}

            {/* ── RESTORE mode ── */}
            {isRestore && !partialResult && (
              <Alert severity="info" sx={{ mb: 1.5 }}>
                {isBulk
                  ? `${displayCount} archived ${entityLabel.toLowerCase()}${displayCount !== 1 ? "s" : ""} will be restored to active status.`
                  : `This ${entityLabel.toLowerCase()} will be returned to active status and become visible in selectors and workflows again.`}
              </Alert>
            )}

            {/* ── ARCHIVE mode: single, with dep analysis ── */}
            {!isRestore && !isBulk && !partialResult && (
              <>
                {dependencyEntries.length > 0 ? (
                  <>
                    <Typography sx={{ color: "text.secondary", mb: 1.5 }}>
                      Operational references were detected for this {entityLabel.toLowerCase()}. Archiving preserves immutable history,
                      reporting integrity, and audit traceability.
                    </Typography>
                    <Typography sx={{ fontWeight: 600, mb: 0.75 }}>
                      Operational impact ({dependencyTotal} references)
                    </Typography>
                    <List dense disablePadding>
                      {dependencyEntries.map(([name, count]) => (
                        <ListItem key={name} disableGutters>
                          <ListItemText primary={`${count} ${toLabel(name)}`} />
                        </ListItem>
                      ))}
                    </List>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography sx={{ color: "text.secondary", fontSize: "0.9rem" }}>
                      Archiving will remove this record from active operations while keeping it visible in historical and audit contexts.
                    </Typography>
                  </>
                ) : (
                  <Alert severity="info" sx={{ mb: 1.5 }}>
                    No operational dependencies were detected.
                  </Alert>
                )}

                <Typography sx={{ color: "text.secondary", lineHeight: 1.6, mt: 1 }}>
                  Archiving removes this {entityLabel.toLowerCase()} from active workflows and selectors while preserving financial
                  history, reports, and audit logs.
                </Typography>
              </>
            )}

            {/* ── BULK ARCHIVE mode ── */}
            {!isRestore && isBulk && !partialResult && (
              <>
                <Alert severity="warning" sx={{ mb: 1.5 }}>
                  {displayCount} {entityLabel.toLowerCase()}
                  {displayCount !== 1 ? "s" : ""} will be archived.
                </Alert>
                <Typography sx={{ color: "text.secondary", lineHeight: 1.6 }}>
                  Records with active dependencies will be noted in the result summary. All others will be moved to Archived status
                  and removed from active workflows.
                </Typography>
              </>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" disabled={processing || loadingDeps} sx={{ textTransform: "none" }}>
          {partialResult ? "Close" : "Cancel"}
        </Button>
        {!partialResult && (
          <Button
            onClick={handleConfirm}
            variant="contained"
            color={isRestore ? "success" : "warning"}
            disabled={processing || loadingDeps}
            sx={{ textTransform: "none", display: "flex", alignItems: "center", gap: 0.5 }}
          >
            {confirmLabel}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default LifecycleArchiveDialog;
