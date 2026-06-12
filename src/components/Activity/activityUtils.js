import { ACTION_LABELS } from "./activityConstants";

export function computeDiff(before, after) {
  const allKeys = new Set([
    ...Object.keys(before || {}),
    ...Object.keys(after || {}),
  ]);
  return Array.from(allKeys)
    .filter(
      (k) =>
        JSON.stringify((before || {})[k]) !== JSON.stringify((after || {})[k])
    )
    .map((k) => ({
      field: k,
      before: (before || {})[k],
      after: (after || {})[k],
    }));
}

export function formatActivityDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export function getActorLabel(log) {
  return log?.user_name || log?.user_email || log?.user_id || "System";
}

export function getActivityHeadline(log) {
  if (log?.summary) return log.summary;
  const entity = log?.entity || log?.entity_type || "record";
  const action = String(log?.action || "").toUpperCase();
  const label = log?.entity_label || log?.entity_id || entity;
  return `${label} ${ACTION_LABELS[action] || action}`.trim();
}

export function getWorkflowNarrative(log) {
  const meta = log?.metadata || {};
  if (String(log?.action || "").toUpperCase() !== "CONVERTED") return null;
  const source = log?.entity_label || log?.entity_id;
  const target = meta.target_entity_label || meta.target_entity_id;
  if (source && target) return `${source} → ${target}`;
  return null;
}

export function groupLogsByDate(logs) {
  const groups = new Map();
  (logs || []).forEach((log) => {
    const raw = log.created_at || log.timestamp;
    const key = raw ? new Date(raw).toLocaleDateString() : "Unknown date";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(log);
  });
  return Array.from(groups.entries());
}
