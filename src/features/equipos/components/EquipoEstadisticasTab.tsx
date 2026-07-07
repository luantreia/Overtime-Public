import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PartidoCard from '../../../shared/components/PartidoCard';
import ModalBase from '../../../shared/components/ModalBase/ModalBase';
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState';
import { PartidoService, type Partido } from '../../partidos/services/partidoService';

interface EquipoEstadisticasTabProps {
  equipoId: string;
}

type HubCard = 'racha' | 'goleada' | 'progreso' | 'h2h';

const resultadoPartido = (partido: Partido, equipoId: string): 'G' | 'P' | 'E' | null => {
  const esLocal = String(partido.equipoLocal?.id || (partido.equipoLocal as any)?._id) === String(equipoId);
  const esVisitante = String(partido.equipoVisitante?.id || (partido.equipoVisitante as any)?._id) === String(equipoId);
  if (!esLocal && !esVisitante) return null;
  const marcadorLocal = partido.marcadorLocal ?? 0;
  const marcadorVisitante = partido.marcadorVisitante ?? 0;
  if (marcadorLocal === marcadorVisitante) return 'E';
  const ganoLocal = marcadorLocal > marcadorVisitante;
  return (esLocal && ganoLocal) || (esVisitante && !ganoLocal) ? 'G' : 'P';
};

const fechaValue = (p: Partido): number => {
  const date = p.fecha ? new Date(p.fecha) : null;
  return date && !Number.isNaN(date.getTime()) ? date.getTime() : 0;
};

const rivalDe = (p: Partido, equipoId: string): { id: string; nombre: string } | null => {
  const esLocal = String(p.equipoLocal?.id || (p.equipoLocal as any)?._id) === String(equipoId);
  const rival = esLocal ? p.equipoVisitante : p.equipoLocal;
  const rivalId = rival?.id || (rival as any)?._id;
  if (!rivalId) return null;
  return { id: String(rivalId), nombre: rival?.nombre || 'Rival' };
};

export const EquipoEstadisticasTab: React.FC<EquipoEstadisticasTabProps> = ({ equipoId }) => {
  const navigate = useNavigate();
  const [cardAbierta, setCardAbierta] = useState<HubCard | null>(null);
  const [rivalSeleccionado, setRivalSeleccionado] = useState<string | null>(null);

  const { data: partidos = [], isLoading } = useQuery({
    queryKey: ['equipo-estadisticas', equipoId],
    queryFn: () => PartidoService.getAll({ equipo: equipoId, estado: 'finalizado' }),
    enabled: !!equipoId,
  });

  const ordenadosAsc = useMemo(() => [...partidos].sort((a, b) => fechaValue(a) - fechaValue(b)), [partidos]);
  const ordenadosDesc = useMemo(() => [...ordenadosAsc].reverse(), [ordenadosAsc]);

  const { rachaActual, mayorRacha } = useMemo(() => {
    let actualTipo: 'G' | 'P' | 'E' | null = null;
    let actualLen = 0;
    let mejorG = 0;
    let corridaG = 0;

    ordenadosAsc.forEach((p) => {
      const r = resultadoPartido(p, equipoId);
      if (!r) return;
      if (r === actualTipo) actualLen++;
      else {
        actualTipo = r;
        actualLen = 1;
      }
      if (r === 'G') {
        corridaG++;
        mejorG = Math.max(mejorG, corridaG);
      } else {
        corridaG = 0;
      }
    });

    return { rachaActual: actualTipo ? { tipo: actualTipo, largo: actualLen } : null, mayorRacha: mejorG };
  }, [ordenadosAsc, equipoId]);

  const resultadoDestacado = useMemo((): { partido: Partido; diferencia: number } | null => {
    const victorias = ordenadosDesc
      .filter((p) => resultadoPartido(p, equipoId) === 'G')
      .map((partido) => ({ partido, diferencia: Math.abs((partido.marcadorLocal ?? 0) - (partido.marcadorVisitante ?? 0)) }));
    if (victorias.length === 0) return null;
    return victorias.reduce((mejor, actual) => (actual.diferencia > mejor.diferencia ? actual : mejor));
  }, [ordenadosDesc, equipoId]);

  const progresoPorTemporada = useMemo(() => {
    const map = new Map<string, { nombre: string; g: number; e: number; p: number }>();
    ordenadosDesc.forEach((partido) => {
      const temporada = (partido as any).fase?.temporada;
      const key = temporada?._id || 'sin-temporada';
      const nombre = temporada?.nombre || 'Sin temporada';
      if (!map.has(key)) map.set(key, { nombre, g: 0, e: 0, p: 0 });
      const r = resultadoPartido(partido, equipoId);
      const entry = map.get(key)!;
      if (r === 'G') entry.g++;
      else if (r === 'E') entry.e++;
      else if (r === 'P') entry.p++;
    });
    return Array.from(map.values());
  }, [ordenadosDesc, equipoId]);

  const rivales = useMemo(() => {
    const map = new Map<string, { nombre: string; partidos: Partido[] }>();
    partidos.forEach((p) => {
      const rival = rivalDe(p, equipoId);
      if (!rival) return;
      if (!map.has(rival.id)) map.set(rival.id, { nombre: rival.nombre, partidos: [] });
      map.get(rival.id)!.partidos.push(p);
    });
    return Array.from(map.entries())
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [partidos, equipoId]);

  const h2hSeleccionado = rivales.find((r) => r.id === rivalSeleccionado) || null;
  const h2hResumen = useMemo(() => {
    if (!h2hSeleccionado) return null;
    let g = 0, e = 0, p = 0;
    h2hSeleccionado.partidos.forEach((partido) => {
      const r = resultadoPartido(partido, equipoId);
      if (r === 'G') g++;
      else if (r === 'E') e++;
      else if (r === 'P') p++;
    });
    return { g, e, p };
  }, [h2hSeleccionado, equipoId]);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando estadísticas…</p>;
  }

  if (ordenadosAsc.length === 0) {
    return <EmptyState message="Este equipo todavía no tiene partidos finalizados con estadísticas cargadas." />;
  }

  const cards: { key: HubCard; icon: string; titulo: string; teaser: string; disponible: boolean }[] = [
    {
      key: 'racha',
      icon: '🔥',
      titulo: 'Racha',
      teaser: rachaActual ? `Actual: ${rachaActual.largo}${rachaActual.tipo} · Mejor racha ganadora: ${mayorRacha}` : 'Sin datos',
      disponible: true,
    },
    {
      key: 'goleada',
      icon: '⚽',
      titulo: 'Resultado más goleado',
      teaser: resultadoDestacado ? `Diferencia de ${resultadoDestacado.diferencia}` : 'Sin victorias registradas',
      disponible: !!resultadoDestacado,
    },
    {
      key: 'progreso',
      icon: '📈',
      titulo: 'Progreso por temporada',
      teaser: `${progresoPorTemporada.length} temporada${progresoPorTemporada.length !== 1 ? 's' : ''} con partidos`,
      disponible: true,
    },
    {
      key: 'h2h',
      icon: '🤝',
      titulo: 'Historial vs. un rival',
      teaser: `${rivales.length} rival${rivales.length !== 1 ? 'es' : ''} enfrentado${rivales.length !== 1 ? 's' : ''}`,
      disponible: rivales.length > 0,
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((card) => (
          <button
            key={card.key}
            disabled={!card.disponible}
            onClick={() => setCardAbierta(card.key)}
            className="text-left p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-brand-200 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm disabled:hover:border-slate-200"
          >
            <div className="text-2xl mb-2">{card.icon}</div>
            <div className="font-bold text-slate-900">{card.titulo}</div>
            <div className="text-sm text-slate-500 mt-1">{card.teaser}</div>
          </button>
        ))}

        <div
          title="Requiere datos agregados que hoy no expone el backend"
          className="text-left p-5 bg-slate-50 border border-dashed border-slate-200 rounded-xl opacity-60 cursor-not-allowed"
        >
          <div className="text-2xl mb-2">📊</div>
          <div className="font-bold text-slate-500">Comparativas avanzadas</div>
          <div className="text-sm text-slate-400 mt-1">Próximamente — rendimiento por set entre equipos</div>
        </div>
      </div>

      {cardAbierta === 'racha' && (
        <ModalBase onClose={() => setCardAbierta(null)} title="Racha" size="sm">
          <div className="p-5 space-y-4 text-center">
            <div>
              <div className="text-3xl font-bold text-slate-900">
                {rachaActual ? `${rachaActual.largo}${rachaActual.tipo}` : '—'}
              </div>
              <div className="text-sm text-slate-500">Racha actual</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-600">{mayorRacha}</div>
              <div className="text-sm text-slate-500">Mayor racha ganadora histórica</div>
            </div>
          </div>
        </ModalBase>
      )}

      {cardAbierta === 'goleada' && resultadoDestacado && (
        <ModalBase onClose={() => setCardAbierta(null)} title="Resultado más goleado" size="md">
          <div className="p-4">
            <PartidoCard
              partido={resultadoDestacado.partido}
              variante="resultado"
              onClick={() => navigate(`/partidos/${resultadoDestacado.partido.id || resultadoDestacado.partido._id}`)}
            />
          </div>
        </ModalBase>
      )}

      {cardAbierta === 'progreso' && (
        <ModalBase onClose={() => setCardAbierta(null)} title="Progreso por temporada" size="md">
          <div className="p-4 space-y-2">
            {progresoPorTemporada.map((t) => {
              const total = t.g + t.e + t.p;
              return (
                <div key={t.nombre} className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-900 text-sm">{t.nombre}</span>
                    <span className="text-xs text-slate-500">{total} partido{total !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden bg-slate-200">
                    {t.g > 0 && <div className="bg-emerald-500" style={{ width: `${(t.g / total) * 100}%` }} />}
                    {t.e > 0 && <div className="bg-slate-400" style={{ width: `${(t.e / total) * 100}%` }} />}
                    {t.p > 0 && <div className="bg-red-500" style={{ width: `${(t.p / total) * 100}%` }} />}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{t.g}G {t.e}E {t.p}P</div>
                </div>
              );
            })}
          </div>
        </ModalBase>
      )}

      {cardAbierta === 'h2h' && (
        <ModalBase onClose={() => { setCardAbierta(null); setRivalSeleccionado(null); }} title="Historial vs. un rival" size="lg">
          <div className="p-4 space-y-4">
            <select
              value={rivalSeleccionado || ''}
              onChange={(e) => setRivalSeleccionado(e.target.value || null)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Elegí un rival…</option>
              {rivales.map((r) => (
                <option key={r.id} value={r.id}>{r.nombre} ({r.partidos.length})</option>
              ))}
            </select>

            {h2hSeleccionado && h2hResumen && (
              <>
                <div className="flex items-center justify-center gap-6 py-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{h2hResumen.g}</div>
                    <div className="text-xs text-slate-500">Ganados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-700">{h2hResumen.e}</div>
                    <div className="text-xs text-slate-500">Empatados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{h2hResumen.p}</div>
                    <div className="text-xs text-slate-500">Perdidos</div>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[...h2hSeleccionado.partidos].sort((a, b) => fechaValue(b) - fechaValue(a)).map((p) => (
                    <PartidoCard
                      key={p.id || p._id}
                      partido={p}
                      variante="resultado"
                      onClick={() => navigate(`/partidos/${p.id || p._id}`)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </ModalBase>
      )}
    </div>
  );
};
