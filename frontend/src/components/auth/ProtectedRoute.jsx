import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        // Redirect to their respective dashboard if they don't have access
        if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
        if (user?.role === 'worker') return <Navigate to="/worker/dashboard" replace />;
        if (user?.role === 'employer') return <Navigate to="/employer/dashboard" replace />;
        if (user?.role === 'lawyer') return <Navigate to="/legal/dashboard" replace />;
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
        if (user?.role === 'lawyer') return <Navigate to="/legal/dashboard" replace />;
        if (user?.role === 'ngo') return <Navigate to="/ngo/dashboard" replace />;
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};
