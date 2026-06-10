import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Popover,
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
  List,
  ListItem,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import { useNotifications } from '../../context/NotificationContext';
import { usePermission } from '../../context/PermissionContext';
import { safeClick } from '../../utils/safeClick';

const NOTIFICATION_PERMISSIONS = {
  invoice_created:             { module: 'invoices', action: 'view' },
  payment_received:            { module: 'invoices', action: 'view' },
  recurring_invoice_generated: { module: 'invoices', action: 'view' },
  customer_created:            { module: 'customers', action: 'view' },
  reminder_sent:               { module: 'invoices', action: 'view' },
  low_stock:                   { module: 'products', action: 'view' },
  bank_import_started:         { module: 'banking', action: 'view' },
  bank_import_ready:           { module: 'banking', action: 'view' },
  bank_import_approved:        { module: 'banking', action: 'view' },
};

const TYPE_ICON = {
  invoice_created: <ReceiptOutlinedIcon fontSize="small" sx={{ color: 'primary.main' }} />,
  payment_received: <PaymentsOutlinedIcon fontSize="small" sx={{ color: 'success.main' }} />,
  customer_created: <PersonAddOutlinedIcon fontSize="small" sx={{ color: 'info.main' }} />,
  reminder_sent: <MailOutlineIcon fontSize="small" sx={{ color: 'warning.main' }} />,
  low_stock: <InventoryOutlinedIcon fontSize="small" sx={{ color: 'error.main' }} />,
};

function relativeTime(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const NotificationDropdown = ({ anchorEl, onClose }) => {
  const { notifications, unreadCount, loading, markRead, markAllAsRead } = useNotifications();
  const { can, isAdmin: permIsAdmin } = usePermission();
  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  // Filter out notifications the user lacks permission to see
  const allowedNotifications = notifications.filter((n) => {
    const perm = NOTIFICATION_PERMISSIONS[n.type];
    if (!perm) return true;
    return permIsAdmin || can(perm.module, perm.action);
  });
  const preview = allowedNotifications.slice(0, 10);

  const handleViewAll = () => {
    onClose();
    navigate('/notifications');
  };

  const handleItemClick = (n) => {
    if (!n.is_read) markRead(n.id);
    onClose();
    if (n.entity_type === 'invoice' && n.entity_id && (permIsAdmin || can('invoices', 'view'))) {
      navigate(`/invoices`);
    } else if (n.entity_type === 'customer' && n.entity_id && (permIsAdmin || can('customers', 'view'))) {
      navigate(`/customers`);
    } else if (n.entity_type === 'product' && n.entity_id && (permIsAdmin || can('products', 'view'))) {
      navigate(`/inventory`);
    }
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      PaperProps={{
        sx: {
          width: 380,
          maxHeight: 520,
          borderRadius: 2,
          boxShadow: 4,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'grey.200',
        }}
      >
        <Typography variant="subtitle1" fontWeight={700}>
          Notifications
          {unreadCount > 0 && (
            <Typography
              component="span"
              sx={{
                ml: 1,
                px: 0.8,
                py: 0.2,
                borderRadius: 10,
                bgcolor: 'error.main',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 700,
              }}
            >
              {unreadCount}
            </Typography>
          )}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={safeClick(markAllAsRead)}
              sx={{ textTransform: 'none', fontSize: '0.75rem' }}
            >
              Mark all read
            </Button>
          )}
          <IconButton size="small" onClick={safeClick(onClose)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ overflowY: 'auto', flex: 1 }}>
        {loading && preview.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : preview.length === 0 ? (
          <Box sx={{ py: 5, textAlign: 'center' }}>
            <NotificationsNoneOutlinedIcon sx={{ fontSize: 40, color: 'grey.400', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {preview.map((n, idx) => (
              <React.Fragment key={n.id}>
                <ListItem
                  alignItems="flex-start"
                  onClick={() => handleItemClick(n)}
                  sx={{
                    px: 2,
                    py: 1.25,
                    cursor: 'pointer',
                    bgcolor: n.is_read ? 'transparent' : 'primary.50',
                    borderLeft: n.is_read ? 'none' : '3px solid',
                    borderColor: 'primary.main',
                    '&:hover': { bgcolor: 'grey.50' },
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ pt: 0.25, flexShrink: 0 }}>
                    {TYPE_ICON[n.type] || <NotificationsNoneOutlinedIcon fontSize="small" />}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      fontWeight={n.is_read ? 400 : 600}
                      noWrap={false}
                      sx={{ lineHeight: 1.4 }}
                    >
                      {n.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mt: 0.25, lineHeight: 1.4 }}
                    >
                      {n.message}
                    </Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                      {relativeTime(n.created_at)}
                    </Typography>
                  </Box>
                </ListItem>
                {idx < preview.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          px: 2,
          py: 1.25,
          borderTop: '1px solid',
          borderColor: 'grey.200',
          textAlign: 'center',
        }}
      >
        <Button
          size="small"
          fullWidth
          onClick={safeClick(handleViewAll)}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          View all notifications
        </Button>
      </Box>
    </Popover>
  );
};

export default NotificationDropdown;
