import React from "react";
import AdminUsers from "./AdminUsers.jsx";
import AdminStats from "./AdminStats.jsx";

const AdminDashboard = ({ activeTab, setActiveTab }) => {
  
  const renderContent = () => {
    switch (activeTab) {
      case 'stats':
        return <AdminStats />;
      
      case 'users':
        return <AdminUsers />;
      
      case 'config':
        return (
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm text-center">
            <h2 className="text-xl font-black text-slate-900 uppercase italic">Configuración del Sistema</h2>
            <p className="text-xs text-slate-400 mt-2 uppercase font-bold tracking-widest italic">Módulo en mantenimiento preventivo</p>
          </div>
        );
      
      default:
        // Por defecto, si algo falla, mostramos el Panel de Control (Stats)
        return <AdminStats />;
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-150px)]">
      <div className="animate-in fade-in slide-in-from-bottom-3 duration-700">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;