import React from 'react';
import { Zap, Activity } from 'lucide-react';

const UserStats = ({ devices }) => {
  const activeCount = devices.filter(d => d.status).length;
  const totalConsumption = devices.reduce((acc, dev) => acc + (dev.status ? (dev.consumption_base || 0) : 0), 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
        <Zap className="text-yellow-400 mb-1" size={20} />
        <p className="text-xs text-slate-400 uppercase tracking-wider">Consumo Actual</p>
        <p className="text-xl font-bold text-white">{totalConsumption} W</p>
      </div>
      <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
        <Activity className="text-blue-400 mb-1" size={20} />
        <p className="text-xs text-slate-400 uppercase tracking-wider">En Uso</p>
        <p className="text-xl font-bold text-white">{activeCount} Equipos</p>
      </div>
    </div>
  );
};

export default UserStats;