/**
 * formStyles.js — Shared Zoho Books–style design tokens and layout primitives.
 * Import from any AddEdit* form to get consistent styling.
 */
import React from 'react';
import {
    Box,
    Divider,
    FormControl,
    Select,
    Tooltip,
    Typography,
} from '@mui/material';
import { InfoOutlined as InfoIcon } from '@mui/icons-material';

// ─── Design tokens ─────────────────────────────────────────────────────────────
export const C = {
    border: '#e0e0e0',
    divider: '#ebebeb',
    label: '#3d3d3d',
    hint: '#8c8c8c',
    primary: '#1a73e8',
    pageBg: '#f5f7fa',
    white: '#fff',
    red: '#d93025',
    sectionBg: '#fafbfc',
};

// ─── Shared sx applied to every TextField ─────────────────────────────────────
export const fieldSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '4px',
        backgroundColor: C.white,
        fontSize: '0.875rem',
        '& fieldset': { borderColor: C.border },
        '&:hover fieldset': { borderColor: '#b0b0b0' },
        '&.Mui-focused fieldset': { borderColor: C.primary, borderWidth: '1px' },
    },
    '& .MuiInputLabel-root': { fontSize: '0.875rem', color: C.hint },
    '& .MuiInputLabel-root.Mui-focused': { color: C.primary },
    '& .MuiInputBase-input': { fontSize: '0.875rem', py: '7px', px: '10px' },
    '& .MuiFormHelperText-root': { fontSize: '0.75rem', mx: 0 },
};

// ─── Shared sx applied to every Select  ───────────────────────────────────────
export const selectSx = {
    borderRadius: '4px',
    backgroundColor: C.white,
    fontSize: '0.875rem',
    textAlign: 'left',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: C.border },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#b0b0b0' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: C.primary, borderWidth: '1px' },
    '& .MuiSelect-select': { py: '7px', px: '10px', fontSize: '0.875rem', textAlign: 'left' },
};

export const menuItemSx = { fontSize: '0.875rem' };

// ─── ZohoRow ───────────────────────────────────────────────────────────────────
/**
 * Fixed 180px label column so ALL form field left-edges are pixel-aligned
 * regardless of label text length.
 *
 *   "Vendor Name *"    |  [                     ]
 *   "Email Address"    |  [                     ]
 *   "Payment Terms"    |  [                     ]
 */
const LABEL_WIDTH = 180;

export const ZohoRow = ({ label, required, hint, children, noDivider, alignStart }) => (
    <>
        <Box
            sx={{
                display: 'flex',
                alignItems: alignStart ? 'flex-start' : 'center',
                py: 1.25,
                minHeight: 52,
            }}
        >
            <Box
                sx={{
                    width: LABEL_WIDTH,
                    minWidth: LABEL_WIDTH,
                    flexShrink: 0,
                    pr: 2,
                    pt: alignStart ? '8px' : 0,
                }}
            >
                <Typography
                    variant="body2"
                    component="label"
                    sx={{
                        fontSize: '0.8125rem',
                        color: C.label,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        lineHeight: 1.5,
                        userSelect: 'none',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {label}
                    {required && <Box component="span" sx={{ color: C.red, ml: '1px' }}>*</Box>}
                    {hint && (
                        <Tooltip title={hint} placement="top" arrow>
                            <InfoIcon sx={{ fontSize: 13, color: C.hint, cursor: 'default', flexShrink: 0 }} />
                        </Tooltip>
                    )}
                </Typography>
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
        </Box>
        {!noDivider && <Divider sx={{ borderColor: C.divider }} />}
    </>
);

// ─── FieldLabel ────────────────────────────────────────────────────────────────
/** Label shown ABOVE a field inside tab panels or two-column grids */
export const FieldLabel = ({ children, required, hint }) => (
    <Typography
        variant="body2"
        component="label"
        sx={{
            display: 'block',
            mb: '5px',
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: C.label,
            lineHeight: 1.4,
        }}
    >
        {children}
        {required && <Box component="span" sx={{ color: C.red, ml: '2px' }}>*</Box>}
        {hint && (
            <Tooltip title={hint} placement="top" arrow>
                <InfoIcon sx={{ fontSize: 13, color: C.hint, cursor: 'default', ml: '3px', verticalAlign: 'middle' }} />
            </Tooltip>
        )}
    </Typography>
);

// ─── AppSelect ─────────────────────────────────────────────────────────────────
/** FormControl + Select wrapper — every Select must use this. */
export const AppSelect = ({
    name, value, onChange, children,
    disabled, displayEmpty, size = 'small', fullWidth = true, width,
}) => (
    <FormControl size={size} fullWidth={fullWidth} disabled={disabled} sx={width ? { width } : {}}>
        <Select
            name={name}
            value={value}
            onChange={onChange}
            displayEmpty={displayEmpty}
            sx={selectSx}
        >
            {children}
        </Select>
    </FormControl>
);

// ─── Section divider label ──────────────────────────────────────────────────────
/** Bold section heading used inside a tabbed/sectioned form */
export const SectionHeading = ({ children }) => (
    <Typography
        variant="body2"
        sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#333', mb: 2 }}
    >
        {children}
    </Typography>
);

// ─── Footer action bar ─────────────────────────────────────────────────────────
export const footerSx = {
    px: 3, py: 2,
    bgcolor: '#fafbfc',
    borderTop: `1px solid #ebebeb`,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 1.5,
};

export const cancelBtnSx = {
    textTransform: 'none', borderRadius: '4px', fontWeight: 500,
    fontSize: '0.875rem', px: 3,
    borderColor: '#c8cdd3', color: '#555',
    '&:hover': { borderColor: '#a0a8b4', bgcolor: 'transparent' },
};

export const saveBtnSx = {
    textTransform: 'none', borderRadius: '4px', fontWeight: 500,
    fontSize: '0.875rem', px: 3,
    bgcolor: '#1a73e8', boxShadow: 'none',
    '&:hover': { bgcolor: '#1558b0', boxShadow: 'none' },
    '&:disabled': { bgcolor: '#a8c7f5', color: '#fff' },
};
