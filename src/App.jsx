import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { LiveProvider } from './context/LiveContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/AppShell';
import AppUpdatePrompt from './components/pwa/AppUpdatePrompt';
import theme from './theme';
import { MODULE_PERMISSIONS } from './utils/accessControl';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import CategoriesPage from './pages/CategoriesPage';
import StagePage from './pages/StagePage';
import BudgetPage from './pages/BudgetPage';
import ResponsibilitiesPage from './pages/ResponsibilitiesPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminPage from './pages/AdminPage';
import WhatsAppPage from './pages/WhatsAppPage';
import SuperAdminSettingsPage from './pages/SuperAdminSettingsPage';       // ← NEW
import PublicStudentFormPage from './pages/PublicStudentFormPage';
import PublicVolunteerFormPage from './pages/PublicVolunteerFormPage';

function Layout({ children }) {
  return <AppShell>{children}</AppShell>;
}

const protectedPages = [
  ['/',                  <DashboardPage />,         MODULE_PERMISSIONS.dashboard],
  ['/students',          <StudentsPage />,           MODULE_PERMISSIONS.students],
  ['/categories',        <CategoriesPage />,         MODULE_PERMISSIONS.categories],
  ['/stage',             <StagePage />,              MODULE_PERMISSIONS.stage],
  ['/budget',            <BudgetPage />,             MODULE_PERMISSIONS.budget],
  ['/responsibilities',  <ResponsibilitiesPage />,   MODULE_PERMISSIONS.responsibilities],
  ['/notifications',     <NotificationsPage />,      MODULE_PERMISSIONS.notifications],
  ['/admin',             <AdminPage />,              MODULE_PERMISSIONS.admin],
  ['/whatsapp',          <WhatsAppPage />,           MODULE_PERMISSIONS.whatsapp],
  ['/super-admin/settings', <SuperAdminSettingsPage />, MODULE_PERMISSIONS.superAdminSettings],  // ← NEW
];

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
              <Route path="/volunteer-register" element={<PublicVolunteerFormPage />} />
              {protectedPages.map(([path, page, permission]) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    <ProtectedRoute permission={permission}>
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
