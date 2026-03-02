import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import * as XLSX from 'xlsx';
import { 
  UserPlus, FileUp, X, Check, Loader2, 
  Trash2, Shield, User, Mail, Key, Download, AlertCircle, Edit3
} from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState('manual'); // 'manual', 'bulk', 'edit'
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '', username: '', email: '', role: 'Operador', temp_password: ''
  });

  useEffect(() => {
    fetchUsers();
    const channel = supabase.channel('profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchUsers();
      }).subscribe();
    
    return () => supabase.removeChannel(channel);
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
      email: val ? `${cleanName}@domo.pro` : '',
      temp_password: generatedPass
    });
  };

  const downloadTemplate = () => {
    const templateData = [{ name: 'Ejemplo Nombre', email: 'ejemplo@domo.pro', role: 'Operador', username: 'ejemplo.user', temp_password: 'TEMP123' }];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
    XLSX.writeFile(wb, "Plantilla_Carga_DomoPro.xlsx");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        setLoading(true);
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        const { error } = await supabase.from('profiles').insert(data);
        if (error) throw error;
        setShowModal(false);
        fetchUsers();
      } catch (err) { alert("Error: " + err.message); } finally { setLoading(false); }
    };
    reader.readAsBinaryString(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (mode === 'edit') {
      const { error } = await supabase.from('profiles').update(formData).eq('id', editingId);
      if (error) alert(error.message);
    } else {
      const { error } = await supabase.from('profiles').insert([formData]);
      if (error) alert(error.message);
    }
    
    setLoading(false);
    setShowModal(false);
    setFormData({ name: '', username: '', email: '', role: 'Operador', temp_password: '' });
  };

  const openEdit = (user) => {
    setMode('edit');
    setEditingId(user.id);
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      temp_password: user.temp_password
    });
    setShowModal(true);
  };

  const deleteUser = async (id) => {
    if (window.confirm("¿Confirmar eliminación de este acceso biométrico?")) {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) alert("Error: " + error.message);
      else fetchUsers();
    }
  };

  return (
    <div className="p-4 space-y-4 font-sans max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Gestión de Personal</h2>
          <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1">Directorio de Seguridad Domo-Pro</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setMode('bulk'); setShowModal(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all">
            <FileUp size={16} /> Carga Masiva
          </button>
          <button onClick={() => { setMode('manual'); setShowModal(true); setFormData({name:'', username:'', email:'', role:'Operador', temp_password:''}); }} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-blue-600 shadow-xl shadow-slate-200 transition-all">
            <UserPlus size={16} /> Registro Manual
          </button>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 px-8 py-6 flex justify-between items-center text-white">
              <h3 className="font-black uppercase text-xs tracking-widest">
                {mode === 'manual' ? 'Alta de Usuario' : mode === 'edit' ? 'Editar Perfil' : 'Importación Excel'}
              </h3>
              <button onClick={() => setShowModal(false)} className="bg-white/10 p-2 rounded-full hover:bg-red-500 transition-colors"><X size={18}/></button>
            </div>

            <div className="p-8">
              {mode !== 'bulk' ? (
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                    <input required value={formData.name} onChange={(e) => handleNameChange(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-sm font-bold focus:border-blue-500 outline-none transition-all" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ID Usuario</label>
                      <input value={formData.username} readOnly={mode !== 'edit'} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full bg-slate-100 border-none rounded-xl p-3 text-xs font-mono font-bold text-slate-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pass Temporal</label>
                      <input value={formData.temp_password} readOnly={mode !== 'edit'} onChange={(e) => setFormData({...formData, temp_password: e.target.value})} className="w-full bg-amber-50 border-2 border-amber-100 rounded-xl p-3 text-xs font-mono font-black text-amber-700 uppercase" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                    <input value={formData.email} readOnly={mode !== 'edit'} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-100 border-none rounded-xl p-3 text-xs font-bold text-slate-500" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rol de Acceso</label>
                    <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-sm font-bold focus:border-blue-500 outline-none">
                      <option>Admin</option>
                      <option>Operador</option>
                      <option>Visualizador</option>
                    </select>
                  </div>

                  <button disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" /> : <><Check size={18}/> {mode === 'edit' ? 'Actualizar' : 'Confirmar Registro'}</>}
                  </button>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-[2rem] hover:border-blue-500 bg-slate-50 relative">
                    <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <FileUp size={32} className="mx-auto text-blue-500 mb-2" />
                    <p className="text-xs font-black text-slate-700 uppercase">Soltar Excel</p>
                  </div>
                  <button onClick={downloadTemplate} className="w-full flex items-center justify-center gap-2 py-3 bg-white border-2 border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase hover:text-blue-600 transition-all shadow-sm">
                    <Download size={14} /> Descargar Plantilla Oficial
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TABLA */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              <th className="px-8 py-5 font-black text-slate-400 uppercase tracking-widest text-[9px]">Operador / Sistema</th>
              <th className="px-8 py-5 font-black text-slate-400 uppercase tracking-widest text-[9px]">Nivel</th>
              <th className="px-8 py-5 font-black text-slate-400 uppercase tracking-widest text-[9px] text-right">Gestión</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50/80 transition-all group">
                <td className="px-8 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs uppercase">{u.name.substring(0,2)}</div>
                    <div>
                      <p className="font-black text-slate-800 text-sm uppercase tracking-tight">{u.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono italic">{u.username} | {u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-4">
                  <div className="flex items-center gap-2">
                    <Shield size={12} className={u.role === 'Admin' ? 'text-red-500' : 'text-slate-400'} />
                    <span className={`font-black text-[10px] uppercase tracking-widest ${u.role === 'Admin' ? 'text-red-600' : 'text-slate-500'}`}>{u.role}</span>
                  </div>
                </td>
                <td className="px-8 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(u)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit3 size={18} /></button>
                    <button onClick={() => deleteUser(u.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={18} /></button>
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