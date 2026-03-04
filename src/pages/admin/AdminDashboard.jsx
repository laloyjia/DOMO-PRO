import React from "react";
import AdminStats from "./AdminStats.jsx";

const AdminDashboard = () => {
  return (
    <div className="w-full min-h-[calc(100vh-150px)]">
      <div className="mb-8 animate-in fade-in slide-in-from-left-4 duration-500">
        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">
          Panel de <span className="text-blue-500">Control</span>
        </h1>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mt-2">
          Estado del Sistema Domo-Pro
        </p>
      </div>
      
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
        <AdminStats />
      </div>
    </div>
  );
};

export default AdminDashboard;