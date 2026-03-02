import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail, Loader2, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Limpieza de datos básica
    const cleanEmail = email.trim().toLowerCase();

    try {
      // CONSULTA: Verificamos credenciales en la tabla profiles
      const { data, error: authError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', cleanEmail)
        .eq('temp_password', password)
        .single();

      if (authError || !data) {
        throw new Error("Acceso denegado. Credenciales no reconocidas por el sistema.");
      }

      // ÉXITO: Persistencia
      localStorage.setItem('domo_user', JSON.stringify(data));
      
      // Si pasamos la función por props la usamos, si no, recargamos para que App.jsx detecte el storage
      if (onLoginSuccess) {
        onLoginSuccess(data);
      } else {
        window.location.reload();
      }
      
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans border-t-4 border-blue-600">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header con estilo Industrial */}
        <div className="bg-slate-900 p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
          <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/40 rotate-6 hover:rotate-0 transition-transform duration-500">
            <ShieldCheck size={40} className="text-white" />
          </div>
          <h1 className="text-white text-3xl font-black tracking-tighter uppercase italic">
            Domo-Pro <span className="text-blue-500">OS</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Auth Terminal v2.1</p>
        </div>

        {/* Formulario de Acceso */}
        <form onSubmit={handleLogin} className="p-12 space-y-7">
          {error && (
            <div className="bg-red-50 border-2 border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-[11px] font-black uppercase tracking-tight animate-bounce">
              <AlertCircle size={20} /> {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Identificación de Red</label>
            <div className="relative group">
              <Mail className="absolute left-5 top-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                required
                type="email"
                autoComplete="email"
                className="w-full bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl py-4 pl-14 pr-4 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                placeholder="nombre.apellido@domo.pro"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Llave de Seguridad</label>
            <div className="relative group">
              <Lock className="absolute left-5 top-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                required
                type={showPassword ? "text" : "password"}
                className="w-full bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl py-4 pl-14 pr-14 outline-none transition-all font-bold text-slate-700 font-mono"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-4 text-slate-300 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-blue-600 active:bg-blue-700 transition-all shadow-2xl shadow-blue-100 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={22} />
            ) : (
              <>Acceder al Sistema</>
            )}
          </button>
        </form>

        <div className="p-8 bg-slate-50/50 border-t border-slate-100 text-center">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">Domo-Pro Systems &copy; 2026 | Enlace Encriptado</p>
        </div>
      </div>
    </div>
  );
};

export default Login;