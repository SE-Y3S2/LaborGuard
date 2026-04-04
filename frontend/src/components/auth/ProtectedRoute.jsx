import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

// FIX: Role name mismatch — backend uses 'legal_officer', frontend was using 'lawyer'.
// Resolution strategy: the frontend stores the role exactly as returned by the backend JWT.
// The backend auth-service issues JWTs with role = 'legal_officer' for lawyers.
// Therefore ALL frontend role checks must use 'legal_officer', not 'lawyer'.
//
// Changes made:
//   - ProtectedRoute allowedRoles checks: 'lawyer' → 'legal_officer'
//   - PublicRoute redirect checks: 'lawyer' → 'legal_officer'
//   - App.jsx must also be updated (see App.jsx fix)

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to their respective dashboard based on actual role
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'worker') return <Navigate to="/worker/dashboard" replace />;
    if (user?.role === 'employer') return <Navigate to="/employer/dashboard" replace />;
    if (user?.role === 'legal_officer') return <Navigate to="/legal/dashboard" replace />;
    if (user?.role === 'ngo') return <Navigate to="/ngo/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export const PublicRoute = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'worker') return <Navigate to="/worker/dashboard" replace />;
    if (user?.role === 'employer') return <Navigate to="/employer/dashboard" replace />;
    if (user?.role === 'legal_officer') return <Navigate to="/legal/dashboard" replace />;
    if (user?.role === 'ngo') return <Navigate to="/ngo/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
