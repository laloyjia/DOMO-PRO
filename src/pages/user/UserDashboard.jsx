import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import DeviceCard from './DeviceCard';
import UserStats from './UserStats';
import { Loader2, LayoutGrid, Home as HomeIcon } from 'lucide-react';

const UserDashboard = () => {
  const [devices, setDevices] = useState([]);
  const [rooms, setRooms] = useState(['Todas']);
  const [activeRoom, setActiveRoom] = useState('Todas');
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Obtener nombre del perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();
      setUserName(profile?.name || 'Usuario');

      // 2. Obtener Propiedades del usuario
      const { data: properties } = await supabase
        .from('properties')
        .select('id')
        .eq('owner_id', user.id);

      const propIds = properties?.map(p => p.id) || [];

      // 3. Obtener Habitaciones de esas propiedades
      const { data: roomsData } = await supabase
        .from('rooms')
        .select('id, name')
        .in('property_id', propIds);

      const roomIds = roomsData?.map(r => r.id) || [];
      setRooms(['Todas', ...new Set(roomsData?.map(r => r.name) || [])]);

      // 4. Obtener Dispositivos de esas habitaciones
      const { data: devicesData } = await supabase
        .from('devices')
        .select('*, rooms(name)')
        .in('room_id', roomIds);

      // Normalizamos el nombre de la habitación para el filtro
      const normalizedDevices = devicesData?.map(d => ({
        ...d,
        room_name: d.rooms?.name || 'General'
      })) || [];

      setDevices(normalizedDevices);
    } catch (err) {
      console.error("Error cargando dashboard de usuario:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDevice = async (deviceId, currentStatus) => {
    const newStatus = !currentStatus;
    
    // Actualización Optimista (UI rápida)
    setDevices(prev => prev.map(d => 
      d.id === deviceId ? { ...d, status: newStatus } : d
    ));

    try {
      const { error } = await supabase
        .from('devices')
        .update({ 
          status: newStatus,
          last_activity: new Date().toISOString()
        })
        .eq('id', deviceId);

      if (error) throw error;
    } catch (err) {
      // Revertir si falla
      setDevices(prev => prev.map(d => 
        d.id === deviceId ? { ...d, status: currentStatus } : d
      ));
      alert("Error al comunicar con el dispositivo");
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <Loader2 className="animate-spin text-blue-500" size={40} />
      <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em]">Conectando con tu Hogar...</p>
    </div>
  );

  const filteredDevices = devices.filter(d => 
    activeRoom === 'Todas' || d.room_name === activeRoom
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <div className="flex items-center gap-3 mb-2">
           <HomeIcon className="text-blue-500" size={20} />
           <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">Mi <span className="text-blue-500">Hogar</span></h1>
        </div>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Bienvenido de vuelta, {userName}</p>
      </header>

      {/* Resumen de Consumo */}
      <UserStats devices={devices} />

      {/* Filtros de Habitaciones */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {rooms.map(room => (
          <button 
            key={room}
            onClick={() => setActiveRoom(room)}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeRoom === room 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'bg-slate-900 text-slate-500 border border-white/5 hover:bg-slate-800'
            }`}
          >
            {room}
          </button>
        ))}
      </div>

      {/* Grid de Dispositivos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDevices.map(device => (
          <DeviceCard 
            key={device.id} 
            device={device} 
            onToggle={() => toggleDevice(device.id, device.status)} 
          />
        ))}
        {filteredDevices.length === 0 && (
          <div className="col-span-full p-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
            <LayoutGrid className="mx-auto text-slate-700 mb-4" size={48} />
            <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">No hay dispositivos en esta zona</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;