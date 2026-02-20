import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireFreelancer = false, requireClient = false }) => {
    const { user, isFreelancer, isClient } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (requireFreelancer && !isFreelancer) return <Navigate to="/client/dashboard" replace />;
    if (requireClient && !isClient) return <Navigate to="/dashboard" replace />;
    return children;
};

export default ProtectedRoute;
