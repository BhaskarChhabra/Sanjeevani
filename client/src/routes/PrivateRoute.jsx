import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const PrivateRoute = () => {
    const { isAuthenticated } = useAuthStore(state => state);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />; // Render nested protected routes
};

export default PrivateRoute;
