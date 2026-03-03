import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./lib/supabase";

// Layouts y Auth
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// PÁGINAS (Basado en tu imagen de carpetas)
import AdminDashboard from "./pages/admin/AdminDashboard"; 
import AdminUsers from "./pages/admin/AdminUsers"; // <--- Esta es tu Gestión de Personal
import AdminProperties from "./pages/admin/AdminProperties";
import AdminStats from "./pages/admin/AdminStats";
import UserDashboard from "./pages/user/UserDashboard";

function App() {
  const [session, setSession] = useState(undefined);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      if (initialSession) {
        await fetchProfile(initialSession);
      } else {
        setLoading(false);
      }
    };

    initializeAuth();

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

  const fetchProfile = async (currentSession) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('name, role')
        .eq('id', currentSession.user.id)
        .single();

      setUserProfile(data || { name: currentSession.user.email, role: 'user' });
    } catch (err) {
      console.error("Error:", err);
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
      <p className="text-blue-500 font-bold text-[10px] tracking-widest animate-pulse uppercase">
        Iniciando Protocolos Domo-Pro...
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

          {/* RUTAS DE ADMIN BASADAS EN TU IMAGEN */}
          <Route path="admin" element={
            <ProtectedRoute session={session} userRole={userProfile?.role} allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* GESTIÓN DE PERSONAL / USUARIOS */}
          <Route path="admin/users" element={
            <ProtectedRoute session={session} userRole={userProfile?.role} allowedRoles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          } />

          <Route path="admin/properties" element={
            <ProtectedRoute session={session} userRole={userProfile?.role} allowedRoles={['admin']}>
              <AdminProperties />
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