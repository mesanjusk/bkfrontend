import { CircularProgress, Stack } from '@mui/material';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Stack minHeight="100vh" justifyContent="center" alignItems="center"><CircularProgress /></Stack>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
