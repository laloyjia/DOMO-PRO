import React from 'react';
import { Lightbulb, Thermometer } from 'lucide-react';

const DeviceCard = ({ device, onToggle }) => {
  const isLight = device.type === 'light';

  return (
    <div 
      onClick={() => onToggle(device.id, device.status)}
      className={`p-5 rounded-3xl border transition-all cursor-pointer ${
        device.status ? 'bg-slate-800 border-blue-500 shadow-lg shadow-blue-500/10' : 'bg-slate-800/40 border-slate-700'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${device.status ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-500'}`}>
          {device.type === 'temp' ? <Thermometer size={24} /> : <Lightbulb size={24} />}
        </div>
        <div className={`w-12 h-6 rounded-full relative transition-colors ${device.status ? 'bg-blue-500' : 'bg-slate-600'}`}>
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${device.status ? 'left-7' : 'left-1'}`} />
        </div>
      </div>
      <h3 className="font-bold text-lg text-white">{device.name}</h3>
      <p className="text-sm text-slate-500">{device.room} • {device.status ? 'Encendido' : 'Apagado'}</p>
    </div>
  );
};

export default DeviceCard;