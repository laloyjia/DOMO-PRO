import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./lib/supabase";

// Layouts y Auth
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// PÁGINAS ADMINISTRACIÓN
import AdminDashboard from "./pages/admin/AdminDashboard"; 
import AdminUsers from "./pages/admin/AdminUsers"; 
import AdminDeps from "./pages/admin/AdminDeps";      
import AdminHistory from "./pages/admin/AdminHistory"; 

// PÁGINAS USUARIO
import UserDashboard from "./pages/user/UserDashboard";

function App() {
  const [session, setSession] = useState(undefined);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        if (initialSession) {
          await fetchProfile(initialSession.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error inicializando:", error);
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession);
      if (currentSession) {
        await fetchProfile(currentSession.user.id);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, role')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (err) {
      console.error("Error al obtener perfil:", err);
      // Fallback para evitar bloqueo de UI
      setUserProfile({ name: 'Operador', role: 'user' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setSession(null);
      setUserProfile(null);
    } catch (error) {
      console.error("Error al salir:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <div className="absolute inset-0 m-auto h-8 w-8 bg-blue-500/20 rounded-full animate-pulse"></div>
      </div>
      <p className="text-blue-500 font-black text-[10px] tracking-[0.4em] animate-pulse uppercase italic">
        Sincronizando Terminal Domo-Pro...
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
                userName={userProfile?.name || 'Operador'} 
                userRole={userProfile?.role || 'user'} 
                onLogout={handleLogout} 
              />
            </ProtectedRoute>
          }
        >
          <Route index element={<RoleRedirect role={userProfile?.role} />} />

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

const RoleRedirect = ({ role }) => {
  if (!role) return null;
  return role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/user" replace />;
};

export default App;