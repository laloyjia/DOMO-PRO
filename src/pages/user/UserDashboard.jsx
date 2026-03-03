import React, { useState } from 'react';
import { useUserDevices } from '../../hooks/useUserDevices';
import DeviceCard from './DeviceCard';
import UserStats from './UserStats';
import { Loader2 } from 'lucide-react';

const UserDashboard = () => {
  const { devices, rooms, loading, toggleDevice } = useUserDevices();
  const [activeRoom, setActiveRoom] = useState('Todas');

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-500" size={48} />
    </div>
  );

  const filteredDevices = devices.filter(d => activeRoom === 'Todas' || d.room === activeRoom);

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Mi Hogar</h1>
        <p className="text-slate-400">Control de dispositivos</p>
      </header>

      <UserStats devices={devices} />

      {/* Filtros de Habitaciones */}
      <div className="flex gap-2 overflow-x-auto pb-6">
        {rooms.map(room => (
          <button 
            key={room}
            onClick={() => setActiveRoom(room)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              activeRoom === room ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {room}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDevices.map(dev => (
          <DeviceCard key={dev.id} device={dev} onToggle={toggleDevice} />
        ))}
      </div>
    </div>
  );
};

export default UserDashboard;