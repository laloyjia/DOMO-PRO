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
      // 1. Autenticación
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (authError) throw authError;

      // 2. Obtener Perfil con reintento/limpieza de error
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      // Si hay error de perfil, pero el auth fue exitoso, intentamos entrar como user por defecto
      const finalRole = profile?.role || 'user';
      localStorage.setItem('domo_role', finalRole);

      // 3. Navegación basada en rutas reales de App.jsx
      if (finalRole === 'admin') {
        navigate('/admin');
      } else {
        navigate('/user');
      }

    } catch (err) {
      console.error("Login error:", err);
      setError(err.message === "Invalid login credentials" 
        ? "Acceso denegado: Credenciales incorrectas." 
        : "Error de conexión con el terminal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="bg-slate-900 p-10 text-center relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30 rotate-3">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-white text-2xl font-black tracking-tighter uppercase italic">
            Domo-Pro <span className="text-blue-500">OS</span>
          </h1>
        </div>

        <form onSubmit={handleLogin} className="p-10 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-r-xl flex items-center gap-3 text-xs font-bold uppercase">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Terminal ID</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-slate-300" size={18} />
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 focus:border-blue-500 rounded-xl py-3.5 pl-12 pr-4 outline-none transition-all font-bold text-slate-700"
                placeholder="admin@domo.pro" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Key</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-slate-300" size={18} />
              <input required type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 focus:border-blue-500 rounded-xl py-3.5 pl-12 pr-12 outline-none transition-all font-bold text-slate-700"
                placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-slate-300 hover:text-blue-500">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 active:scale-[0.98] transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Iniciar Secuencia"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;