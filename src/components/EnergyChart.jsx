import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Registramos los componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const EnergyChart = () => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Ocultamos leyenda para un look más limpio
      },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f3f4f6' },
        ticks: { callback: (value) => `${value} kWh` }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  // Datos simulados (En la Fase 5 los traeremos de Supabase)
  const labels = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
  
  const data = {
    labels,
    datasets: [
      {
        fill: true,
        label: 'Consumo Energético',
        data: [65, 59, 80, 81, 56, 55, 40],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4, // Curva suavizada
        pointBackgroundColor: '#2563eb',
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-gray-800 text-lg">Consumo Semanal</h3>
          <p className="text-sm text-gray-500">Monitoreo de carga en tiempo real</p>
        </div>
        <span className="text-brand-success font-bold text-sm bg-green-50 px-3 py-1 rounded-full">
          -12% vs semana anterior
        </span>
      </div>
      <div className="h-64">
        <Line options={options} data={data} />
      </div>
    </div>
  );
};

export default EnergyChart;