import React, { useEffect, useState } from 'react';
import { authFetch } from '../../../utils/authFetch';

interface ParticipacionFase {
  id: string;
  participacionTemporada: {
    equipo: {
      nombre: string;
    };
  };
  grupo?: string;
  division?: string;
  puntos: number;
  partidosJugados: number;
  partidosGanados: number;
  partidosPerdidos: number;
  partidosEmpatados: number;
  diferenciaPuntos: number;
  posicion?: number;
}

interface TablaPosicionesProps {
  faseId?: string;
  participaciones?: ParticipacionFase[];
}

export const TablaPosiciones: React.FC<TablaPosicionesProps> = ({ faseId, participaciones: participacionesProp }) => {
  const [participaciones, setParticipaciones] = useState<ParticipacionFase[]>(participacionesProp || []);
  const [loading, setLoading] = useState(!participacionesProp);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (participacionesProp) {
      setParticipaciones(participacionesProp);
      setLoading(false);
      return;
    }

    const fetchParticipaciones = async () => {
      if (!faseId) return;
      try {
        const params = new URLSearchParams({ fase: faseId });
        const data = await authFetch<ParticipacionFase[]>(`/participacion-fase?${params.toString()}`, {
          useAuth: false, // Asumiendo que es público
        });
        setParticipaciones(data);
      } catch (err) {
        setError('Error al cargar la tabla de posiciones');
      } finally {
        setLoading(false);
      }
    };

    fetchParticipaciones();
  }, [faseId, participacionesProp]);

  if (loading) return <div>Cargando tabla de posiciones...</div>;
  if (error) return <div>{error}</div>;

  // Agrupar por grupo o división
  const agrupados: { [key: string]: ParticipacionFase[] } = {};
  participaciones.forEach((p) => {
    const key = p.grupo || p.division || 'general';
    if (!agrupados[key]) agrupados[key] = [];
    agrupados[key].push(p);
  });

  // Ordenar cada grupo por puntos descendente
  Object.keys(agrupados).forEach((key) => {
    agrupados[key].sort((a, b) => b.puntos - a.puntos);
  });

  return (
    <div className="tabla-posiciones w-full overflow-hidden">
      {Object.entries(agrupados).map(([key, lista]) => (
        <div key={key} className="mb-4 last:mb-0">
          {key !== 'general' && (
            <h3 className="text-xs font-bold mb-2 text-slate-400 uppercase tracking-widest px-1">
              {`Grupo/División: ${key}`}
            </h3>
          )}
          <div className="overflow-x-auto rounded-lg border border-slate-100 shadow-sm">
            <table className="min-w-full divide-y divide-slate-100 bg-white">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="py-2 px-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider w-8">#</th>
                  <th className="py-2 px-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Equipo</th>
                  <th className="py-2 px-3 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">PJ</th>
                  <th className="py-2 px-3 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">PG</th>
                  <th className="py-2 px-3 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">PP</th>
                  <th className="py-2 px-3 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Dif</th>
                  <th className="py-2 px-3 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pts</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-50">
                {lista.map((p, index) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-2 px-3 text-[11px] text-slate-400 font-medium text-center">{index + 1}</td>
                    <td className="py-2 px-3 text-[11px] text-slate-700 font-semibold truncate max-w-[120px]">
                      {p.participacionTemporada?.equipo?.nombre || 'Equipo desconocido'}
                    </td>
                    <td className="py-2 px-3 text-[11px] text-slate-600 text-center">{p.partidosJugados}</td>
                    <td className="py-2 px-3 text-[11px] text-emerald-600 text-center hidden sm:table-cell">{p.partidosGanados}</td>
                    <td className="py-2 px-3 text-[11px] text-red-600 text-center hidden sm:table-cell">{p.partidosPerdidos}</td>
                    <td className="py-2 px-3 text-[11px] text-slate-500 text-center hidden md:table-cell">
                      {p.diferenciaPuntos > 0 ? `+${p.diferenciaPuntos}` : p.diferenciaPuntos}
                    </td>
                    <td className="py-2 px-3 text-[11px] text-slate-900 text-center font-bold">{p.puntos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};