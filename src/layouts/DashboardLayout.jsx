import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Settings, LogOut, 
  Shield, ChevronRight, Building2, ClipboardList
} from 'lucide-react';

const DashboardLayout = ({ userRole, userName, onLogout }) => {
  const roleNormalizado = userRole?.toLowerCase() || 'user';

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
      to: '/admin/users',
      roles: ['admin'] 
    },
    { 
      id: 'deps', 
      label: 'Departamentos', 
      icon: <Building2 size={20} />, 
      to: '/admin/deps', 
      roles: ['admin'] 
    },
    { 
      id: 'history', 
      label: 'Registro Actividad', 
      icon: <ClipboardList size={20} />, 
      to: '/admin/history', 
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
      <aside className="w-72 bg-slate-900 flex flex-col border-r border-white/5 shadow-2xl z-20">
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

          <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <p className="text-[9px] text-blue-500/70 font-black uppercase tracking-widest mb-1 italic">Operador:</p>
            <p className="text-white font-bold text-sm truncate">{userName}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-[9px] font-black uppercase tracking-tighter">
                {roleNormalizado} Mode
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
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
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <span className={`transition-transform duration-300 ${isActive ? 'text-white' : 'group-hover:text-blue-400'}`}>
                      {item.icon}
                    </span>
                    <span className="font-bold text-sm tracking-tight">{item.label}</span>
                  </div>
                  <ChevronRight size={14} className={`transition-all ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 bg-slate-900/50">
          <button 
            type="button"
            onClick={onLogout} 
            className="w-full flex items-center gap-3 p-4 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all font-black text-[11px] uppercase group cursor-pointer active:scale-95"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Desconectar Terminal</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-slate-950">
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;