import React, { useState, useEffect, useCallback } from 'react';
import { 
  IdentificationIcon,
  ShieldCheckIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { AthleteRadar } from './AthleteRadar';
import { JugadorService, type Jugador } from '../services/jugadorService';
import { LoadingSpinner } from '../../../shared/components/LoadingSpinner';

interface DashboardMaestroProps {
  jugadorId: string;
  jugador: Jugador;
}

export const DashboardMaestro: React.FC<DashboardMaestroProps> = ({ jugadorId, jugador }) => {
  const [modalidad, setModalidad] = useState<string>('');
  const [categoria, setCategoria] = useState<string>('');
  const [radarData, setRadarData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchMaestroData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await JugadorService.getRadarStats(jugadorId, {
        modalidad: modalidad || undefined,
        categoria: categoria || undefined
      });
      setRadarData(data);
    } catch (err) {
      console.error("Error fetching maestro data", err);
    } finally {
      setLoading(false);
    }
  }, [jugadorId, modalidad, categoria]);

  useEffect(() => {
    fetchMaestroData();
  }, [fetchMaestroData]);

  const getRankName = (elo: number) => {
    if (elo >= 2200) return { name: 'Leyenda', color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200' };
    if (elo >= 2000) return { name: 'Diamante', color: 'text-cyan-600', bg: 'bg-cyan-100', border: 'border-cyan-200' };
    if (elo >= 1800) return { name: 'Platino', color: 'text-indigo-600', bg: 'bg-indigo-100', border: 'border-indigo-200' };
    if (elo >= 1600) return { name: 'Oro', color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200' };
    if (elo >= 1400) return { name: 'Plata', color: 'text-slate-500', bg: 'bg-slate-100', border: 'border-slate-200' };
    return { name: 'Bronce', color: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-200' };
  };

  const rank = radarData ? getRankName(radarData.elo) : null;

  return (
    <div className="space-y-6">
      {/* Selector de Categoria y Modalidad */}
      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider">
          <IdentificationIcon className="h-5 w-5" />
          <span>Filtros Maestro</span>
        </div>
        
        <div className="flex gap-2">
          <select 
            value={modalidad}
            onChange={(e) => setModalidad(e.target.value)}
            className="text-xs font-bold bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-brand-500 pr-8"
          >
            <option value="">Todas las Modalidades</option>
            <option value="Foam">Foam</option>
            <option value="Cloth">Cloth</option>
          </select>

          <select 
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="text-xs font-bold bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-brand-500 pr-8"
          >
            <option value="">Todas las Categorías</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Mixto">Mixto</option>
            <option value="Libre">Libre</option>
          </select>
        </div>
      </div>

      {loading && !radarData ? (
        <div className="h-64 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* CARTA DE JUGADOR */}
          <div className="relative overflow-hidden bg-white rounded-3xl border border-slate-200 shadow-xl group">
            {/* Fondo decorativo */}
            <div className={`absolute top-0 left-0 w-full h-32 opacity-10 ${rank?.bg || 'bg-brand-500'}`} />
            <div className="absolute top-4 right-4 h-24 w-24 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-700">
               <ShieldCheckIcon className="h-full w-full" />
            </div>

            <div className="p-8 relative">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Foto / Avatar con borde de Rango */}
                <div className={`h-32 w-32 rounded-full p-1 border-4 ${rank?.border || 'border-slate-200'} shadow-lg relative`}>
                  <div className="h-full w-full rounded-full overflow-hidden bg-slate-100">
                    {jugador.foto ? (
                      <img src={jugador.foto} alt={jugador.nombre} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-3xl font-black text-slate-300">
                        {jugador.nombre[0]}
                      </div>
                    )}
                  </div>
                  {/* Badge de ELO flotante */}
                  <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-xs font-black text-white shadow-lg ${rank?.color?.replace('text', 'bg') || 'bg-brand-600'}`}>
                    {radarData?.elo || 1500}
                  </div>
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <h2 className="text-2xl font-black text-slate-900 leading-tight">
                      {jugador.alias || jugador.nombre}
                    </h2>
                    {jugador.perfilReclamado && (
                      <ShieldCheckIcon className="h-5 w-5 text-blue-500" title="Perfil Verificado" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-400 mb-4">{jugador.alias ? jugador.nombre : 'Jugador Profesional'}</p>
                  
                  <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rango Actual</span>
                      <span className={`text-lg font-black ${rank?.color || 'text-slate-900'}`}>{rank?.name || 'Iniciante'}</span>
                    </div>
                    <div className="w-px h-10 bg-slate-100 hidden sm:block" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Karma Social</span>
                      <span className="text-lg font-black text-orange-500 flex items-center gap-1">
                        <StarIconSolid className="h-5 w-5" />
                        {radarData?.karma || 0}
                      </span>
                    </div>
                    <div className="w-px h-10 bg-slate-100 hidden sm:block" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Win Rate</span>
                      <span className="text-lg font-black text-emerald-600">{radarData?.winrate || 0}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Secundarios */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                 <div className="text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Partidos</p>
                    <p className="text-lg font-black text-slate-800">{radarData?.totalMatches || 0}</p>
                 </div>
                 <div className="text-center border-l border-slate-200">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Plaza</p>
                    <p className="text-lg font-black text-slate-800">{radarData?.plazaMatches || 0}</p>
                 </div>
              </div>

              {/* BARRAS DE PROGRESO (Radar Viejo) */}
              <div className="mt-8 space-y-4">
                {[
                  { label: 'Poder', value: radarData?.power, barClass: 'bg-brand-500' },
                  { label: 'Resistencia', value: radarData?.stamina, barClass: 'bg-blue-500' },
                  { label: 'Precisión', value: radarData?.precision, barClass: 'bg-indigo-500' },
                  { label: 'Consistencia', value: radarData?.consistency, barClass: 'bg-violet-500' },
                  { label: 'Versatilidad', value: radarData?.versatility, barClass: 'bg-purple-500' },
                ].map((stat, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                      <span className="text-xs font-black text-slate-700">{stat.value || 0}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${stat.barClass}`}
                        style={{ width: `${stat.value || 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ATHLETE RADAR */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden min-h-[400px]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FireIcon className="h-5 w-5 text-orange-500" />
                <h3 className="font-black text-slate-900 uppercase tracking-wider text-sm">Radar de Atleta</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 italic">Basado en últimos 30 días</span>
            </div>
            <div className="p-4 flex items-center justify-center">
              <AthleteRadar data={radarData} loading={loading} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
