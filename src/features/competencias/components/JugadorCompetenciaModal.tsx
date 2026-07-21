import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ModalBase from '../../../shared/components/ModalBase/ModalBase';
import Spinner from '../../../shared/components/ui/Spinner/Spinner';
import EmptyState from '../../../shared/components/EmptyState/EmptyState';
import PartidoCard from '../../../shared/components/PartidoCard/PartidoCard';
import { TablaPosiciones } from '../../../shared/components/TablaPosiciones/TablaPosiciones';
import { Bracket } from '../../../shared/components/Bracket/Bracket';
import { FaseService } from '../services/faseService';
import { PartidoService, type Partido } from '../../partidos/services/partidoService';

type Tab = 'posiciones' | 'partidos';

interface JugadorResumen {
  _id: string;
  nombre: string;
  foto?: string;
}

interface TemporadaResumen {
  _id: string;
  nombre: string;
}

interface JugadorCompetenciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  jugador: JugadorResumen;
  competenciaId: string;
  temporadas: TemporadaResumen[];
  initialTemporadaId?: string;
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'posiciones', label: 'Posiciones' },
  { id: 'partidos', label: 'Partidos' },
];

export const JugadorCompetenciaModal: React.FC<JugadorCompetenciaModalProps> = ({
  isOpen,
  onClose,
  jugador,
  competenciaId,
  temporadas,
  initialTemporadaId,
}) => {
  const navigate = useNavigate();
  const [selectedTemporadaId, setSelectedTemporadaId] = useState(
    initialTemporadaId || temporadas[temporadas.length - 1]?._id || ''
  );
  const [activeTab, setActiveTab] = useState<Tab>('posiciones');

  const [lastFase, setLastFase] = useState<any>(null);
  const [faseMatches, setFaseMatches] = useState<Partido[]>([]);
  const [loadingFase, setLoadingFase] = useState(false);

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

    setLoadingFase(true);
    FaseService.getByTemporada(selectedTemporadaId)
      .then(async (fases) => {
        if (cancelled) return;
        const fase = fases[fases.length - 1] || null;
        setLastFase(fase);
        if (fase?.tipo === 'playoff') {
          const matches = await PartidoService.getByFaseId(fase._id);
          if (!cancelled) setFaseMatches(matches);
        } else if (!cancelled) {
          setFaseMatches([]);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLastFase(null);
          setFaseMatches([]);
        }
      })
      .finally(() => { if (!cancelled) setLoadingFase(false); });

    setLoadingPartidos(true);
    PartidoService.getAll({ jugador: jugador._id, competencia: competenciaId, temporadaId: selectedTemporadaId })
      .then((p) => { if (!cancelled) setPartidos(p); })
      .catch(() => { if (!cancelled) setPartidos([]); })
      .finally(() => { if (!cancelled) setLoadingPartidos(false); });

    return () => { cancelled = true; };
  }, [isOpen, jugador._id, competenciaId, selectedTemporadaId]);

  if (!isOpen) return null;

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} size="xl" title={jugador.nombre} className="w-full">
      <div className="p-4 sm:p-6">
        <div className="mb-4">
          <label htmlFor="jugador-modal-temporada" className="block text-xs font-medium text-slate-500 mb-1">
            Temporada
          </label>
          <select
            id="jugador-modal-temporada"
            value={selectedTemporadaId}
            onChange={(e) => setSelectedTemporadaId(e.target.value)}
            className="block w-full sm:max-w-xs rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm p-2 border"
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

        <div className="mb-6 border-b border-slate-200 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto">
          <nav className="-mb-px flex space-x-4 sm:space-x-8" aria-label="Tabs">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`${
                  activeTab === id
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                } whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium flex-shrink-0`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'posiciones' && (
          loadingFase ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : !lastFase ? (
            <EmptyState message="No hay fases registradas para esta temporada." icon="📋" />
          ) : (
            <div className="w-full -mx-4 px-4 sm:mx-0 sm:px-0">
              {lastFase.tipo === 'playoff' ? (
                <Bracket matches={faseMatches} />
              ) : (
                <TablaPosiciones faseId={lastFase._id} />
              )}
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

export default JugadorCompetenciaModal;
