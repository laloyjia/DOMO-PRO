import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./lib/supabase";

import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserDashboard from "./pages/user/UserDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminDeps from "./pages/admin/AdminDeps";
import AdminHistory from "./pages/admin/AdminHistory";

function App() {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función única para cargar el perfil del usuario
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, name')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) throw error;
      setUserProfile(data || { role: 'user', name: 'Usuario' });
    } catch (err) {
      console.error("❌ Error recuperando perfil:", err.message);
      setUserProfile({ role: 'user', name: 'Usuario' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Verificar sesión inicial
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      if (initialSession) {
        fetchProfile(initialSession.user.id);
      } else {
        setLoading(false);
      }
    });

    // 2. Escuchar cambios en la autenticación (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      if (currentSession) {
        fetchProfile(currentSession.user.id);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-blue-500 font-black italic tracking-widest animate-pulse">DOMO-PRO LOADING...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Si hay sesión, el login te manda al inicio */}
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/" replace />} />
        
        {/* Rutas Protegidas bajo el Layout */}
        <Route path="/" element={
          <ProtectedRoute session={session} userRole={userProfile?.role}>
            <DashboardLayout 
              userRole={userProfile?.role} 
              userName={userProfile?.name} 
              onLogout={() => supabase.auth.signOut()} 
            />
          </ProtectedRoute>
        }>
          
          {/* Redirección inteligente según ROL */}
          <Route index element={
            userProfile?.role === 'admin' 
              ? <Navigate to="/admin" replace /> 
              : <Navigate to="/user" replace />
          } />

          {/* RUTAS ADMIN */}
          <Route path="admin" element={
            <ProtectedRoute session={session} userRole={userProfile?.role} allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="admin/users" element={
            <ProtectedRoute session={session} userRole={userProfile?.role} allowedRoles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          } />

          <Route path="admin/deps" element={
            <ProtectedRoute session={session} userRole={userProfile?.role} allowedRoles={['admin']}>
              <AdminDeps />
            </ProtectedRoute>
          } />

          <Route path="admin/history" element={
            <ProtectedRoute session={session} userRole={userProfile?.role} allowedRoles={['admin']}>
              <AdminHistory />
            </ProtectedRoute>
          } />

          {/* RUTA USUARIO FINAL */}
          <Route path="user" element={
            <ProtectedRoute session={session} userRole={userProfile?.role} allowedRoles={['user', 'admin']}>
              <UserDashboard />
            </ProtectedRoute>
          } />
        </Route>

        {/* Captura de rutas no encontradas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;