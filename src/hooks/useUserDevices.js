import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useUserDevices = () => {
  const [devices, setDevices] = useState([]);
  const [rooms, setRooms] = useState(['Todas']);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('properties')
        .select(`id, dependencies (id, name, devices (id, name, status, consumption_base, type))`)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      if (data) {
        setRooms(['Todas', ...data.dependencies.map(dep => dep.name)]);
        setDevices(data.dependencies.flatMap(dep => 
          dep.devices.map(dev => ({ ...dev, room: dep.name }))
        ));
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const toggleDevice = async (id, currentStatus) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, status: !currentStatus } : d));
    await supabase.from('devices').update({ status: !currentStatus }).eq('id', id);
  };

  useEffect(() => { fetchData(); }, []);

  return { devices, rooms, loading, toggleDevice };
};