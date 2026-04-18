import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullPage />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    const dashPath = user.role === 'admin' ? '/dashboard/admin'
      : user.role === 'tutor' ? '/dashboard/tutor'
      : '/dashboard/student';
    return <Navigate to={dashPath} replace />;
  }
  return children;
}
