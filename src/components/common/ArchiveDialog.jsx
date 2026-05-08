import React from "react";
import LifecycleArchiveDialog from "./LifecycleArchiveDialog";

const ArchiveDialog = ({ open, onClose, entityType, entityId, entityLabel = "record", onArchived }) => (
  <LifecycleArchiveDialog
    open={open}
    onClose={onClose}
    mode="archive"
    entityType={entityType}
    entityId={entityId}
    entityLabel={entityLabel}
    onConfirmed={onArchived}
  />
);

export default ArchiveDialog;
