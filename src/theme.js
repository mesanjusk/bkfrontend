import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2497d3' },
    secondary: { main: '#0f766e' },
    background: { default: '#f6fbff', paper: '#ffffff' },
    text: { primary: '#12263a', secondary: '#5b6b7b' },
    success: { main: '#16a34a' },
    warning: { main: '#d97706' },
    error: { main: '#dc2626' }
  },
  shape: { borderRadius: 18 },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    h4: { fontWeight: 800, letterSpacing: '-0.02em' },
    h5: { fontWeight: 800, letterSpacing: '-0.02em' },
    h6: { fontWeight: 800 },
    button: { textTransform: 'none', fontWeight: 700 }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(180deg, #eef8ff 0%, #f8fbfd 240px, #f6f8fb 100%)'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 22,
          border: '1px solid #d9ebf7',
          boxShadow: '0 12px 30px rgba(36, 151, 211, 0.08)'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 22,
          boxShadow: '0 12px 30px rgba(36, 151, 211, 0.08)'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 14, paddingInline: 16 },
        contained: { boxShadow: 'none' }
      }
    },
    MuiTextField: { defaultProps: { size: 'small', fullWidth: true } },
    MuiFormControl: { defaultProps: { size: 'small', fullWidth: true } },
    MuiChip: { styleOverrides: { root: { fontWeight: 700 } } },
    MuiTabs: { styleOverrides: { indicator: { height: 3, borderRadius: 999 } } }
  }
});

export default theme;
