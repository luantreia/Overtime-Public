import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { TablaPosiciones } from '../../../shared/components/TablaPosiciones/TablaPosiciones';
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState';
import { PartidoService } from '../../partidos/services/partidoService';
import type { Equipo } from '../services/equipoService';
import type { CategoriaActiva } from '../hooks/useEquipoCategoriasActivas';

interface EquipoResumenTabProps {
  equipo: Equipo;
  equipoId: string;
  categorias: CategoriaActiva[];
  loadingCategorias: boolean;
}

const resultadoPartido = (partido: any, equipoId: string): 'G' | 'P' | 'E' | null => {
  const esLocal = String(partido.equipoLocal?.id || partido.equipoLocal?._id) === String(equipoId);
  const esVisitante = String(partido.equipoVisitante?.id || partido.equipoVisitante?._id) === String(equipoId);
  if (!esLocal && !esVisitante) return null;
  const marcadorLocal = partido.marcadorLocal ?? 0;
  const marcadorVisitante = partido.marcadorVisitante ?? 0;
  if (marcadorLocal === marcadorVisitante) return 'E';
  const ganoLocal = marcadorLocal > marcadorVisitante;
  return (esLocal && ganoLocal) || (esVisitante && !ganoLocal) ? 'G' : 'P';
};

const FormaReciente: React.FC<{ equipoId: string; faseId: string }> = ({ equipoId, faseId }) => {
  const { data: partidos = [] } = useQuery({
    queryKey: ['equipo-forma-reciente', equipoId, faseId],
    queryFn: () => PartidoService.getAll({ equipo: equipoId, fase: faseId, estado: 'finalizado' }),
  });

  const ultimos = [...partidos]
    .sort((a, b) => new Date(b.fecha || 0).getTime() - new Date(a.fecha || 0).getTime())
    .slice(0, 5)
    .reverse();

  if (ultimos.length === 0) return null;

  const estilos: Record<'G' | 'P' | 'E', string> = {
    G: 'bg-emerald-500',
    P: 'bg-red-500',
    E: 'bg-slate-400',
  };

  return (
    <div className="flex items-center gap-1.5 mt-3">
      <span className="text-xs font-medium text-slate-500 mr-1">Forma reciente:</span>
      {ultimos.map((p, i) => {
        const r = resultadoPartido(p, equipoId);
        if (!r) return null;
        return (
          <span
            key={p.id || p._id || i}
            title={r === 'G' ? 'Ganado' : r === 'P' ? 'Perdido' : 'Empate'}
            className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${estilos[r]}`}
          >
            {r}
          </span>
        );
      })}
    </div>
  );
};

export const EquipoResumenTab: React.FC<EquipoResumenTabProps> = ({ equipo, categorias, loadingCategorias, equipoId }) => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center">
          <div className="text-2xl font-bold text-slate-900">{equipo.participaciontemporadas?.length || 0}</div>
          <div className="text-sm text-slate-500">Comp. Jugadas</div>
        </div>
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center">
          <div className="text-2xl font-bold text-slate-900">{equipo.competenciasGanadas || 0}</div>
          <div className="text-sm text-slate-500">Comp. Ganadas</div>
        </div>
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center">
          <div className="text-2xl font-bold text-slate-900">{equipo.equipopartido?.length || 0}</div>
          <div className="text-sm text-slate-500">Partidos Registrados</div>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="h-8 w-1 bg-brand-600 rounded-full"></span>
          Posición actual
        </h2>
        {loadingCategorias ? (
          <p className="text-sm text-slate-500">Cargando posiciones…</p>
        ) : categorias.length === 0 ? (
          <EmptyState message="Este equipo no está participando en ninguna competencia activa por el momento." />
        ) : (
          <div className="space-y-6">
            {categorias.map((cat) => (
              <div key={cat.faseId} className="p-4 bg-white border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                  <div>
                    <div className="font-semibold text-slate-900">{cat.competenciaNombre}</div>
                    <div className="text-xs text-slate-500">{cat.faseNombre}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-slate-900">{cat.posicion}° de {cat.total}</div>
                    <div className="text-xs text-slate-500">{cat.puntos} pts · {cat.partidosGanados}G {cat.partidosPerdidos}P</div>
                  </div>
                </div>
                <FormaReciente equipoId={equipoId} faseId={cat.faseId} />
                <div className="mt-4">
                  <TablaPosiciones faseId={cat.faseId} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
