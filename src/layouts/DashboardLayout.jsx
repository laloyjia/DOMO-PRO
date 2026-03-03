import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Settings, LogOut, 
  Shield, ChevronRight, Home, Building2, BarChart3
} from 'lucide-react';

const DashboardLayout = ({ userRole, userName, onLogout }) => {
  
  const roleNormalizado = userRole?.toLowerCase() || 'user';

  // MENU CONFIGURABLE SINCRONIZADO CON TU ESTRUCTURA DE CARPETAS
  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Panel General', 
      icon: <LayoutDashboard size={20} />, 
      to: roleNormalizado === 'admin' ? '/admin' : '/user',
      roles: ['admin', 'user'] 
    },
    { 
      id: 'users', 
      label: 'Gestión Personal', 
      icon: <Users size={20} />, 
      to: '/admin/users', // Conecta con AdminUsers.jsx
      roles: ['admin'] 
    },
    { 
      id: 'properties', 
      label: 'Propiedades', 
      icon: <Building2 size={20} />, 
      to: '/admin/properties', // Conecta con AdminProperties.jsx
      roles: ['admin'] 
    },
    { 
      id: 'stats', 
      label: 'Estadísticas', 
      icon: <BarChart3 size={20} />, 
      to: '/admin/stats', // Conecta con AdminStats.jsx
      roles: ['admin'] 
    },
    { 
      id: 'config', 
      label: 'Configuración', 
      icon: <Settings size={20} />, 
      to: '/config', 
      roles: ['admin', 'user'] 
    }
  ];

  return (
    <div className="flex h-screen bg-slate-950 font-sans overflow-hidden text-slate-200">
      {/* SIDEBAR - Estilo Blindado */}
      <aside className="w-72 bg-slate-900 flex flex-col border-r border-white/5 shadow-[20px_0_50px_rgba(0,0,0,0.5)] z-20">
        
        {/* Logo & Identidad */}
        <div className="p-8 border-b border-white/5 bg-gradient-to-b from-blue-600/5 to-transparent">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40 ring-1 ring-blue-400/50">
              <Shield className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-white font-black tracking-tighter text-xl leading-none italic uppercase">DOMO-PRO</h1>
              <span className="text-[9px] text-blue-400 font-black uppercase tracking-[0.3em] font-mono">OS v2.5</span>
            </div>
          </div>

          {/* User Badge mejorado */}
          <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-4 border border-white/10 ring-1 ring-inset ring-white/5">
            <p className="text-[9px] text-blue-500/70 font-black uppercase tracking-widest mb-1">Operador Autenticado</p>
            <p className="text-white font-bold text-sm truncate">{userName || 'Sistema'}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-[9px] font-black uppercase">
                Status: {roleNormalizado}
              </span>
            </div>
          </div>
        </div>

        {/* Navegación Inteligente */}
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.filter(item => item.roles.includes(roleNormalizado)).map((item) => (
            <NavLink
              key={item.id}
              to={item.to}
              className={({ isActive }) => `
                w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 translate-x-2' 
                  : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className={`transition-transform group-hover:scale-110 duration-300 ${isActive ? 'text-white' : 'group-hover:text-blue-400'}`}>
                  {item.icon}
                </span>
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
              </div>
              <ChevronRight size={14} className={`transition-all ${isActive ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
            </NavLink>
          ))}
        </nav>

        {/* Footer / Logout */}
        <div className="p-6 border-t border-white/5 bg-slate-900/50">
          <button 
            onClick={onLogout} 
            className="w-full flex items-center gap-3 p-4 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all font-black text-[11px] uppercase group active:scale-95 border border-transparent hover:border-red-500/20"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Desconectar Sistema</span>
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO - Fondo Oscuro Industrial */}
      <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Animación de entrada para el contenido */}
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <Outlet /> 
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;