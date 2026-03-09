import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  spacing: 8,
  palette: {
    primary: {
      main: '#2563EB',
      dark: '#1E40AF',
      light: '#3B82F6',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#10B981',
      dark: '#059669',
      light: '#34D399',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#DC2626',
      light: '#EF4444',
      dark: '#B91C1C',
    },
    warning: {
      main: '#D97706',
      light: '#F59E0B',
      dark: '#B45309',
    },
    info: {
      main: '#2563EB',
      light: '#60A5FA',
      dark: '#1D4ED8',
    },
    success: {
      main: '#059669',
      light: '#10B981',
      dark: '#047857',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#475569',
      disabled: '#94A3B8',
    },
    divider: '#E2E8F0',
  },
  shape: {
    borderRadius: 6,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, fontSize: '2rem', lineHeight: 1.25 },
    h2: { fontWeight: 700, fontSize: '1.75rem', lineHeight: 1.3 },
    h3: { fontWeight: 700, fontSize: '1.5rem', lineHeight: 1.35 },
    h4: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.4 },
    h5: { fontWeight: 600, fontSize: '1.125rem', lineHeight: 1.4 },
    h6: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.45 },
    subtitle1: { fontWeight: 600, fontSize: '0.95rem' },
    subtitle2: { fontWeight: 600, fontSize: '0.825rem' },
    body1: { fontSize: '0.95rem', lineHeight: 1.55 },
    body2: { fontSize: '0.8125rem', lineHeight: 1.5 },
    button: { textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem' },
    caption: { fontSize: '0.75rem', color: '#64748B' },
    overline: { fontSize: '0.70rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' },
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(15, 23, 42, 0.06)',
    '0px 1px 3px rgba(15, 23, 42, 0.10)',
    '0px 2px 6px rgba(15, 23, 42, 0.10)',
    '0px 4px 10px rgba(15, 23, 42, 0.12)',
    '0px 8px 20px rgba(15, 23, 42, 0.12)',
    '0px 8px 20px rgba(15, 23, 42, 0.12)',
    '0px 8px 20px rgba(15, 23, 42, 0.12)',
    '0px 8px 20px rgba(15, 23, 42, 0.12)',
    '0px 8px 20px rgba(15, 23, 42, 0.12)',
    '0px 8px 20px rgba(15, 23, 42, 0.12)',
    '0px 8px 20px rgba(15, 23, 42, 0.12)',
    '0px 8px 20px rgba(15, 23, 42, 0.12)',
    '0px 8px 20px rgba(15, 23, 42, 0.12)',
    '0px 8px 20px rgba(15, 23, 42, 0.12)',
    '0px 8px 20px rgba(15, 23, 42, 0.12)',
    '0px 8px 20px rgba(15, 23, 42, 0.12)',
    '0px 8px 20px rgba(15, 23, 42, 0.12)',
    '0px 8px 20px rgba(15, 23, 42, 0.12)',
    '0px 8px 20px rgba(15, 23, 42, 0.12)',
    '0px 8px 20px rgba(15, 23, 42, 0.12)',
    '0px 8px 20px rgba(15, 23, 42, 0.12)',
    '0px 8px 20px rgba(15, 23, 42, 0.12)',
    '0px 8px 20px rgba(15, 23, 42, 0.12)',
    '0px 8px 20px rgba(15, 23, 42, 0.12)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F8FAFC',
        },
      },
    },
    MuiContainer: {
      defaultProps: {
        maxWidth: 'xl',
      },
    },
    MuiButton: {
      defaultProps: {
        size: 'small',
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
          padding: '6px 12px',
        },
      },
    },
    MuiIconButton: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
        variant: 'outlined',
      },
    },
    MuiFormControl: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          backgroundColor: '#FFFFFF',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#CBD5E1',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#94A3B8',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.8125rem',
        },
      },
    },
    MuiTable: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          paddingTop: 8,
          paddingBottom: 8,
        },
        head: {
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.02em',
          color: '#475569',
          backgroundColor: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #E2E8F0',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid #E2E8F0',
          boxShadow: 'none',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 40,
        },
        indicator: {
          height: 2,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 40,
          paddingTop: 6,
          paddingBottom: 6,
          fontSize: '0.8125rem',
          fontWeight: 600,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 5,
          fontWeight: 600,
          fontSize: '0.75rem',
        },
      },
    },
  },
});

export default theme;
