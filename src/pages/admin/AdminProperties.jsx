import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Home, Plus, X, Check, Loader2, Trash2, Edit3, Map, Link } from 'lucide-react';

const AdminProperties = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState('add');
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({ name: '', address: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const { data } = await supabase.from('properties').select('*').order('created_at');
    setItems(data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (mode === 'edit') {
      await supabase.from('properties').update(formData).eq('id', editingId);
    } else {
      await supabase.from('properties').insert([formData]);
    }
    setLoading(false);
    setShowModal(false);
    setFormData({ name: '', address: '' });
    fetchData();
  };

  const deleteItem = async (id) => {
    if (window.confirm("¿Eliminar propiedad? Esto borrará todas sus habitaciones y dispositivos asociados.")) {
      await supabase.from('properties').delete().eq('id', id);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Propiedades</h2>
          <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1">Gestión de Activos Inmobiliarios</p>
        </div>
        <button onClick={() => { setMode('add'); setShowModal(true); }} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs hover:bg-blue-600 shadow-xl transition-all">
          <Plus size={18} /> Nueva Propiedad
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm hover:shadow-blue-200/50 transition-all group relative">
            <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => { setMode('edit'); setEditingId(item.id); setFormData({name: item.name, address: item.address}); setShowModal(true); }} className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-600"><Edit3 size={16}/></button>
              <button onClick={() => deleteItem(item.id)} className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-red-50 hover:text-red-600"><Trash2 size={16}/></button>
            </div>
            
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Home size={28} />
            </div>
            <h3 className="font-black text-slate-800 uppercase text-lg mb-2">{item.name}</h3>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
              <Map size={14} /> {item.address || 'Sin dirección'}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-8">
            <h3 className="font-black uppercase text-sm tracking-widest mb-6">{mode === 'edit' ? 'Editar Propiedad' : 'Nueva Propiedad'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required placeholder="Nombre (Ej: Casa Bosque)" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-sm font-bold outline-none focus:border-blue-500" />
              <input placeholder="Dirección" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-sm font-bold outline-none focus:border-blue-500" />
              <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : <Check size={18}/>} {mode === 'edit' ? 'Actualizar' : 'Guardar'}
              </button>
              <button type="button" onClick={() => setShowModal(false)} className="w-full text-slate-400 font-bold text-xs uppercase">Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProperties;