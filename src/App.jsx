import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./lib/supabase";

import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard"; 
import AdminUsers from "./pages/admin/AdminUsers"; 
import AdminDeps from "./pages/admin/AdminDeps";      
import AdminHistory from "./pages/admin/AdminHistory"; 
import UserDashboard from "./pages/user/UserDashboard";

function App() {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TEMPORIZADOR DE SEGURIDAD: Si en 5 segundos no hay respuesta, forzar stop loading
    const timer = setTimeout(() => {
      if (loading) setLoading(false);
    }, 5000);

    const initialize = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        if (initialSession) {
          const { data } = await supabase.from('profiles').select('name, role').eq('id', initialSession.user.id).single();
          setUserProfile(data || { name: initialSession.user.email, role: 'user' });
        }
      } catch (e) {
        console.error("Error en arranque:", e);
      } finally {
        setLoading(false);
        clearTimeout(timer);
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      if (!currentSession) {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setSession(null);
    setUserProfile(null);
    setLoading(false);
  };

  if (loading) return (
    <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-blue-500 mb-4"></div>
      <p className="text-blue-500 font-black text-[10px] tracking-[0.4em] animate-pulse italic uppercase">
        Sincronizando Terminal Domo-Pro...
      </p>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/" element={
          <ProtectedRoute session={session} userRole={userProfile?.role}>
            <DashboardLayout userName={userProfile?.name} userRole={userProfile?.role} onLogout={handleLogout} />
          </ProtectedRoute>
        }>
          <Route index element={userProfile?.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/user" />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/users" element={<AdminUsers />} />
          <Route path="admin/deps" element={<AdminDeps />} />
          <Route path="admin/history" element={<AdminHistory />} />
          <Route path="user" element={<UserDashboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;