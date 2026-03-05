import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Home, Building2, Cpu, Plus, X, Check, Loader2, 
  Settings2, Power, Trash2, Zap, User, 
  Activity, PlusCircle, Layout, Lightbulb, ShieldCheck
} from 'lucide-react';

const AdminStats = () => {
  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(null); 
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({ casas: 0, habs: 0, devs: 0 });
  const [parentId, setParentId] = useState({ casa: null, hab: null });

  const [formCasa, setFormCasa] = useState({ name: '', owner_id: '', address: '', consumption_limit: 100, category: 'Residencial' });
  const [formHab, setFormHab] = useState({ name: '', type: 'Salón' });
  const [formDev, setFormDev] = useState({ name: '', type: 'Iluminación', consumption_base: 5 });

  useEffect(() => { 
    fetchFullHierarchy(); 
    fetchUsers(); 
  }, []);

  const fetchUsers = async () => {
    const { data: userData } = await supabase
      .from('profiles')
      .select('id, name, email')
      .order('name');
    setUsers(userData || []);
  };

  const fetchFullHierarchy = async () => {
    setLoading(true);
    try {
      // 1. Traer Casas
      const { data: casas } = await supabase.from('properties').select('*').order('created_at');
      // 2. Traer Habitaciones
      const { data: habs } = await supabase.from('rooms').select('*').order('created_at');
      // 3. Traer Dispositivos
      const { data: devs } = await supabase.from('devices').select('*').order('created_at');

      const fullData = (casas || []).map(casa => ({
        ...casa,
        rooms: (habs || []).filter(h => h.property_id === casa.id).map(room => ({
          ...room,
          devices: (devs || []).filter(d => d.room_id === room.id)
        }))
      }));

      setData(fullData);
      setStats({
        casas: casas?.length || 0,
        habs: habs?.length || 0,
        devs: devs?.length || 0
      });
    } catch (err) {
      console.error("Error cargando jerarquía:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCasa = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from('properties').insert([formCasa]);
    if (!error) {
      setShowModal(null);
      fetchFullHierarchy();
      setFormCasa({ name: '', owner_id: '', address: '', consumption_limit: 100, category: 'Residencial' });
    }
    setSubmitting(false);
  };

  const handleCreateHab = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from('rooms').insert([{ ...formHab, property_id: parentId.casa }]);
    if (!error) {
      setShowModal(null);
      fetchFullHierarchy();
    }
    setSubmitting(false);
  };

  const handleCreateDev = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from('devices').insert([{ 
      ...formDev, 
      room_id: parentId.hab, 
      status: false,
      last_activity: new Date().toISOString()
    }]);
    if (!error) {
      setShowModal(null);
      fetchFullHierarchy();
    }
    setSubmitting(false);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <Loader2 className="animate-spin text-blue-500" size={40} />
      <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Sincronizando Infraestructura...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Propiedades', val: stats.casas, icon: <Home className="text-blue-500" />, bg: 'bg-blue-500/10' },
          { label: 'Dependencias', val: stats.habs, icon: <Layout className="text-emerald-500" />, bg: 'bg-emerald-500/10' },
          { label: 'Nodos Activos', val: stats.devs, icon: <Cpu className="text-purple-500" />, bg: 'bg-purple-500/10' }
        ].map((kpi, i) => (
          <div key={i} className="bg-slate-900 border border-white/5 p-6 rounded-[2rem] shadow-xl">
            <div className={`${kpi.bg} w-12 h-12 rounded-2xl flex items-center justify-center mb-4`}>{kpi.icon}</div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{kpi.label}</p>
            <p className="text-3xl font-black text-white italic">{kpi.val}</p>
          </div>
        ))}
      </div>

      {/* ARBOL DE ESTRUCTURA */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Estructura del <span className="text-blue-500">Sistema</span></h3>
          <button onClick={() => setShowModal('casa')} className="bg-white text-black px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all">
            + Nueva Propiedad
          </button>
        </div>

        {data.map(casa => (
          <div key={casa.id} className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden">
            <div className="p-6 flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400"><Home size={24}/></div>
                <div>
                  <h4 className="font-black text-white uppercase text-sm tracking-tight">{casa.name}</h4>
                  <p className="text-slate-500 text-[10px] font-bold uppercase">{casa.address}</p>
                </div>
              </div>
              <button onClick={() => { setParentId({ ...parentId, casa: casa.id }); setShowModal('hab'); }} className="p-2 text-slate-400 hover:text-white"><PlusCircle size={20}/></button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {casa.rooms.map(room => (
                <div key={room.id} className="bg-slate-800/40 border border-white/5 rounded-[2rem] p-5">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{room.type}</span>
                    <button onClick={() => { setParentId({ ...parentId, hab: room.id }); setShowModal('dev'); }} className="text-slate-500 hover:text-white"><Plus size={16}/></button>
                  </div>
                  <h5 className="font-bold text-slate-200 uppercase text-xs mb-4">{room.name}</h5>
                  
                  <div className="space-y-2">
                    {room.devices.map(dev => (
                      <div key={dev.id} className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${dev.status ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`} />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{dev.name}</span>
                        </div>
                        <span className="text-[9px] font-black text-slate-600 uppercase">{dev.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL UNIFICADO */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-[#1e293b] w-full max-w-md rounded-[2.5rem] border border-white/10 p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-white uppercase italic italic">Configurar <span className="text-blue-500">{showModal}</span></h3>
              <button onClick={() => setShowModal(null)} className="text-slate-500 hover:text-white"><X /></button>
            </div>

            <form onSubmit={showModal === 'casa' ? handleCreateCasa : showModal === 'hab' ? handleCreateHab : handleCreateDev} className="space-y-5">
              {showModal === 'casa' && (
                <>
                  <input required placeholder="Nombre Propiedad" className="w-full bg-slate-900 border border-white/5 p-4 rounded-xl text-white font-bold" value={formCasa.name} onChange={e => setFormCasa({...formCasa, name: e.target.value})} />
                  <select required className="w-full bg-slate-900 border border-white/5 p-4 rounded-xl text-white font-bold" value={formCasa.owner_id} onChange={e => setFormCasa({...formCasa, owner_id: e.target.value})}>
                    <option value="">Seleccionar Dueño</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                  </select>
                  <input placeholder="Dirección Física" className="w-full bg-slate-900 border border-white/5 p-4 rounded-xl text-white font-bold" value={formCasa.address} onChange={e => setFormCasa({...formCasa, address: e.target.value})} />
                </>
              )}

              {showModal === 'hab' && (
                <>
                  <input required placeholder="Nombre Dependencia (Ej: Living)" className="w-full bg-slate-900 border border-white/5 p-4 rounded-xl text-white font-bold" value={formHab.name} onChange={e => setFormHab({...formHab, name: e.target.value})} />
                  <select className="w-full bg-slate-900 border border-white/5 p-4 rounded-xl text-white font-bold" value={formHab.type} onChange={e => setFormHab({...formHab, type: e.target.value})}>
                    <option>Salón</option><option>Cocina</option><option>Habitación</option><option>Exterior</option><option>Laboratorio</option>
                  </select>
                </>
              )}

              {showModal === 'dev' && (
                <>
                  <input required placeholder="Nombre Dispositivo" className="w-full bg-slate-900 border border-white/5 p-4 rounded-xl text-white font-bold" value={formDev.name} onChange={e => setFormDev({...formDev, name: e.target.value})} />
                  <select className="w-full bg-slate-900 border border-white/5 p-4 rounded-xl text-white font-bold" value={formDev.type} onChange={e => setFormDev({...formDev, type: e.target.value})}>
                    <option value="Iluminación">Iluminación</option>
                    <option value="Climatización">Climatización</option>
                    <option value="Seguridad">Seguridad</option>
                    <option value="Electro">Electrodoméstico</option>
                  </select>
                </>
              )}

              <button disabled={submitting} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                {submitting ? <Loader2 className="animate-spin mx-auto" /> : 'Confirmar y Guardar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStats;