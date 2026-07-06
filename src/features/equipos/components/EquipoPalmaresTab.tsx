import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CompetenciaService } from '../../competencias/services/competenciaService';
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState';
import type { Equipo } from '../services/equipoService';

interface EquipoPalmaresTabProps {
  equipo: Equipo;
  equipoId: string;
}

export const EquipoPalmaresTab: React.FC<EquipoPalmaresTabProps> = ({ equipo, equipoId }) => {
  const competenciaIds = useMemo(() => {
    const ids = (equipo?.participaciontemporadas || [])
      .map((p: any) => p?.temporada?.competencia)
      .filter(Boolean)
      .map((c: any) => (typeof c === 'string' ? c : c?._id || c?.id));
    return Array.from(new Set(ids));
  }, [equipo]);

  const { data: competenciasMap = {} } = useQuery({
    queryKey: ['equipo-competencias-info', competenciaIds.join(',')],
    queryFn: async () => {
      const results = await Promise.all(
        competenciaIds.map((cid: string) => CompetenciaService.getById(cid).catch(() => null))
      );
      const map: Record<string, any> = {};
      results.forEach((comp, i) => {
        if (comp) map[competenciaIds[i]] = comp;
      });
      return map;
    },
    enabled: competenciaIds.length > 0,
  });

  const competenciasAgrupadas = useMemo(() => {
    const groups = new Map<string, { cid: string | undefined; comp: any; temporadas: any[] }>();
    (equipo?.participaciontemporadas || []).forEach((p: any) => {
      const cid = typeof p?.temporada?.competencia === 'string'
        ? p.temporada.competencia
        : (p?.temporada?.competencia?._id || p?.temporada?.competencia?.id);
      const key = cid || 'sin-competencia';
      if (!groups.has(key)) {
        groups.set(key, { cid, comp: cid ? competenciasMap[cid] : null, temporadas: [] });
      }
      groups.get(key)!.temporadas.push(p);
    });
    return Array.from(groups.values());
  }, [equipo, competenciasMap]);

  if ((equipo.participaciontemporadas?.length || 0) === 0) {
    return <EmptyState message="Este equipo aún no participa en ninguna competencia registrada." />;
  }

  return (
    <section>
      <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
        <span className="h-8 w-1 bg-brand-600 rounded-full"></span>
        Palmarés y trayectoria
      </h2>
      <div className="space-y-3">
        {competenciasAgrupadas.map(({ cid, comp, temporadas }) => {
          const organizacion = comp?.organizacion;

          return (
            <div key={cid || 'sin-competencia'} className="p-4 bg-white border border-slate-200 rounded-xl hover:border-brand-200 transition-colors">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 truncate">
                    {comp ? (
                      <Link to={`/competencias/${cid}`} className="hover:text-brand-600 hover:underline">
                        {comp.nombre}
                      </Link>
                    ) : (
                      <span>Competencia</span>
                    )}
                  </div>
                  {organizacion?.nombre && (
                    <Link
                      to={`/organizaciones/${organizacion._id || organizacion.id}`}
                      className="text-xs text-slate-500 hover:text-brand-600 hover:underline"
                    >
                      {organizacion.nombre}
                    </Link>
                  )}
                </div>
                <span className="flex-shrink-0 text-xs text-slate-400">
                  {temporadas.length} temporada{temporadas.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {temporadas.map((p: any) => {
                  const gano = p?.temporada?.ganador && String(p.temporada.ganador) === String(equipoId);
                  return (
                    <span
                      key={p._id}
                      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700"
                    >
                      {p.temporada?.nombre}
                      {gano && <span title="Campeón de esta temporada">🏆</span>}
                      <span className="text-slate-400 capitalize">· {p.estado || 'activo'}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
