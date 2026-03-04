import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificación de variables de entorno
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ Error: Variables de entorno de Supabase no detectadas.");
}

export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,      // Mantiene la sesión al cerrar el navegador
      autoRefreshToken: true,     // Renueva el token automáticamente
      detectSessionInUrl: true    // Necesario para confirmaciones de email/OAuth
    }
  }
);