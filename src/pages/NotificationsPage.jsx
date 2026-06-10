import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Chip,
  Divider,
  CircularProgress,
  List,
  ListItem,
  Container,
  Paper,
} from '@mui/material';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import MainLayout from '../components/Layout/MainLayout';
import SectionHeader from '../components/common/SectionHeader';
import EmptyState from '../components/common/EmptyState';
import { useNotifications } from '../context/NotificationContext';
import { usePermission } from '../context/PermissionContext';
import { useTranslation } from 'react-i18next';

// Maps notification type → required module permission (module, action)
const NOTIFICATION_PERMISSIONS = {
  invoice_created:            { module: 'invoices', action: 'view' },
  payment_received:           { module: 'invoices', action: 'view' },
  recurring_invoice_generated:{ module: 'invoices', action: 'view' },
  customer_created:           { module: 'customers', action: 'view' },
  reminder_sent:              { module: 'invoices', action: 'view' },
  low_stock:                  { module: 'products', action: 'view' },
  bank_import_started:        { module: 'banking', action: 'view' },
  bank_import_ready:          { module: 'banking', action: 'view' },
  bank_import_approved:       { module: 'banking', action: 'view' },
};

const ALL_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Invoices', value: 'invoice_created',  module: 'invoices' },
  { label: 'Payments', value: 'payment_received', module: 'invoices' },
  { label: 'Customers', value: 'customer_created', module: 'customers' },
  { label: 'Reminders', value: 'reminder_sent',   module: 'invoices' },
  { label: 'Low Stock', value: 'low_stock',        module: 'products' },
  { label: 'Banking', value: 'bank_import_started', module: 'banking' },
];

const TYPE_ICON = {
  invoice_created: <ReceiptOutlinedIcon sx={{ color: 'primary.main' }} />,
  payment_received: <PaymentsOutlinedIcon sx={{ color: 'success.main' }} />,
  customer_created: <PersonAddOutlinedIcon sx={{ color: 'info.main' }} />,
  reminder_sent: <MailOutlineIcon sx={{ color: 'warning.main' }} />,
  low_stock: <InventoryOutlinedIcon sx={{ color: 'error.main' }} />,
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
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

const NotificationsPage = () => {
  const { notifications, loading, unreadCount, markRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { can, isAdmin: permIsAdmin } = usePermission();
  const [activeFilter, setActiveFilter] = useState('all');

  // Only show notifications for modules the user can access
  const allowedNotifications = notifications.filter((n) => {
    const perm = NOTIFICATION_PERMISSIONS[n.type];
    if (!perm) return true; // unknown types always visible
    return permIsAdmin || can(perm.module, perm.action);
  });

  // Only show filter chips for modules the user can access
  const visibleFilters = ALL_FILTERS.filter((f) => {
    if (f.value === 'all') return true;
    return permIsAdmin || can(f.module, 'view');
  });

  const matchesFilter = (n, filter) => {
    if (filter === 'all') return true;
    if (filter === 'bank_import_started') {
      return ['bank_import_started', 'bank_import_ready', 'bank_import_approved'].includes(n.type);
    }
    return n.type === filter;
  };

  const filtered = allowedNotifications.filter((n) => matchesFilter(n, activeFilter));

  const handleItemClick = (n) => {
    if (!n.is_read) markRead(n.id);
    if (n.entity_type === 'invoice' && (permIsAdmin || can('invoices', 'view'))) navigate('/invoices');
    else if (n.entity_type === 'customer' && (permIsAdmin || can('customers', 'view'))) navigate('/customers');
    else if (n.entity_type === 'product' && (permIsAdmin || can('products', 'view'))) navigate('/inventory');
  };

  return (
    <MainLayout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <SectionHeader
          title={t('notifications.title')}
          subtitle={t('notifications.subtitle')}
          primaryAction={
            unreadCount > 0
              ? {
                  label: t('notifications.markAllRead'),
                  icon: <DoneAllIcon />,
                  onClick: markAllAsRead,
                }
              : undefined
          }
          sx={{ mb: 3 }}
        />

        {/* Filter chips */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
          {visibleFilters.map((f) => (
            <Chip
              key={f.value}
              label={f.label}
              clickable
              color={activeFilter === f.value ? 'primary' : 'default'}
              variant={activeFilter === f.value ? 'filled' : 'outlined'}
              onClick={() => setActiveFilter(f.value)}
              size="small"
            />
          ))}
        </Box>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'grey.200',
            overflow: 'hidden',
          }}
        >
          {loading && filtered.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={28} />
            </Box>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<NotificationsNoneOutlinedIcon />}
              title="No notifications"
              subtitle="Activity will appear here as you use the app."
            />
          ) : (
            <List disablePadding>
              {filtered.map((n, idx) => (
                <React.Fragment key={n.id}>
                  <ListItem
                    alignItems="flex-start"
                    onClick={() => handleItemClick(n)}
                    sx={{
                      px: 3,
                      py: 2,
                      cursor: 'pointer',
                      bgcolor: n.is_read ? 'transparent' : 'primary.50',
                      borderLeft: n.is_read ? '3px solid transparent' : '3px solid',
                      borderColor: n.is_read ? 'transparent' : 'primary.main',
                      '&:hover': { bgcolor: 'grey.50' },
                      gap: 2,
                    }}
                  >
                    <Box sx={{ pt: 0.25, flexShrink: 0 }}>
                      {TYPE_ICON[n.type] || <NotificationsNoneOutlinedIcon />}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box
                        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={n.is_read ? 400 : 700}
                          sx={{ lineHeight: 1.5 }}
                        >
                          {n.title}
                        </Typography>
                        <Typography variant="caption" color="text.disabled" sx={{ whiteSpace: 'nowrap' }}>
                          {relativeTime(n.created_at)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4, lineHeight: 1.5 }}>
                        {n.message}
                      </Typography>
                    </Box>
                    {!n.is_read && (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          flexShrink: 0,
                          mt: 0.8,
                        }}
                      />
                    )}
                  </ListItem>
                  {idx < filtered.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>

        {filtered.length > 0 && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Showing {filtered.length} notification{filtered.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
        )}
      </Container>
    </MainLayout>
  );
};

export default NotificationsPage;
