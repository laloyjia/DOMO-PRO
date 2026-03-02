import React from 'react';
import { Clock, User, Zap, Activity } from 'lucide-react';

const AdminHistory = () => {
  const logs = [
    { id: 1, user: 'Carlos Ruiz', action: 'Encendido Luces', area: 'Laboratorio A', time: 'Hace 5 min' },
    { id: 2, user: 'Ana Belén', action: 'Ajuste Termostato', area: 'Oficinas IT', time: 'Hace 12 min' },
    { id: 3, user: 'Sistema', action: 'Corte Programado', area: 'Planta 1', time: 'Hace 1 hora' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Historial de Actividad</h2>
        <div className="flex gap-2">
          <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Activity size={14} /> Tiempo Real
          </span>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-8 py-5">Usuario / Origen</th>
              <th className="px-8 py-5">Acción Ejecutada</th>
              <th className="px-8 py-5">Dependencia</th>
              <th className="px-8 py-5 text-right">Momento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-5 flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                    <User size={16} />
                  </div>
                  <span className="font-bold text-slate-700">{log.user}</span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                    <Zap size={14} className="text-yellow-500" />
                    {log.action}
                  </div>
                </td>
                <td className="px-8 py-5 text-sm text-slate-500">{log.area}</td>
                <td className="px-8 py-5 text-right text-xs font-bold text-slate-400">
                  <div className="flex items-center justify-end gap-1">
                    <Clock size={12} /> {log.time}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminHistory; // <--- ESTA LÍNEA CORRIGE EL ERROR