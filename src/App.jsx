import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./lib/supabase";

import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserDashboard from "./pages/user/UserDashboard";

function App() {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    console.log("🔍 Buscando perfil para ID:", userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, name')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) throw error;
      
      console.log("✅ Perfil encontrado en DB:", data);
      setUserProfile(data);
    } catch (err) {
      console.error("❌ Error recuperando perfil:", err);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session: curSession } } = await supabase.auth.getSession();
      setSession(curSession);
      if (curSession) {
        await fetchProfile(curSession.user.id);
      } else {
        setLoading(false);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, curSession) => {
      console.log("🔔 Cambio de Auth:", event);
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

  if (loading) return <div className="h-screen w-full bg-slate-950 flex items-center justify-center text-blue-500 font-black italic">DOMO-PRO LOADING...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/" replace />} />
        
        <Route path="/" element={
          <ProtectedRoute session={session} userRole={userProfile?.role}>
            <DashboardLayout userRole={userProfile?.role} userName={userProfile?.name} onLogout={() => supabase.auth.signOut()} />
          </ProtectedRoute>
        }>
          {/* Aquí forzamos la dirección. Si no es 'admin', va a 'user' */}
          <Route index element={
            userProfile?.role === 'admin' 
              ? <Navigate to="/admin" replace /> 
              : <Navigate to="/user" replace />
          } />

          <Route path="admin" element={
            <ProtectedRoute session={session} userRole={userProfile?.role} allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="user" element={
            <ProtectedRoute session={session} userRole={userProfile?.role} allowedRoles={['user', 'admin']}>
              <UserDashboard />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;