import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, userInfo, isLoadingUser } = useAuth();
  const location = useLocation();

  // if user is not logged in, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // if userInfo is loading, show loading state
  if (isLoadingUser) {
    return <div className="flex items-center justify-center h-screen bg-white">Loading user data...</div>;
  }

  if (requiredRole && userInfo && userInfo.role !== requiredRole) {
    return <Navigate to="/app/home" replace />;
  }

  return children;
};

export default ProtectedRoute;