import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, session, userRole, allowedRoles = [] }) => {
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si la ruta requiere un rol específico y el rol aún no carga
  if (allowedRoles.length > 0 && !userRole) {
    return null; // El App.jsx ya muestra el loading
  }

  // Verificación de permisos
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />; 
  }

  return children;
};

export default ProtectedRoute;