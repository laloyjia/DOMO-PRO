import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./lib/supabase";

// Componentes y Páginas
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard"; 
import UserDashboard from "./pages/user/UserDashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// IMPORTA TU PÁGINA DE PERSONAL AQUÍ (Ajusta la ruta si es necesario)
import GestionPersonal from "./pages/admin/GestionPersonal"; 

function App() {
  const [session, setSession] = useState(undefined);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificación inicial inmediata al recargar
    const initializeAuth = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      if (initialSession) {
        await fetchProfile(initialSession);
      } else {
        setLoading(false);
      }
    };

    initializeAuth();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession);
      if (currentSession) {
        await fetchProfile(currentSession);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Función auxiliar para no repetir código
  const fetchProfile = async (currentSession) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, role')
        .eq('id', currentSession.user.id)
        .single();

      if (error) {
        setUserProfile({ name: currentSession.user.email, role: 'user' });
      } else {
        setUserProfile(data);
      }
    } catch (err) {
      console.error("Error al cargar perfil:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (loading) return (
    <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center space-y-4">
      <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-500"></div>
      <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">
        Sincronizando Domo-Pro OS...
      </p>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/" replace />} />

        <Route
          path="/"
          element={
            <ProtectedRoute session={session} userRole={userProfile?.role}>
              <DashboardLayout 
                userName={userProfile?.name || 'Usuario'} 
                userRole={userProfile?.role || 'user'} 
                onLogout={handleLogout} 
              />
            </ProtectedRoute>
          }
        >
          <Route index element={<RoleRedirect role={userProfile?.role} />} />

          {/* RUTAS DE ADMINISTRADOR */}
          <Route path="admin" element={
            <ProtectedRoute session={session} userRole={userProfile?.role} allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* NUEVA RUTA: GESTIÓN DE PERSONAL */}
          <Route path="admin/personal" element={
            <ProtectedRoute session={session} userRole={userProfile?.role} allowedRoles={['admin']}>
              <GestionPersonal />
            </ProtectedRoute>
          } />

          <Route path="user" element={
            <ProtectedRoute session={session} userRole={userProfile?.role} allowedRoles={['user', 'admin']}>
              <UserDashboard />
            </ProtectedRoute>
          } />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

const RoleRedirect = ({ role }) => {
  if (!role) return null;
  return role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/user" replace />;
};

export default App;