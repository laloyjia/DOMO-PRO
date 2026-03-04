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

  // Función optimizada para obtener el perfil sin romper el sistema
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, name')
        .eq('id', userId)
        .maybeSingle(); // Clave: No arroja error si no encuentra la fila

      if (error) throw error;
      setUserProfile(data);
    } catch (err) {
      console.error("Error recuperando perfil:", err);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const { data: { session: curSession } } = await supabase.auth.getSession();
      setSession(curSession);
      if (curSession) {
        await fetchProfile(curSession.user.id);
      } else {
        setLoading(false);
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, curSession) => {
      setSession(curSession);
      if (curSession) {
        await fetchProfile(curSession.user.id);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return (
    <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center font-sans">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-blue-500 font-black text-[10px] tracking-[0.5em] uppercase animate-pulse">Sincronizando Domo-Pro OS</p>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/" replace />} />
        
        <Route path="/" element={
          <ProtectedRoute session={session} userRole={userProfile?.role}>
            <DashboardLayout userRole={userProfile?.role} userName={userProfile?.name} onLogout={() => supabase.auth.signOut()} />
          </ProtectedRoute>
        }>
          {/* Redirección inteligente basada en la existencia real del rol */}
          <Route index element={
            userProfile?.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/user" replace />
          } />

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

export default App;