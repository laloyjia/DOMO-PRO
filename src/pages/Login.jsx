import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, Mail, Loader2, ShieldCheck, AlertCircle, Eye, EyeOff, Terminal } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (error) setError(null);
  }, [email, password]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      // 1. HARD RESET: Limpiamos cualquier sesión fantasma antes de intentar el login
      await supabase.auth.signOut();
      
      // 2. Intento de autenticación
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (authError) throw authError;

      console.log("🔐 Auth Exitoso para ID:", authData.user.id);

      // 3. Validación de perfil con LOGS DE CONSOLA
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, name')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (profileError) {
        console.error("❌ Error de Supabase al leer perfil:", profileError);
        throw profileError;
      }

      console.log("📊 Perfil recuperado de la DB:", profile);

      if (!profile) {
        await supabase.auth.signOut();
        throw new Error("No se encontró un perfil para este usuario en la tabla 'profiles'.");
      }

      // Normalización del rol para evitar fallos por mayúsculas o espacios
      const userRole = profile.role?.toLowerCase().trim();
      console.log("🎯 Rol detectado y normalizado:", userRole);

      // 4. Navegación basada en lógica estricta
      if (userRole === 'admin') {
        console.log("🚀 Redirigiendo a ADMIN");
        navigate('/admin', { replace: true });
      } else {
        console.log("🚀 Redirigiendo a USER");
        navigate('/user', { replace: true });
      }

    } catch (err) {
      console.error("💥 Error en el proceso de Login:", err.message);
      const authMessages = {
        "Invalid login credentials": "ID o Llave Maestra incorrectos.",
        "Email not confirmed": "Correo electrónico no verificado.",
      };
      setError(authMessages[err.message] || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans selection:bg-blue-500/30">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)] overflow-hidden animate-in fade-in zoom-in duration-500">
        
        <div className="bg-slate-900 p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600"></div>
          <div className="w-20 h-20 bg-blue-600 rounded-[2.2rem] flex items-center justify-center mx-auto mb-6 rotate-6 shadow-2xl shadow-blue-500/40 transition-transform hover:rotate-0 duration-500">
            <ShieldCheck size={40} className="text-white" />
          </div>
          <h1 className="text-white text-3xl font-black italic uppercase tracking-tighter">
            Domo-Pro <span className="text-blue-500">OS</span>
          </h1>
          <div className="flex items-center justify-center gap-2 mt-3 opacity-50">
            <Terminal size={12} className="text-blue-400" />
            <p className="text-white text-[9px] font-black uppercase tracking-[0.4em]">Auth Terminal v2.6.0</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="p-10 space-y-7">
          {error && (
            <div className="bg-red-50 border-2 border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-[11px] font-black uppercase animate-shake">
              <AlertCircle size={20} className="shrink-0" />
              <span className="leading-tight">{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Identificador de Usuario</label>
            <div className="relative group">
              <Mail className="absolute left-5 top-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                required 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl py-4 pl-14 pr-4 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300" 
                placeholder="admin@domo.pro" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Llave Maestra</label>
            <div className="relative group">
              <Lock className="absolute left-5 top-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                required 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white rounded-2xl py-4 pl-14 pr-14 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300" 
                placeholder="••••••••" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-5 top-4 text-slate-300 hover:text-blue-600 transition-colors px-1"
              >
                {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
              </button>
            </div>
          </div>

          <button 
            disabled={loading} 
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-blue-600 active:scale-[0.97] transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={22} />
            ) : (
              <>
                <span>Acceder al Sistema</span>
                <ShieldCheck size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;