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
    // 1. Escuchar cambios de autenticación con manejo de errores robusto
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      try {
        setSession(currentSession);
        
        if (currentSession) {
          // Si hay sesión, buscamos el perfil
          const { data, error } = await supabase
            .from('profiles')
            .select('name, role')
            .eq('id', currentSession.user.id)
            .single();

          if (error) {
            console.warn("⚠️ Perfil no encontrado en la tabla 'profiles':", error.message);
            // Si no hay perfil, creamos un estado temporal para evitar el bloqueo
            setUserProfile({ name: currentSession.user.email, role: 'user' });
          } else {
            setUserProfile(data);
          }
        } else {
          setUserProfile(null);
        }
      } catch (err) {
        console.error("❌ Error crítico en el flujo de Auth:", err);
      } finally {
        // ELIMINA EL CARGA INFINITO: Siempre termina el loading
        setLoading(false);
      }
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('domo_role');
      window.location.href = "/login";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Pantalla de carga industrial estilo Domo-Pro
  if (loading) return (
    <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center space-y-4">
      <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
      <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">
        Iniciando Protocolos Domo-Pro...
      </p>
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

        {/* RUTAS PROTEGIDAS */}
        <Route
          path="/"
          element={
            <ProtectedRoute session={session}>
              <DashboardLayout 
                userName={userProfile?.name || 'Usuario'} 
                userRole={userProfile?.role || 'user'} 
                onLogout={handleLogout} 
              />
            </ProtectedRoute>
          }
        >
          {/* Redirección automática según rol */}
          <Route index element={<RoleRedirect role={userProfile?.role} />} />

          {/* Rutas de Administrador */}
          <Route path="admin" element={
            <ProtectedRoute session={session} allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Rutas de Usuario */}
          <Route path="user" element={
            <ProtectedRoute session={session} allowedRoles={['user', 'admin']}>
              <UserDashboard />
            </ProtectedRoute>
          } />
        </Route>

        {/* Fallback general */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

// Componente auxiliar de redirección
const RoleRedirect = ({ role }) => {
  if (!role) return <div className="p-10 text-white">Cargando permisos...</div>;
  return role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/user" replace />;
};

export default App;