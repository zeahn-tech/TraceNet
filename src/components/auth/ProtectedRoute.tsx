import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute() {
  const { session, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="animate-spin text-secondary" size={28} />
      </div>
    );
  }
  if (!session) return <Navigate to="/login" replace />;
  return <Outlet />;
}
