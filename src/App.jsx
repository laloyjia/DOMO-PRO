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
    // 1. Temporizador de seguridad (5 segundos máximo de carga)
    const failsafe = setTimeout(() => {
      if (loading) setLoading(false);
    }, 5000);

    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);

        if (currentSession) {
          const { data } = await supabase
            .from('profiles')
            .select('name, role')
            .eq('id', currentSession.user.id)
            .single();
          
          setUserProfile(data || { name: currentSession.user.email, role: 'user' });
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        setLoading(false);
        clearTimeout(failsafe);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      if (!currentSession) {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
      clearTimeout(failsafe);
    };
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    localStorage.removeItem('domo_role');
    setSession(null);
    setUserProfile(null);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-blue-500 mb-4"></div>
        <p className="text-blue-500 font-black text-[10px] tracking-[0.4em] animate-pulse uppercase italic">
          Sincronizando Terminal Domo-Pro...
        </p>
      </div>
    );
  }

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