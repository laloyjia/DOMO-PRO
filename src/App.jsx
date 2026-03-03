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
  const [session, setSession] = useState(undefined); // Empezamos en undefined para diferenciar de "no hay sesión"
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      try {
        setSession(currentSession);
        
        if (currentSession) {
          const { data, error } = await supabase
            .from('profiles')
            .select('name, role')
            .eq('id', currentSession.user.id)
            .single();

          if (error) {
            console.warn("⚠️ Perfil no encontrado, usando valores por defecto");
            setUserProfile({ name: currentSession.user.email, role: 'user' });
          } else {
            setUserProfile(data);
          }
        } else {
          setUserProfile(null);
        }
      } catch (err) {
        console.error("❌ Error crítico en Auth:", err);
      } finally {
        setLoading(false); // Detiene la pantalla de carga industrial
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

        {/* RUTAS PROTEGIDAS ANIDADAS */}
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
          {/* Redirección inicial basada en rol */}
          <Route index element={<RoleRedirect role={userProfile?.role} />} />

          {/* Panel de Administración */}
          <Route path="admin" element={
            <ProtectedRoute session={session} userRole={userProfile?.role} allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Panel de Usuario/Operador */}
          <Route path="user" element={
            <ProtectedRoute session={session} userRole={userProfile?.role} allowedRoles={['user', 'admin']}>
              <UserDashboard />
            </ProtectedRoute>
          } />
        </Route>

        {/* Captura de rutas no encontradas */}
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