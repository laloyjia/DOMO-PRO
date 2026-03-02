import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Home, Building2, Cpu, Plus, X, Check, Loader2, 
  Settings2, Radio, Power, Trash2, Globe, Box, Zap, User, 
  Activity, PlusCircle, Layout, Lightbulb, Thermometer, ShieldCheck, Tv
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

  useEffect(() => { fetchFullHierarchy(); fetchUsers(); }, []);

  const fetchUsers = async () => {
    const { data: userData } = await supabase.from('profiles').select('id, name, email');
    if (userData) setUsers(userData);
  };

  const fetchFullHierarchy = async () => {
    setLoading(true);
    const { data: properties } = await supabase
      .from('properties')
      .select(`*, dependencies (*, devices (*))`)
      .order('created_at', { ascending: false });

    if (properties) {
      setData(properties);
      let hCount = 0, dCount = 0;
      properties.forEach(p => {
        hCount += p.dependencies?.length || 0;
        p.dependencies?.forEach(h => dCount += h.devices?.length || 0);
      });
      setStats({ casas: properties.length, habs: hCount, devs: dCount });
    }
    setLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let error;
      if (showModal === 'casa') {
        ({ error } = await supabase.from('properties').insert([{ 
          name: formCasa.name,
          owner_id: formCasa.owner_id,
          address: formCasa.address,
          consumption: parseInt(formCasa.consumption_limit),
          category: formCasa.category
        }]));
      } else if (showModal === 'hab') {
        ({ error } = await supabase.from('dependencies').insert([{ 
          name: formHab.name, 
          property_id: parentId.casa, 
          type: formHab.type 
        }]));
      } else if (showModal === 'dev') {
        ({ error } = await supabase.from('devices').insert([{ 
          name: formDev.name, 
          dependency_id: parentId.hab, 
          status: false, 
          type: formDev.type 
        }]));
      }
      if (error) throw error;
      setShowModal(null);
      setFormCasa({ name: '', owner_id: '', address: '', consumption_limit: 100, category: 'Residencial' });
      setFormHab({ name: '', type: 'Salón' });
      setFormDev({ name: '', type: 'Iluminación', consumption_base: 5 });
      await fetchFullHierarchy();
    } catch (err) { alert("Protocol Error: " + err.message); } finally { setSubmitting(false); }
  };

  const toggleDevice = async (id, status) => {
    await supabase.from('devices').update({ status: !status }).eq('id', id);
    fetchFullHierarchy();
  };

  const deleteRecord = async (table, id) => {
    if(window.confirm("¿CONFIRMAR DESCONEXIÓN DE NODO? Esta acción es irreversible.")) {
      await supabase.from(table).delete().eq('id', id);
      fetchFullHierarchy();
    }
  };

  return (
    // FONDO PROFUNDO FPP (Futuristic Panel Platform) - Compactado
    <div className="space-y-6 p-4 md:p-6 font-sans bg-[#050509] text-slate-300 min-h-screen animate-in fade-in duration-1000">
      
      {/* HEADER TÁCTICO - Compactado */}
      <div className="flex justify-between items-center p-5 bg-[#0a0a12] rounded-3xl border border-white/5 shadow-[0_0_30px_-5px_rgba(59,130,246,0.1)] relative overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"/>
         <div className="relative z-10 flex items-center gap-4">
            <div className="p-2.5 bg-blue-950 rounded-xl border border-blue-500/20 text-blue-400">
                <Settings2 size={20} className="animate-spin-slow"/>
            </div>
            <div>
                <h1 className="text-2xl font-black italic tracking-tighter uppercase text-white">CORE NETWORK</h1>
                <p className="text-[9px] font-mono font-bold text-blue-400 uppercase tracking-[0.3em] flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-green-500 animate-pulse"/> SYSTEM_ACTIVE [v4.1]
                </p>
            </div>
         </div>
         <button onClick={() => setShowModal('casa')} className="relative z-10 bg-white text-slate-950 px-6 py-3 rounded-xl font-black uppercase text-xs hover:bg-blue-400 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-white/5">
            <Plus size={16}/> INITIALIZE_NODE
         </button>
      </div>

      {/* METRICS (Datacenter Style) - Más compactas, texto más pequeño */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Infraestructuras', val: stats.casas, icon: Home, color: 'text-blue-400' },
          { label: 'Nodos Área', val: stats.habs, icon: Radio, color: 'text-purple-400' },
          { label: 'Terminales', val: stats.devs, icon: Cpu, color: 'text-cyan-400' }
        ].map((item, i) => (
          <div key={i} className="bg-[#0a0a12] border border-white/5 p-6 rounded-3xl shadow-lg group overflow-hidden relative">
            <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-white/40 text-[8px] font-black uppercase tracking-[0.3em] mb-1">{item.label}</p>
                  <h3 className="text-5xl font-black text-white italic tracking-tighter leading-none">{item.val}</h3>
                </div>
                <item.icon className={`${item.color} opacity-20 group-hover:opacity-100 transition-opacity duration-500`} size={36} />
            </div>
          </div>
        ))}
      </div>

      {/* EXPLORADOR DE RED (Glassmorphism Deep) - Menos padding, bordes más finos */}
      <div className="space-y-6 pb-10">
        {loading ? (
            <div className="py-20 text-center text-slate-600 font-black uppercase tracking-[0.5em] text-[9px]">Sincronizando_Protocolos...</div>
        ) : data.map(casa => (
          <div key={casa.id} className="bg-[#0a0a12] rounded-3xl border border-white/5 overflow-hidden shadow-[0_16px_32px_-10px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom duration-500 hover:border-blue-500/10 transition-colors">
            {/* CABECERA VIVIENDA (Glow Active) - Compactada */}
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-transparent via-white/5 to-transparent relative">
              <div className="absolute top-0 left-8 h-[1px] w-28 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"/>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/20"><Home size={22}/></div>
                <div>
                  <h3 className="font-black uppercase italic text-xl text-white tracking-tighter leading-none">{casa.name}</h3>
                  <p className="text-[9px] text-slate-400 font-mono font-bold uppercase tracking-[0.2em] flex items-center gap-1.5 mt-1.5">
                    <Globe size={11}/> {casa.address || 'LOC_HOST'} • <span className="text-blue-500">{casa.category}</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-2 relative z-10">
                <button onClick={() => { setParentId({casa: casa.id}); setShowModal('hab'); }} className="bg-blue-950 text-blue-300 border border-blue-500/20 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-md active:scale-95">+ Área</button>
                <button onClick={() => deleteRecord('properties', casa.id)} className="p-2.5 text-slate-600 hover:text-red-500 rounded-lg transition-all"><Trash2 size={16}/></button>
              </div>
            </div>

            {/* CONTENIDO INTERNO: HABITACIONES Y DISPOSITIVOS (Grid Técnico) - Más compacto */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {casa.dependencies?.map(hab => (
                <div key={hab.id} className="bg-[#10101a] rounded-2xl p-6 border border-white/5 group transition-all hover:bg-black/20">
                  <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-3">
                       <Layout size={18} className="text-blue-500"/>
                       <div>
                            <span className="font-black uppercase italic text-sm text-white tracking-tight leading-none">{hab.name}</span>
                            <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest block mt-1">{hab.type}_NODE</span>
                       </div>
                    </div>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setParentId({casa: casa.id, hab: hab.id}); setShowModal('dev'); }} className="text-[8px] font-black bg-white/5 px-2.5 py-1 rounded text-blue-400 uppercase tracking-widest hover:bg-blue-600 hover:text-white">+ Disp</button>
                      <button onClick={() => deleteRecord('dependencies', hab.id)} className="text-slate-600 hover:text-red-500"><Trash2 size={14}/></button>
                    </div>
                  </div>
                  
                  {/* DISPOSITIVOS (Pills Neón) - Más pequeños y densos */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
                    {hab.devices?.length > 0 ? hab.devices.map(dev => (
                      <div key={dev.id} className={`flex items-center gap-2 pl-2 pr-3 py-2 rounded-full border transition-all active:scale-95 group/dev ${dev.status ? 'bg-cyan-950 border-cyan-500 text-cyan-100 shadow-[0_0_10px_rgba(34,211,238,0.3)]' : 'bg-[#0a0a12] border-white/5 text-slate-600'}`}>
                        <button onClick={() => toggleDevice(dev.id, dev.status)} className="p-1 rounded-full bg-black/50 hover:bg-black transition-colors"><Power size={10}/></button>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-tighter leading-none">{dev.name}</span>
                        <button onClick={() => deleteRecord('devices', dev.id)} className="ml-1 opacity-0 group-hover/dev:opacity-100 hover:text-red-400 transition-all"><X size={10}/></button>
                      </div>
                    )) : <p className="text-[9px] text-slate-700 font-bold uppercase italic tracking-widest py-1">Sin terminales detectados</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL SUPREMO FPP (Glassmorphism Modal) - Menos padding, inputs más pequeños */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-[#0a0a12] w-full max-w-lg rounded-3xl shadow-[0_0_80px_-10px_rgba(59,130,246,0.15)] overflow-hidden relative border border-white/10">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 blur-[50px] rounded-full"/>
            <div className="bg-[#07070e] p-6 text-white flex justify-between items-center relative border-b border-white/5">
              <div>
                <p className="text-blue-500 font-mono text-[9px] uppercase tracking-[0.5em] mb-1.5 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"/> PROVISION_PROTOCOL
                </p>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none">REGISTRAR {showModal.toUpperCase()}</h3>
              </div>
              <button onClick={() => setShowModal(null)} className="p-3 bg-white/5 text-slate-600 hover:text-white rounded-xl transition-all"><X size={24}/></button>
            </div>

            <form onSubmit={handleCreate} className="p-8 space-y-6 relative z-10">
              
              {/* FORMULARIO VIVIENDA (FPP Style) */}
              {showModal === 'casa' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block ml-1.5">System_Alias</label>
                      <input required className="w-full bg-[#10101a] p-4 rounded-xl border border-white/5 text-white font-mono text-sm focus:border-blue-500 transition-all outline-none" placeholder="EJ: ALPHA_PROT_01" value={formCasa.name} onChange={e => setFormCasa({...formCasa, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block ml-1.5">Asign_Owner</label>
                      <select required className="w-full bg-[#10101a] p-4 rounded-xl border border-white/5 text-white font-mono text-xs focus:border-blue-500 outline-none cursor-pointer" value={formCasa.owner_id} onChange={e => setFormCasa({...formCasa, owner_id: e.target.value})}>
                        <option value="" className="bg-[#10101a]">-- SELECT_OWNER --</option>
                        {users.map(u => <option key={u.id} value={u.id} className="bg-[#10101a]">{u.name || u.email}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1.5">Geo_Ref / Address</label>
                    <input required className="w-full bg-[#10101a] p-4 rounded-xl border border-white/5 text-white font-mono text-xs focus:border-blue-500 outline-none" placeholder="GRID / STREET / ZONE" value={formCasa.address} onChange={e => setFormCasa({...formCasa, address: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 items-end">
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block ml-1.5">Core_Category</label>
                      <select className="w-full bg-[#10101a] p-4 rounded-xl border border-white/5 text-white font-mono text-xs focus:border-blue-500 outline-none" value={formCasa.category} onChange={e => setFormCasa({...formCasa, category: e.target.value})}>
                        <option value="Residencial">RESIDENCIAL</option>
                        <option value="Comercial">COMERCIAL</option>
                        <option value="Industrial">INDUSTRIAL</option>
                      </select>
                    </div>
                    <div className="pb-1">
                      <div className="flex justify-between mb-3 px-1.5"><label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Energy_Limit</label><span className="text-[11px] font-mono font-bold text-cyan-400">{formCasa.consumption_limit}kWh</span></div>
                      <input type="range" min="10" max="1000" step="10" className="w-full h-1 bg-white/10 rounded appearance-none cursor-pointer accent-cyan-500" value={formCasa.consumption_limit} onChange={e => setFormCasa({...formCasa, consumption_limit: e.target.value})} />
                    </div>
                  </div>
                </div>
              )}

              {/* FORMULARIO HABITACIÓN (Selector Técnico) */}
              {showModal === 'hab' && (
                <div className="space-y-6">
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase mb-1.5 block ml-1.5">Area_Alias</label>
                    <input required className="w-full bg-[#10101a] p-5 rounded-2xl border border-white/5 text-xl font-black text-white outline-none focus:ring-2 ring-blue-500 transition-all uppercase italic placeholder:text-slate-800 placeholder:not-italic" placeholder="NOMBRE_ZONA" value={formHab.name} onChange={e => setFormHab({...formHab, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase mb-2.5 block ml-1.5">Environment_Type_Grid</label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {['Salón', 'Cocina', 'Dormitorio', 'Baño', 'Garaje', 'Exterior'].map(t => (
                        <button key={t} type="button" onClick={() => setFormHab({...formHab, type: t})} className={`p-3 rounded-lg border text-[9px] font-mono font-bold uppercase transition-all active:scale-95 ${formHab.type === t ? 'border-blue-500 bg-blue-950 text-blue-200 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'border-white/5 text-slate-600 hover:border-white/10 hover:text-slate-400'}`}>
                          {t}_MODE
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* FORMULARIO DISPOSITIVO (Parámetros Técnicos) */}
              {showModal === 'dev' && (
                <div className="space-y-6">
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase mb-1.5 block ml-1.5">Terminal_Alias</label>
                    <input required className="w-full bg-[#10101a] p-5 rounded-2xl border border-white/5 text-xl font-black text-white outline-none focus:ring-2 ring-blue-500 transition-all uppercase italic placeholder:text-slate-800 placeholder:not-italic" placeholder="ID_DISPOSITIVO" value={formDev.name} onChange={e => setFormDev({...formDev, name: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase mb-1.5 block ml-1.5">Hardware_Core</label>
                      <select className="w-full bg-[#10101a] p-4 rounded-xl border border-white/5 text-white font-mono text-xs focus:border-blue-500 outline-none" value={formDev.type} onChange={e => setFormDev({...formDev, type: e.target.value})}>
                        <option value="Iluminación" className="bg-[#10101a]">Iluminación_Sys</option>
                        <option value="Climatización" className="bg-[#10101a]">Clima_Sys</option>
                        <option value="Seguridad" className="bg-[#10101a]">Security_Sys</option>
                        <option value="Multimedia" className="bg-[#10101a]">Multi_Media_Sys</option>
                        <option value="Electrodoméstico" className="bg-[#10101a]">Appliances_Sys</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase mb-1.5 block ml-1.5">Base_Consumption (W)</label>
                      <input type="number" className="w-full bg-[#10101a] p-4 rounded-xl border border-white/5 text-white font-mono text-xs focus:border-blue-500 outline-none" value={formDev.consumption_base} onChange={e => setFormDev({...formDev, consumption_base: e.target.value})} />
                    </div>
                  </div>
                </div>
              )}

              <button disabled={submitting} className="w-full relative group overflow-hidden bg-white text-black py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:bg-slate-700 disabled:text-slate-400">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {submitting ? <Loader2 className="animate-spin relative z-10"/> : <><Check size={18} className="relative z-10"/> <span className="relative z-10 group-hover:text-white transition-colors">Inicializar_Protocolo</span></>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStats;