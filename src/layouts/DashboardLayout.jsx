import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, LogOut, Shield, 
  ChevronRight, Building2, ClipboardList, Home, User
} from 'lucide-react';

const DashboardLayout = ({ userRole, userName, onLogout }) => {
  const navigate = useNavigate();
  const role = userRole || 'user';

  // Definición de menú según rol
  const menuItems = [
    { 
      label: 'Panel General', 
      icon: <LayoutDashboard size={20} />, 
      to: role === 'admin' ? '/admin' : '/user', 
      roles: ['admin', 'user'] 
    },
    { 
      label: 'Gestión Personal', 
      icon: <Users size={20} />, 
      to: '/admin/users', 
      roles: ['admin'] 
    },
    { 
      label: 'Infraestructura', 
      icon: <Building2 size={20} />, 
      to: '/admin/deps', 
      roles: ['admin'] 
    },
    { 
      label: 'Historial', 
      icon: <ClipboardList size={20} />, 
      to: '/admin/history', 
      roles: ['admin'] 
    },
  ];

  const handleLogout = async () => {
    await onLogout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-950 font-sans text-slate-200">
      {/* SIDEBAR */}
      <aside className="w-80 bg-slate-900/50 border-r border-white/5 flex flex-col hidden lg:flex">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white italic tracking-tighter">DOMO<span className="text-blue-500">-</span>PRO</h1>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">Control Center</p>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-3 border border-white/5">
            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
              <User size={20} className="text-blue-400" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Operador</p>
              <p className="text-white font-bold text-sm truncate uppercase italic">{userName || 'Usuario'}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {menuItems.filter(item => item.roles.includes(role)).map((item, idx) => (
            <NavLink 
              key={idx} 
              to={item.to} 
              end={item.to === '/admin' || item.to === '/user'}
              className={({ isActive }) => `
                flex items-center justify-between p-4 rounded-2xl transition-all group
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 translate-x-1' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'}
              `}
            >
              <div className="flex items-center gap-3">
                {item.icon} 
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
              </div>
              <ChevronRight size={14} className={`opacity-50 group-hover:translate-x-1 transition-transform`} />
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-4 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all font-bold text-sm"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Sistema en línea</span>
          </div>
          <div className="flex items-center gap-4">
             <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-500 uppercase tracking-widest">
                {role} mode
             </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;