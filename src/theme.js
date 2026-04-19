import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#155eef' },
    secondary: { main: '#0f766e' },
    background: { default: '#f5f7fb', paper: '#ffffff' },
    success: { main: '#16a34a' },
    warning: { main: '#d97706' },
    error: { main: '#dc2626' }
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 }
  },
  components: {
    MuiCard: { styleOverrides: { root: { boxShadow: '0 8px 28px rgba(16,24,40,0.08)' } } },
    MuiPaper: { styleOverrides: { root: { boxShadow: '0 8px 28px rgba(16,24,40,0.08)' } } },
    MuiButton: { styleOverrides: { root: { borderRadius: 12, textTransform: 'none', fontWeight: 700 } } },
    MuiTextField: { defaultProps: { size: 'small', fullWidth: true } },
    MuiFormControl: { defaultProps: { size: 'small', fullWidth: true } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } }
  }
});

export default theme;
