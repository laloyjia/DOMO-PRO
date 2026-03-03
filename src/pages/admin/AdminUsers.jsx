import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import * as XLSX from 'xlsx';
import { 
  UserPlus, FileUp, X, Check, Loader2, 
  Trash2, Shield, User, Mail, Key, Download, Edit3, Building2
} from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState('manual'); 
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '', username: '', email: '', role: 'user', dep: 'Soporte', temp_password: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
  };

  const handleNameChange = (val) => {
    if (mode === 'edit') {
      setFormData({ ...formData, name: val });
      return;
    }
    const cleanName = val.toLowerCase().trim().replace(/\s+/g, '.').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const generatedPass = Math.random().toString(36).slice(-8).toUpperCase();
    
    setFormData({
      ...formData,
      name: val,
      username: cleanName,
      email: val ? `${cleanName}@domopro.cl` : '',
      temp_password: generatedPass
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'edit') {
        const { error } = await supabase.from('profiles').update({
          name: formData.name,
          role: formData.role,
          dep: formData.dep,
          username: formData.username
        }).eq('id', editingId);
        if (error) throw error;
      } else {
        // CREACIÓN EN AUTH + TRIGGER AUTOMÁTICO EN PROFILES
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.temp_password,
          options: {
            data: {
              name: formData.name,
              role: formData.role,
              dep: formData.dep,
              username: formData.username,
              temp_password: formData.temp_password
            }
          }
        });
        if (error) throw error;
        alert("Operador registrado en el sistema Domo-Pro");
      }
      
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      alert("Error de sistema: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (user) => {
    setMode('edit');
    setEditingId(user.id);
    setFormData({
      name: user.name || '',
      username: user.username || '',
      email: user.email || '',
      role: user.role || 'user',
      dep: user.dep || 'Soporte',
      temp_password: user.temp_password || ''
    });
    setShowModal(true);
  };

  const deleteUser = async (id) => {
    if (window.confirm("¿Confirmar baja definitiva de este operador?")) {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) alert(error.message);
      else fetchUsers();
    }
  };

  return (
    <div className="p-4 space-y-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase">Gestión de Personal</h2>
          <p className="text-[10px] text-blue-500 font-bold uppercase tracking-[0.3em] mt-1">Terminal de Control de Usuarios</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setMode('manual'); setShowModal(true); setFormData({name:'', username:'', email:'', role:'user', dep:'Soporte', temp_password:''}); }} 
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20">
            <UserPlus size={16} /> Registro Manual
          </button>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-white font-black uppercase text-xs tracking-[0.2em]">
                {mode === 'edit' ? 'Modificar Credenciales' : 'Nuevo Acceso Domo-Pro'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white"><X size={20}/></button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-5">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre del Operador</label>
                <input required value={formData.name} onChange={(e) => handleNameChange(e.target.value)} 
                  className="w-full bg-slate-800 border border-white/5 rounded-xl p-4 text-white text-sm font-bold focus:border-blue-500 outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Departamento</label>
                  <select value={formData.dep} onChange={e => setFormData({...formData, dep: e.target.value})} 
                    className="w-full bg-slate-800 border border-white/5 rounded-xl p-4 text-white text-xs font-bold focus:border-blue-500 outline-none">
                    <option value="Soporte">Soporte</option>
                    <option value="Operaciones">Operaciones</option>
                    <option value="Administración">Administración</option>
                    <option value="Seguridad">Seguridad</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Nivel de Acceso</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} 
                    className="w-full bg-slate-800 border border-white/5 rounded-xl p-4 text-white text-xs font-bold focus:border-blue-500 outline-none text-blue-400">
                    <option value="admin">Administrador</option>
                    <option value="user">Operador</option>
                    <option value="viewer">Visualizador</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl space-y-3">
                 <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 font-bold uppercase">ID: {formData.username || '---'}</span>
                    <span className="text-blue-400 font-mono font-bold">PASS: {formData.temp_password || '---'}</span>
                 </div>
                 <p className="text-[9px] text-slate-400 italic">El email de acceso será: {formData.email || '---'}</p>
              </div>

              <button disabled={loading} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-500 transition-all flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : <><Check size={18}/> {mode === 'edit' ? 'Actualizar Perfil' : 'Activar Usuario'}</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TABLA INDUSTRIAL */}
      <div className="bg-slate-900/50 border border-white/5 rounded-[2rem] overflow-hidden backdrop-blur-md shadow-2xl">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 border-b border-white/5">
              <th className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest">Operador / Depto</th>
              <th className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest">Email de Acceso</th>
              <th className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-white/[0.02] transition-all group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-black text-xs uppercase shadow-inner">
                      {u.name ? u.name.substring(0,2) : '??'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-200 uppercase tracking-tight">{u.name || 'Sin nombre'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[8px] font-black uppercase rounded border border-white/5 tracking-tighter">
                          {u.dep || 'General'}
                        </span>
                        <span className={`text-[8px] font-black uppercase tracking-tighter ${u.role === 'admin' ? 'text-blue-500' : 'text-slate-500'}`}>
                          {u.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 font-mono text-xs text-slate-400">{u.email}</td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(u)} className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"><Edit3 size={18} /></button>
                    <button onClick={() => deleteUser(u.id)} className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;