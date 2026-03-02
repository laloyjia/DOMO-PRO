import React from 'react';
import { 
  LayoutDashboard, Users, Settings, LogOut, 
  Shield, ChevronRight 
} from 'lucide-react';

const DashboardLayout = ({ children, userRole, userName, activeTab, setActiveTab, onLogout }) => {
  
  // MENU FILTRADO: Solo Panel, Usuarios y Configuración
  const menuItems = [
    { id: 'stats', label: 'Panel General', icon: <LayoutDashboard size={20} />, roles: ['admin', 'operador', 'visualizador'] },
    { id: 'users', label: 'Gestión Personal', icon: <Users size={20} />, roles: ['admin'] },
    { id: 'config', label: 'Configuración', icon: <Settings size={20} />, roles: ['admin'] }
  ];

  const roleNormalizado = userRole?.toLowerCase() || 'visualizador';

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      <aside className="w-72 bg-slate-900 flex flex-col shadow-2xl z-20">
        <div className="p-8 border-b border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Shield className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-white font-black tracking-tighter text-xl leading-none italic">DOMO-PRO</h1>
              <span className="text-[9px] text-blue-400 font-black uppercase tracking-[0.3em] font-mono">Control System</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/10 to-transparent rounded-2xl p-4 border border-white/10">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1 italic">Sesión Activa</p>
            <p className="text-white font-bold text-sm truncate">{userName || 'Operador'}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-md text-[9px] font-black uppercase">
                {roleNormalizado}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {menuItems.filter(item => item.roles.includes(roleNormalizado)).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group ${
                activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 translate-x-1' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
              </div>
              <ChevronRight size={14} className={`${activeTab === item.id ? 'opacity-100' : 'opacity-0'} transition-all`} />
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/10">
          <button onClick={onLogout} className="w-full flex items-center gap-3 p-4 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all font-black text-[11px] uppercase group active:scale-95">
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Desconectar Nodo</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-700">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;