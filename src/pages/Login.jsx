import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail, Loader2, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (authError) {
        if (authError.message.includes("Invalid login credentials")) {
          throw new Error("Correo o contraseña incorrectos");
        }
        throw authError;
      }

      // No necesitamos navegar manualmente aquí. 
      // App.jsx detectará el cambio de sesión y nos moverá al Dashboard.
      
    } catch (err) {
      console.error("❌ Error en login:", err.message);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-blue-500 selection:text-white">
      {/* Decoración de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-md relative animate-in fade-in zoom-in duration-500">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 relative overflow-hidden">
          
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-4 shadow-xl rotate-3">
              <ShieldCheck size={32} className="text-blue-500" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 italic tracking-tighter">
              DOMO<span className="text-blue-600">-</span>PRO
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-2">
              Security & Control System
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Acceso Operador</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  required 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="w-full bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl py-4 pl-14 pr-6 outline-none transition-all font-bold text-slate-700" 
                  placeholder="admin@domopro.com" 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Clave de Seguridad</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  required 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl py-4 pl-14 pr-14 outline-none transition-all font-bold text-slate-700" 
                  placeholder="••••••••" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-5 top-4 text-slate-300 hover:text-blue-600 px-1"
                >
                  {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-center gap-3 animate-shake">
                <AlertCircle className="text-red-500 shrink-0" size={20} />
                <p className="text-red-700 text-xs font-bold uppercase tracking-tight">{error}</p>
              </div>
            )}

            <button 
              disabled={loading} 
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-blue-600 active:scale-[0.97] transition-all flex items-center justify-center gap-3 disabled:opacity-70 shadow-xl shadow-slate-900/20"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={22} />
              ) : (
                "Entrar al Sistema"
              )}
            </button>
          </form>
        </div>
        
        <p className="text-center mt-8 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
          Desarrollado para Control de Infraestructura Crítica
        </p>
      </div>
    </div>
  );
};

export default Login;