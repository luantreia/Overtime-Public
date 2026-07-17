import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ModalBase from '../../../shared/components/ModalBase/ModalBase';
import Spinner from '../../../shared/components/ui/Spinner/Spinner';
import EmptyState from '../../../shared/components/EmptyState/EmptyState';
import PartidoCard from '../../../shared/components/PartidoCard/PartidoCard';
import { FaseService } from '../services/faseService';
import { PartidoService, type Partido } from '../../partidos/services/partidoService';
import {
  EquipoCompetenciaService,
  type JugadorTemporadaRoster,
  type ParticipacionFaseStat,
} from '../services/equipoCompetenciaService';

type Tab = 'plantel' | 'estadisticas' | 'partidos';

interface EquipoResumen {
  _id: string;
  nombre: string;
  escudo?: string;
}

interface TemporadaResumen {
  _id: string;
  nombre: string;
}

interface EquipoCompetenciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipo: EquipoResumen;
  competenciaId: string;
  temporadas: TemporadaResumen[];
}

const getInitials = (name: string) =>
  name.split(' ').map((t) => t[0]).join('').slice(0, 2).toUpperCase();

const TABS: { id: Tab; label: string }[] = [
  { id: 'plantel', label: 'Plantel' },
  { id: 'estadisticas', label: 'Estadísticas' },
  { id: 'partidos', label: 'Partidos' },
];

export const EquipoCompetenciaModal: React.FC<EquipoCompetenciaModalProps> = ({
  isOpen,
  onClose,
  equipo,
  competenciaId,
  temporadas,
}) => {
  const navigate = useNavigate();
  const [selectedTemporadaId, setSelectedTemporadaId] = useState(
    temporadas[temporadas.length - 1]?._id || ''
  );
  const [activeTab, setActiveTab] = useState<Tab>('plantel');

  const [roster, setRoster] = useState<JugadorTemporadaRoster[]>([]);
  const [loadingRoster, setLoadingRoster] = useState(false);

  const [stats, setStats] = useState<ParticipacionFaseStat[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);

  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loadingPartidos, setLoadingPartidos] = useState(false);

  useEffect(() => {
    if (!temporadas.some((t) => t._id === selectedTemporadaId)) {
      setSelectedTemporadaId(temporadas[temporadas.length - 1]?._id || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [temporadas]);

  useEffect(() => {
    if (!isOpen || !selectedTemporadaId) return;

    let cancelled = false;

    setLoadingRoster(true);
    EquipoCompetenciaService.getParticipacionTemporada(equipo._id, selectedTemporadaId)
      .then((pt) => (pt ? EquipoCompetenciaService.getRoster(pt._id) : []))
      .then((r) => { if (!cancelled) setRoster(r); })
      .catch(() => { if (!cancelled) setRoster([]); })
      .finally(() => { if (!cancelled) setLoadingRoster(false); });

    setLoadingStats(true);
    FaseService.getByTemporada(selectedTemporadaId)
      .then((fases) => Promise.all(fases.map((f) => EquipoCompetenciaService.getParticipacionesFase(f._id))))
      .then((results) => results.flat().filter((s) => s.participacionTemporada?.equipo?._id === equipo._id))
      .then((r) => { if (!cancelled) setStats(r); })
      .catch(() => { if (!cancelled) setStats([]); })
      .finally(() => { if (!cancelled) setLoadingStats(false); });

    setLoadingPartidos(true);
    PartidoService.getAll({ equipo: equipo._id, competencia: competenciaId, temporadaId: selectedTemporadaId })
      .then((p) => { if (!cancelled) setPartidos(p); })
      .catch(() => { if (!cancelled) setPartidos([]); })
      .finally(() => { if (!cancelled) setLoadingPartidos(false); });

    return () => { cancelled = true; };
  }, [isOpen, equipo._id, competenciaId, selectedTemporadaId]);

  const footer = useMemo(
    () => (
      <Link to={`/equipos/${equipo._id}`} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
        Ver perfil completo del equipo →
      </Link>
    ),
    [equipo._id]
  );

  if (!isOpen) return null;

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} size="xl" title={equipo.nombre} footer={footer}>
      <div className="p-6">
        <div className="mb-4">
          <label htmlFor="equipo-modal-temporada" className="block text-xs font-medium text-slate-500 mb-1">
            Temporada
          </label>
          <select
            id="equipo-modal-temporada"
            value={selectedTemporadaId}
            onChange={(e) => setSelectedTemporadaId(e.target.value)}
            className="block w-full max-w-xs rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm p-2 border"
            disabled={temporadas.length === 0}
          >
            {temporadas.length === 0 ? (
              <option value="">Sin temporadas</option>
            ) : (
              temporadas.map((t) => (
                <option key={t._id} value={t._id}>{t.nombre}</option>
              ))
            )}
          </select>
        </div>

        <div className="mb-6 border-b border-slate-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`${
                  activeTab === id
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                } whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'plantel' && (
          loadingRoster ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : roster.length === 0 ? (
            <EmptyState message="Todavía no hay plantel cargado para esta temporada." icon="👤" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {roster.map((r) => {
                const jugador = r.jugadorEquipo?.jugador;
                if (!jugador) return null;
                return (
                  <div key={r._id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    {jugador.foto ? (
                      <img src={jugador.foto} alt={jugador.nombre} className="h-9 w-9 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700 flex-shrink-0">
                        {getInitials(jugador.nombre)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{jugador.nombre}</p>
                      {jugador.alias && <p className="text-xs text-slate-500 truncate">{jugador.alias}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {activeTab === 'estadisticas' && (
          loadingStats ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : stats.length === 0 ? (
            <EmptyState message="Sin estadísticas registradas para esta temporada." icon="📊" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {stats.map((s) => (
                <div key={s._id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    {s.fase?.nombre || 'Fase'}{typeof s.posicion === 'number' ? ` · #${s.posicion}` : ''}
                  </p>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div><p className="text-lg font-bold text-slate-900">{s.partidosJugados}</p><p className="text-[10px] text-slate-400">PJ</p></div>
                    <div><p className="text-lg font-bold text-emerald-600">{s.partidosGanados}</p><p className="text-[10px] text-slate-400">PG</p></div>
                    <div><p className="text-lg font-bold text-red-600">{s.partidosPerdidos}</p><p className="text-[10px] text-slate-400">PP</p></div>
                    <div><p className="text-lg font-bold text-brand-600">{s.puntos}</p><p className="text-[10px] text-slate-400">Pts</p></div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'partidos' && (
          loadingPartidos ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : partidos.length === 0 ? (
            <EmptyState message="No hay partidos registrados para esta temporada." icon="🏐" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {partidos.map((p) => (
                <PartidoCard key={p.id} partido={p} onClick={() => navigate(`/partidos/${p.id}`)} />
              ))}
            </div>
          )
        )}
      </div>
    </ModalBase>
  );
};

export default EquipoCompetenciaModal;
