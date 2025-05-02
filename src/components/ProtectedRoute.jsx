import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, adminRequired = false }) {
  const { user, userRole, loading } = useAuth();
  
  // Добавете тези логове
  console.log('ProtectedRoute - проверка:', {
    user: user ? true : false,
    userRole,
    adminRequired,
    hasAdminRights: userRole && (userRole.role === 'super_admin' || userRole.role === 'restaurant_admin')
  });
  
  if (loading) {
    return <div>Зареждане...</div>;
  }
  
  if (!user) {
    console.log('ProtectedRoute - няма потребител, пренасочване към /login');
    return <Navigate to="/login" />;
  }
  
  if (adminRequired) {
    const hasAdminRights = userRole && (userRole.role === 'super_admin' || userRole.role === 'restaurant_admin');
    console.log('ProtectedRoute - проверка за админ права:', hasAdminRights);
    
    if (!hasAdminRights) {
      console.log('ProtectedRoute - няма админ права, пренасочване към /');
      return <Navigate to="/" />;
    }
  }
  
  return children;
}

export default ProtectedRoute;