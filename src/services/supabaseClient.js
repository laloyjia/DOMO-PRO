import { createClient } from '@supabase/supabase-js';

// Extraemos las variables de entorno de Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validación de seguridad: Si faltan las variables, el sistema arroja un error claro
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las credenciales de Supabase en el archivo .env');
}

/**
 * Cliente centralizado de Supabase
 * Permite: Autenticación, Consultas (CRUD) y Real-time.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Función auxiliar para obtener el perfil del usuario actual
 * (Útil para validar si es Admin o Usuario Final)
 */
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  // Consultamos la tabla 'profiles' para obtener el rol
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  return { ...user, ...profile };
};