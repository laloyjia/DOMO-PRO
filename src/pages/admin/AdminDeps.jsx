import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Building2, Plus, X, Check, Loader2, 
  Trash2, Edit3, MapPin, Activity, AlertCircle 
} from 'lucide-react';

const AdminDeps = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState('add');
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '', type: 'Oficina', location: '', status: 'Activo'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data } = await supabase
      .from('dependencies')
      .select('*')
      .order('name', { ascending: true });
    setItems(data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (mode === 'edit') {
        const { error } = await supabase
          .from('dependencies')
          .update(formData)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('dependencies')
          .insert([formData]);
        if (error) throw error;
      }
      
      setShowModal(false);
      setFormData({ name: '', type: 'Oficina', location: '', status: 'Activo' });
      fetchData();
    } catch (err) {
      alert("Error en la operación: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (item) => {
    setMode('edit');
    setEditingId(item.id);
    setFormData({
      name: item.name,
      type: item.type,
      location: item.location,
      status: item.status
    });
    setShowModal(true);
  };

  const deleteItem = async (id) => {
    if (window.confirm("¿Eliminar esta dependencia? Se perderá el enlace con sus sensores.")) {
      const { error } = await supabase.from('dependencies').delete().eq('id', id);
      if (!error) fetchData();
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER DE SECCIÓN */}
      <div className="flex justify-between items-end border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Dependencias</h2>
          <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1">Infraestructura Crítica Domo-Pro</p>
        </div>
        <button 
          onClick={() => { setMode('add'); setShowModal(true); setFormData({name:'', type:'Oficina', location:'', status:'Activo'}); }}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs hover:bg-blue-600 shadow-xl transition-all active:scale-95"
        >
          <Plus size={18} /> Nueva Área
        </button>
      </div>

      {/* GRID DE DEPENDENCIAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEdit(item)} className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-600"><Edit3 size={16}/></button>
              <button onClick={() => deleteItem(item.id)} className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-red-50 hover:text-red-600"><Trash2 size={16}/></button>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-600 border border-slate-100">
                <Building2 size={24} />
              </div>
              <div className="flex-1 pr-12">
                <h3 className="font-black text-slate-800 uppercase text-sm mb-1">{item.name}</h3>
                <div className="flex items-center gap-1.5 text-slate-400 mb-3">
                  <MapPin size={12} />
                  <span className="text-[10px] font-bold uppercase">{item.location || 'Sin Ubicación'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[9px] font-black uppercase italic">{item.type}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase flex items-center gap-1 ${
                    item.status === 'Activo' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    <Activity size={8} /> {item.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE GESTIÓN */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black uppercase text-xs tracking-widest">{mode === 'edit' ? 'Modificar Área' : 'Registrar Área'}</h3>
                <p className="text-[9px] text-blue-400 font-bold uppercase mt-1">Configuración de Espacio</p>
              </div>
              <button onClick={() => setShowModal(false)} className="bg-white/10 p-2 rounded-full hover:bg-red-500 transition-colors"><X size={20}/></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre de Dependencia</label>
                <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3.5 text-sm font-bold focus:border-blue-500 outline-none transition-all" placeholder="Ej: Laboratorio Central" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Espacio</label>
                  <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3.5 text-xs font-bold focus:border-blue-500 outline-none">
                    <option>Oficina</option>
                    <option>Laboratorio</option>
                    <option>Sala de Servidores</option>
                    <option>Área Común</option>
                    <option>Pasillo</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estado Operativo</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3.5 text-xs font-bold focus:border-blue-500 outline-none">
                    <option>Activo</option>
                    <option>Mantenimiento</option>
                    <option>Fuera de Servicio</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ubicación (Piso/Sector)</label>
                <input value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3.5 text-sm font-bold focus:border-blue-500 outline-none transition-all" placeholder="Ej: Piso 3 - Ala Sur" />
              </div>

              <button disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
                {loading ? <Loader2 className="animate-spin" /> : <><Check size={18}/> {mode === 'edit' ? 'Guardar Cambios' : 'Confirmar Registro'}</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDeps;