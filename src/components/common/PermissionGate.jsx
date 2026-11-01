import React from 'react';
import PropTypes from 'prop-types';
import Tooltip from '@mui/material/Tooltip';
import { usePermission } from '../../context/PermissionContext';

/**
 * PermissionGate — conditionally renders children based on a permission check.
 *
 * Usage (hide):
 *   <PermissionGate module="invoices" action="delete">
 *     <DeleteButton />
 *   </PermissionGate>
 *
 * Usage (disable with tooltip):
 *   <PermissionGate module="invoices" action="approve" disabledTooltip="You need approve permission">
 *     <ApproveButton />
 *   </PermissionGate>
 *
 * Admins always pass through.
 */
const PermissionGate = ({ module, action, children, disabledTooltip, fallback }) => {
  const { can, loaded } = usePermission();

  if (!loaded) return null;

  if (can(module, action)) return children;

  if (disabledTooltip) {
    const disabled = React.cloneElement(React.Children.only(children), {
      disabled: true,
      onClick: undefined,
    });
    return (
      <Tooltip title={disabledTooltip} arrow>
        <span style={{ display: 'inline-flex' }}>{disabled}</span>
      </Tooltip>
    );
  }

  return fallback ?? null;
};

PermissionGate.propTypes = {
  module: PropTypes.string.isRequired,
  action: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  disabledTooltip: PropTypes.string,
  fallback: PropTypes.node,
};

export default PermissionGate;
