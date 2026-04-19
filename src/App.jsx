import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LiveProvider } from './context/LiveContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import CategoriesPage from './pages/CategoriesPage';
import StagePage from './pages/StagePage';
import NotificationsPage from './pages/NotificationsPage';
import SystemFlowPage from './pages/SystemFlowPage';
import AdminPage from './pages/AdminPage';
import BudgetPage from './pages/BudgetPage';
import ResponsibilitiesPage from './pages/ResponsibilitiesPage';

function Layout({ children }) {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LiveProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
            <Route path="/students" element={<ProtectedRoute><Layout><StudentsPage /></Layout></ProtectedRoute>} />
            <Route path="/categories" element={<ProtectedRoute><Layout><CategoriesPage /></Layout></ProtectedRoute>} />
            <Route path="/stage" element={<ProtectedRoute><Layout><StagePage /></Layout></ProtectedRoute>} />
            <Route path="/budget" element={<ProtectedRoute><Layout><BudgetPage /></Layout></ProtectedRoute>} />
            <Route path="/responsibilities" element={<ProtectedRoute><Layout><ResponsibilitiesPage /></Layout></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Layout><NotificationsPage /></Layout></ProtectedRoute>} />
            <Route path="/system-flow" element={<ProtectedRoute><Layout><SystemFlowPage /></Layout></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><Layout><AdminPage /></Layout></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </LiveProvider>
    </AuthProvider>
  );
}
