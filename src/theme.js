import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0f4c81' },
    secondary: { main: '#0f766e' },
    background: { default: '#f3f6fb', paper: '#ffffff' },
    success: { main: '#15803d' },
    warning: { main: '#d97706' },
    error: { main: '#b91c1c' }
  },
  shape: { borderRadius: 14 },
  spacing: 8,
  typography: {
    fontFamily: 'Inter, "Segoe UI", Roboto, Arial, sans-serif',
    h4: { fontWeight: 700, fontSize: '1.6rem' },
    h5: { fontWeight: 700, fontSize: '1.3rem' },
    h6: { fontWeight: 700, fontSize: '1.1rem' },
    subtitle1: { fontWeight: 600 },
    body2: { color: '#475569' }
  },
  components: {
    MuiAppBar: { styleOverrides: { root: { boxShadow: '0 1px 10px rgba(15, 23, 42, 0.08)' } } },
    MuiCard: { styleOverrides: { root: { boxShadow: '0 3px 14px rgba(15, 23, 42, 0.08)' } } },
    MuiPaper: { styleOverrides: { root: { boxShadow: '0 2px 12px rgba(15, 23, 42, 0.06)' } } },
    MuiButton: {
      styleOverrides: { root: { borderRadius: 10, textTransform: 'none', fontWeight: 600, minHeight: 40 } },
      defaultProps: { disableElevation: true }
    },
    MuiIconButton: {
      styleOverrides: { root: { minWidth: 40, minHeight: 40 } }
    },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 16 } } },
    MuiDrawer: { styleOverrides: { paper: { borderRight: '1px solid #e2e8f0' } } },
    MuiTextField: { defaultProps: { size: 'small', fullWidth: true } },
    MuiSelect: { defaultProps: { size: 'small', fullWidth: true } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
    MuiTableCell: { styleOverrides: { root: { paddingTop: 10, paddingBottom: 10 } } },
    MuiDialogActions: { styleOverrides: { root: { padding: 12 } } }
  }
});

theme = responsiveFontSizes(theme);

export default theme;
