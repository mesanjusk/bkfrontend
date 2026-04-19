import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LiveProvider } from './context/LiveContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/AppShell';
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
import PublicStudentRegistrationPage from './pages/PublicStudentRegistrationPage';
import PublicStudentEditPage from './pages/PublicStudentEditPage';

function Layout({ children }) {
  return <AppShell>{children}</AppShell>;
}

export default function App() {
  return (
    <AuthProvider>
      <LiveProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/student-register" element={<PublicStudentRegistrationPage />} />
            <Route path="/student-edit/:token" element={<PublicStudentEditPage />} />

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
        </BrowserRouter>
      </LiveProvider>
    </AuthProvider>
  );
}