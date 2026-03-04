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

  useEffect(() => {
    // Failsafe: Si en 6 segundos no carga, forzamos salida del loading
    const timer = setTimeout(() => setLoading(false), 6000);

    const getInitialSession = async () => {
      const { data: { session: curSession } } = await supabase.auth.getSession();
      setSession(curSession);
      
      if (curSession) {
        const { data } = await supabase
          .from('profiles')
          .select('role, name')
          .eq('id', curSession.user.id)
          .single();
        setUserProfile(data);
      }
      setLoading(false);
      clearTimeout(timer);
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) setUserProfile(null);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  if (loading) return (
    <div className="h-screen w-full bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.5em]">System Loading</p>
      </div>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/" replace />} />
        
        <Route path="/" element={
          <ProtectedRoute session={session}>
            <DashboardLayout userRole={userProfile?.role} />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to={userProfile?.role === 'admin' ? "/admin" : "/user"} replace />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="user" element={<UserDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;