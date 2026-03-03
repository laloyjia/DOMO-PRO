import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./lib/supabase";

// Componentes y Páginas
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard"; 
import UserDashboard from "./pages/user/UserDashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      
      if (session) {
        // Si hay sesión, buscamos el perfil para tener el nombre y el rol
        const { data } = await supabase
          .from('profiles')
          .select('name, role')
          .eq('id', session.user.id)
          .single();
        setUserProfile(data);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (loading) return (
    <div className="h-screen w-full bg-slate-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
    </div>
  );

  return (
    <Router>
      <Routes>
        {/* RUTA PÚBLICA */}
        <Route 
          path="/login" 
          element={!session ? <Login /> : <Navigate to="/" replace />} 
        />

        {/* RUTAS PROTEGIDAS (Anidadas dentro del Layout) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout 
                userName={userProfile?.name} 
                userRole={userProfile?.role} 
                onLogout={handleLogout} 
              />
            </ProtectedRoute>
          }
        >
          {/* Redirección automática según rol al entrar a "/" */}
          <Route index element={<RoleRedirect role={userProfile?.role} />} />

          {/* Rutas de Administrador */}
          <Route path="admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Rutas de Usuario */}
          <Route path="user" element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <UserDashboard />
            </ProtectedRoute>
          } />
          
          {/* Aquí puedes añadir más como path="config" o path="admin/users" */}
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

// Auxiliar para redirigir al entrar a la raíz
const RoleRedirect = ({ role }) => {
  if (!role) return null;
  return role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/user" replace />;
};

export default App;