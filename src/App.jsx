import React, { useState, useEffect } from "react";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard"; 
import UserDashboard from "./pages/user/UserDashboard";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("stats");

  useEffect(() => {
    const savedUser = localStorage.getItem('domo_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('domo_user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    if (window.confirm("¿Cerrar terminal de seguridad Domo-Pro?")) {
      localStorage.removeItem('domo_user');
      setUser(null);
      setActiveTab("stats"); // Reset tab para el próximo login
      window.location.reload(); // Limpieza total de caché de estado
    }
  };

  if (loading) return (
    <div className="h-screen w-full bg-slate-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (!user) {
    return <Login onLoginSuccess={(userData) => setUser(userData)} />;
  }

  const role = user.role?.toLowerCase() || 'operador';

  return (
    <DashboardLayout 
      userRole={role}
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      userName={user.name}
      onLogout={handleLogout}
    >
      {role === "admin" ? (
        <AdminDashboard activeTab={activeTab} setActiveTab={setActiveTab} />
      ) : (
        <UserDashboard activeTab={activeTab} />
      )}
    </DashboardLayout>
  );
}

export default App;