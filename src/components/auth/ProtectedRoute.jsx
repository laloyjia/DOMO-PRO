import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, session, userRole, allowedRoles = [] }) => {
  const location = useLocation();

  // 1. Si todavía no sabemos si hay sesión (App.jsx sigue cargando)
  if (session === undefined) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  // 2. Si definitivamente no hay sesión iniciada
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Si hay sesión pero el rol no es el permitido
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Si es admin intentando entrar a ruta de usuario o viceversa
    return <Navigate to="/" replace />; 
  }

  // 4. Si todo está bien, mostrar el contenido
  return children;
};

export default ProtectedRoute;