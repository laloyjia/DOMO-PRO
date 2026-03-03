import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 1. Validación de seguridad para detectar el error de inmediato
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "❌ ERROR DE CONFIGURACIÓN EN SUPABASE:\n" +
    "Las variables de entorno no se están cargando correctamente.\n" +
    "Verifica que en Vercel se llamen EXACTAMENTE:\n" +
    "VITE_SUPABASE_URL\n" +
    "VITE_SUPABASE_ANON_KEY"
  );
}

// 2. Exportación del cliente con manejo de errores
export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);