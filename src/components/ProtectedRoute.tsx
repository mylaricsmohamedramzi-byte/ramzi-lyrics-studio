import { Navigate, Outlet } from 'react-router-dom';
import { useGuestAuth } from '@/hooks/useGuestAuth';

export default function ProtectedRoute() {
  const { user, profile, loading } = useGuestAuth();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  if (loading) return null;

  if (!isLoggedIn || !user || !profile) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
