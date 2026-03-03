import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, session, userRole, allowedRoles = [] }) => {
  const location = useLocation();

  // Si App.jsx está determinando la sesión, no hacemos nada (App.jsx muestra el loading)
  if (session === undefined) return null;

  // Si no hay sesión, al login
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si hay sesión pero aún no carga el rol (perfil), esperamos
  if (allowedRoles.length > 0 && !userRole) {
    return null;
  }

  // Si el rol no está permitido para esta ruta
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />; 
  }

  return children;
};

export default ProtectedRoute;