import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, Mail, Loader2, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (authError) throw authError;

      // Obtener el perfil para saber a dónde mandarlo inmediatamente
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) throw new Error("Perfil no encontrado.");

      // Navegación atómica
      if (profile.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/user', { replace: true });
      }

    } catch (err) {
      setError(err.message === "Invalid login credentials" ? "Credenciales incorrectas." : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="bg-slate-900 p-12 text-center relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
          <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 rotate-6 shadow-xl shadow-blue-500/40">
            <ShieldCheck size={40} className="text-white" />
          </div>
          <h1 className="text-white text-3xl font-black italic uppercase tracking-tighter">Domo-Pro <span className="text-blue-500">OS</span></h1>
        </div>

        <form onSubmit={handleLogin} className="p-12 space-y-7">
          {error && <div className="bg-red-50 border-2 border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-[11px] font-black uppercase"><AlertCircle size={20}/> {error}</div>}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">ID Usuario</label>
            <div className="relative group">
              <Mail className="absolute left-5 top-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 focus:border-blue-500 rounded-2xl py-4 pl-14 pr-4 outline-none font-bold text-slate-700" placeholder="admin@domo.pro" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Llave Maestra</label>
            <div className="relative group">
              <Lock className="absolute left-5 top-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input required type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 focus:border-blue-500 rounded-2xl py-4 pl-14 pr-14 outline-none font-bold text-slate-700" placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-4 text-slate-300 hover:text-slate-600 transition-colors">{showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}</button>
            </div>
          </div>
          <button disabled={loading} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-blue-600 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70">
            {loading ? <Loader2 className="animate-spin" size={22} /> : "Desbloquear Sistema"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;