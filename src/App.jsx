import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { LiveProvider } from './context/LiveContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/AppShell';
import AppUpdatePrompt from './components/pwa/AppUpdatePrompt';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import CategoriesPage from './pages/CategoriesPage';
import StagePage from './pages/StagePage';
import BudgetPage from './pages/BudgetPage';
import ResponsibilitiesPage from './pages/ResponsibilitiesPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminPage from './pages/AdminPage';
import SystemFlowPage from './pages/SystemFlowPage';
import WhatsAppPage from './pages/WhatsAppPage';
import PublicStudentFormPage from './pages/PublicStudentFormPage';

const theme = createTheme({
  palette: {
    primary: { main: '#1a1a1a' },
    background: { default: '#f8f9fa', paper: '#ffffff' },
    text: { primary: '#2d3436', secondary: '#636e72' }
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h5: { fontWeight: 800, letterSpacing: '-0.5px' },
    button: { textTransform: 'none', fontWeight: 600 }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { padding: '10px 20px', boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
        contained: { borderRadius: '10px' }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          border: '1px solid #edf2f7',
          borderRadius: '16px'
        }
      }
    },
    MuiTextField: {
      defaultProps: { variant: 'filled', InputProps: { disableUnderline: true } },
      styleOverrides: {
        root: {
          '& .MuiFilledInput-root': {
            backgroundColor: '#f1f3f5',
            borderRadius: '10px',
            '&:hover': { backgroundColor: '#e9ecef' },
            '&.Mui-focused': { backgroundColor: '#e9ecef' }
          }
        }
      }
    }
  }
});

function Layout({ children }) {
  return <AppShell>{children}</AppShell>;
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <LiveProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/student-register" element={<PublicStudentFormPage />} />
              <Route path="/student-edit/:token" element={<PublicStudentFormPage />} />

              {[
                ['/', <DashboardPage />],
                ['/students', <StudentsPage />],
                ['/categories', <CategoriesPage />],
                ['/stage', <StagePage />],
                ['/budget', <BudgetPage />],
                ['/responsibilities', <ResponsibilitiesPage />],
                ['/notifications', <NotificationsPage />],
                ['/admin', <AdminPage />],
                ['/system-flow', <SystemFlowPage />],
                ['/whatsapp', <WhatsAppPage />]
              ].map(([path, page]) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    <ProtectedRoute>
                      <Layout>{page}</Layout>
                    </ProtectedRoute>
                  }
                />
              ))}
            </Routes>
            <AppUpdatePrompt />
          </BrowserRouter>
        </LiveProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
