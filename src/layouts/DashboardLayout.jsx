import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Settings, LogOut, 
  Shield, ChevronRight, Home
} from 'lucide-react';

const DashboardLayout = ({ userRole, userName, onLogout }) => {
  
  const roleNormalizado = userRole?.toLowerCase() || 'user';

  // MENU CONFIGURABLE: Ahora usamos 'to' para las rutas reales
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
      to: '/admin/users', // Ejemplo de subruta
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
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-900 flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.3)] z-20">
        
        {/* Logo & Identidad */}
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40">
              <Shield className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-white font-black tracking-tighter text-xl leading-none italic uppercase">DOMO-PRO</h1>
              <span className="text-[9px] text-blue-400 font-black uppercase tracking-[0.3em] font-mono">OS v2.5</span>
            </div>
          </div>

          {/* User Badge mejorado */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Operador Autenticado</p>
            <p className="text-white font-bold text-sm truncate">{userName || 'Sistema'}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-[9px] font-black uppercase">
                Terminal: {roleNormalizado}
              </span>
            </div>
          </div>
        </div>

        {/* Navegación con NavLink (detecta automáticamente la ruta activa) */}
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.filter(item => item.roles.includes(roleNormalizado)).map((item) => (
            <NavLink
              key={item.id}
              to={item.to}
              className={({ isActive }) => `
                w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 translate-x-1' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className="transition-transform group-hover:scale-110 duration-300">
                  {item.icon}
                </span>
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
              </div>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
            </NavLink>
          ))}
        </nav>

        {/* Footer / Logout */}
        <div className="p-6 border-t border-white/5">
          <button 
            onClick={onLogout} 
            className="w-full flex items-center gap-3 p-4 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all font-black text-[11px] uppercase group active:scale-95"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Cerrar Conexión</span>
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Outlet es donde React Router renderiza el componente de la ruta activa */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Outlet /> 
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;