import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

interface RadarData {
  power: number;
  stamina: number;
  precision: number;
  consistency: number;
  versatility: number;
}

interface AthleteRadarProps {
  data: RadarData;
  loading?: boolean;
}

export const AthleteRadar: React.FC<AthleteRadarProps> = ({ data, loading }) => {
  const chartData = [
    { subject: 'Poder', A: data.power, fullMark: 100 },
    { subject: 'Resistencia', A: data.stamina, fullMark: 100 },
    { subject: 'Precisión', A: data.precision, fullMark: 100 },
    { subject: 'Consistencia', A: data.consistency, fullMark: 100 },
    { subject: 'Versatilidad', A: data.versatility, fullMark: 100 },
  ];

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center bg-slate-50/50 rounded-xl border border-slate-100 animate-pulse">
        <div className="h-40 w-40 rounded-full border-4 border-slate-200 border-t-brand-400 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-64 sm:h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        {/* @ts-ignore - Workaround for Recharts TS2786 in React 18 */}
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            tick={false} 
            axisLine={false}
          />
          <Radar
            name="Atleta"
            dataKey="A"
            stroke="#4f46e5"
            strokeWidth={2}
            fill="#6366f1"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
