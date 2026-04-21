import React from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import { useTranslation } from 'react-i18next';
import { useKeyboardShortcutsContext } from '../../context/KeyboardShortcutsContext';
import { SHORTCUT_DEFS, SHORTCUT_CATEGORIES } from '../../keyboard/shortcuts';

const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

function Key({ children }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        fontFamily: 'monospace',
        fontSize: '0.75rem',
        bgcolor: 'grey.100',
        border: '1px solid',
        borderColor: 'grey.300',
        borderBottomWidth: 2,
        borderRadius: 0.75,
        px: 0.875,
        py: 0.2,
        lineHeight: 1.6,
        color: 'text.primary',
        fontWeight: 600,
      }}
    >
      {children}
    </Box>
  );
}

function ShortcutRow({ label, keys }) {
  // Split e.g. "⌘ K" → ["⌘", "K"], "Ctrl Enter" → ["Ctrl", "Enter"]
  const parts = keys.split(' ').filter(Boolean);
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Stack direction="row" spacing={0.5} alignItems="center">
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <Typography variant="caption" color="text.disabled" sx={{ mx: 0.25 }}>
                +
              </Typography>
            )}
            <Key>{part}</Key>
          </React.Fragment>
        ))}
      </Stack>
    </Box>
  );
}

const KeyboardShortcutsModal = () => {
  const { t } = useTranslation();
  const { shortcutsModalOpen, closeShortcutsModal } = useKeyboardShortcutsContext();

  return (
    <Dialog
      open={shortcutsModalOpen}
      onClose={closeShortcutsModal}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2.5 } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
        <KeyboardIcon color="primary" sx={{ fontSize: 22 }} />
        <Typography variant="h6" sx={{ flex: 1, fontWeight: 700, fontSize: '1rem' }}>
          {t('keyboardShortcuts.title')}
        </Typography>
        <IconButton size="small" onClick={closeShortcutsModal} aria-label={t('common.close')}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ px: 3, py: 2 }}>
        {SHORTCUT_CATEGORIES.map((category, catIdx) => {
          const items = SHORTCUT_DEFS.filter((d) => d.category === category);
          if (!items.length) return null;
          return (
            <Box key={category} sx={{ mb: catIdx < SHORTCUT_CATEGORIES.length - 1 ? 2.5 : 0 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 0.6,
                  color: 'primary.main',
                  fontSize: '0.65rem',
                  display: 'block',
                  mb: 1,
                }}
              >
                {t(`keyboardShortcuts.category.${category}`)}
              </Typography>
              {items.map((def, i) => (
                <React.Fragment key={def.id}>
                  <ShortcutRow label={t(def.labelKey)} keys={isMac ? def.keys.mac : def.keys.win} />
                  {i < items.length - 1 && <Divider sx={{ my: 0.25, borderStyle: 'dashed' }} />}
                </React.Fragment>
              ))}
            </Box>
          );
        })}

        {/* Extensibility hint */}
        <Box
          sx={{
            mt: 3,
            p: 1.5,
            borderRadius: 1.5,
            bgcolor: 'grey.50',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {t('keyboardShortcuts.hint')}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcutsModal;
