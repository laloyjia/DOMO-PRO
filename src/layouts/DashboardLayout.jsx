import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, Shield, ChevronRight, Building2, ClipboardList } from 'lucide-react';

const DashboardLayout = ({ userRole, userName, onLogout }) => {
  const role = userRole || 'user';

  const menuItems = [
    { label: 'Panel General', icon: <LayoutDashboard size={20} />, to: role === 'admin' ? '/admin' : '/user', roles: ['admin', 'user'] },
    { label: 'Gestión Personal', icon: <Users size={20} />, to: '/admin/users', roles: ['admin'] },
    { label: 'Departamentos', icon: <Building2 size={20} />, to: '/admin/deps', roles: ['admin'] },
    { label: 'Registro Actividad', icon: <ClipboardList size={20} />, to: '/admin/history', roles: ['admin'] },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <aside className="w-80 bg-slate-900 flex flex-col shadow-2xl">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center"><Shield size={24} className="text-white" /></div>
            <h2 className="text-white font-black text-xs uppercase tracking-widest italic">Domo-Pro <span className="text-blue-500">OS</span></h2>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Operador</p>
            <p className="text-white font-bold text-sm truncate uppercase tracking-tighter italic">{userName || 'Usuario'}</p>
            <span className="text-emerald-500 text-[10px] font-black uppercase">{role}</span>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {menuItems.filter(item => item.roles.includes(role)).map((item, idx) => (
            <NavLink key={idx} to={item.to} end={item.label === 'Panel General'} className={({ isActive }) => `flex items-center justify-between p-4 rounded-2xl transition-all ${isActive ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 translate-x-1' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <div className="flex items-center gap-3">{item.icon} <span className="font-bold text-sm tracking-tight">{item.label}</span></div>
              <ChevronRight size={14} className="opacity-50" />
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
          <button onClick={onLogout} className="w-full flex items-center gap-3 p-4 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all font-black text-[11px] uppercase cursor-pointer italic"><LogOut size={20} /> Desconectar Terminal</button>
        </div>
      </aside>
      <main className="flex-1 p-12 overflow-y-auto bg-slate-50"><Outlet /></main>
    </div>
  );
};

export default DashboardLayout;