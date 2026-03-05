import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import * as XLSX from 'xlsx';
import { 
  UserPlus, FileUp, X, Check, Loader2, 
  Trash2, Shield, User, Mail, Key, Download, Edit3, Building2, AlertCircle
} from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState('manual'); // 'manual', 'edit', 'excel'
  const [editingId, setEditingId] = useState(null);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    name: '', username: '', email: '', role: 'user', dep: 'Soporte', temp_password: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error("Error fetching users:", error);
    setUsers(data || []);
    setLoading(false);
  };

  const handleNameChange = (val) => {
    if (mode === 'edit') {
      setFormData({ ...formData, name: val });
      return;
    }
    const cleanName = val.toLowerCase().trim().replace(/\s+/g, '.').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    setFormData({ ...formData, name: val, username: cleanName });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ type: '', text: '' });

    try {
      if (mode === 'edit') {
        // ACTUALIZACIÓN DE PERFIL
        const { error } = await supabase
          .from('profiles')
          .update({
            name: formData.name,
            role: formData.role,
            dep: formData.dep,
            username: formData.username
          })
          .eq('id', editingId);

        if (error) throw error;
        setStatusMsg({ type: 'success', text: 'Usuario actualizado correctamente' });
      } else {
        // CREACIÓN DE NUEVO USUARIO EN AUTH
        // El Trigger de la DB se encargará de crear el registro en 'profiles'
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.temp_password,
          options: {
            data: {
              name: formData.name,
              username: formData.username,
              role: formData.role,
              dep: formData.dep
            }
          }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("Error al crear el registro de autenticación");

        setStatusMsg({ type: 'success', text: 'Usuario creado y registrado' });
      }

      setShowModal(false);
      fetchUsers();
      resetForm();
    } catch (err) {
      console.error("Error en operación:", err.message);
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este usuario? Esta acción es irreversible.")) return;
    
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      fetchUsers();
    } catch (err) {
      alert("Error al eliminar: " + err.message);
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
      dep: user.dep || 'General',
      temp_password: ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', username: '', email: '', role: 'user', dep: 'Soporte', temp_password: '' });
    setEditingId(null);
    setMode('manual');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER Y BOTONES */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Gestión de <span className="text-blue-500">Personal</span></h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Operadores del Sistema</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20">
            <UserPlus size={18} /> Nuevo Operador
          </button>
        </div>
      </div>

      {/* TABLA DE USUARIOS */}
      <div className="bg-[#0f172a] rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/5">
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <th className="px-8 py-5">Operador</th>
              <th className="px-8 py-5">Contacto</th>
              <th className="px-8 py-5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((u) => (
              <tr key={u.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-blue-500/50 transition-colors">
                      <User size={20} className="text-slate-400 group-hover:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-200 uppercase tracking-tight">{u.name || 'Sin nombre'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[8px] font-black uppercase rounded border border-white/5">
                          {u.dep || 'General'}
                        </span>
                        <span className={`text-[8px] font-black uppercase ${u.role === 'admin' ? 'text-blue-500' : 'text-slate-500'}`}>
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
        {users.length === 0 && !loading && (
          <div className="p-20 text-center text-slate-600 font-bold uppercase text-xs tracking-widest">No hay operadores registrados</div>
        )}
      </div>

      {/* MODAL DE CREACIÓN/EDICIÓN */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#1e293b] w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">
                  {mode === 'edit' ? 'Editar' : 'Registrar'} <span className="text-blue-500">Operador</span>
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre Completo</label>
                  <input required value={formData.name} onChange={e => handleNameChange(e.target.value)} className="w-full bg-slate-900 border border-white/5 rounded-xl p-4 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all" placeholder="Ej: Juan Perez" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">ID Usuario</label>
                  <input readOnly value={formData.username} className="w-full bg-slate-800/50 border border-white/5 rounded-xl p-4 text-sm font-mono text-slate-400 outline-none" placeholder="id.usuario" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Correo Electrónico</label>
                <input required disabled={mode === 'edit'} type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-xl p-4 text-sm font-bold text-white outline-none focus:border-blue-500 disabled:opacity-50" placeholder="correo@empresa.com" />
              </div>

              {mode !== 'edit' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contraseña Temporal</label>
                  <input required type="password" value={formData.temp_password} onChange={e => setFormData({...formData, temp_password: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-xl p-4 text-sm font-bold text-white outline-none focus:border-blue-500" placeholder="Min. 6 caracteres" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nivel de Acceso</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-xl p-4 text-sm font-bold text-white outline-none focus:border-blue-500">
                    <option value="user">Operador (User)</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Departamento</label>
                  <select value={formData.dep} onChange={e => setFormData({...formData, dep: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-xl p-4 text-sm font-bold text-white outline-none focus:border-blue-500">
                    <option value="Soporte">Soporte</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                    <option value="Seguridad">Seguridad</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              {statusMsg.text && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${statusMsg.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                  <AlertCircle size={18} />
                  <p className="text-[10px] font-black uppercase tracking-tight">{statusMsg.text}</p>
                </div>
              )}

              <button disabled={loading} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" /> : <><Check size={20}/> {mode === 'edit' ? 'Actualizar Datos' : 'Confirmar Registro'}</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;