import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState';
import { EquipoService, type EquipoCategoriaJugador } from '../services/equipoService';

interface EquipoCategoriasTabProps {
  equipoId: string;
}

const JugadorCard: React.FC<{ jugador: EquipoCategoriaJugador; historico?: boolean }> = ({ jugador, historico }) => (
  <Link
    to={`/jugadores/${jugador.id}`}
    className={`flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm transition-colors ${
      historico ? 'opacity-75 hover:opacity-100' : 'hover:border-brand-200'
    }`}
  >
    <div className={`h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100 flex-shrink-0 ${historico ? 'grayscale' : ''}`}>
      {jugador.foto ? (
        <img src={jugador.foto} alt={jugador.nombre} className="h-full w-full object-cover" />
      ) : (
        <span className="text-xl font-bold text-slate-300">{jugador.nombre?.charAt(0) || '?'}</span>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <div className="font-bold text-slate-900 truncate">{jugador.nombre}</div>
      {jugador.alias && <div className="text-xs text-slate-500 truncate">{jugador.alias}</div>}
    </div>
  </Link>
);

export const EquipoCategoriasTab: React.FC<EquipoCategoriasTabProps> = ({ equipoId }) => {
  const [activeTab, setActiveTab] = useState<'actual' | 'historial'>('actual');

  const { data: grupos = [], isLoading } = useQuery({
    queryKey: ['equipo-categorias', equipoId],
    queryFn: () => EquipoService.getCategorias(equipoId),
    enabled: !!equipoId,
  });

  const gruposConJugadores = grupos.filter((g) =>
    activeTab === 'actual' ? g.jugadoresActuales.length > 0 : g.jugadoresHistorial.length > 0
  );

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando categorías…</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span className="h-8 w-1 bg-brand-600 rounded-full"></span>
          Categorías
        </h2>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('actual')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === 'actual' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Actual
          </button>
          <button
            onClick={() => setActiveTab('historial')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === 'historial' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Historial
          </button>
        </div>
      </div>

      {gruposConJugadores.length === 0 ? (
        <EmptyState
          message={
            activeTab === 'actual'
              ? 'No hay jugadores vigentes agrupados por modalidad y categoría en este equipo.'
              : 'No hay historial de jugadores por modalidad y categoría en este equipo.'
          }
        />
      ) : (
        <div className="space-y-6">
          {gruposConJugadores.map((grupo) => {
            const jugadores = activeTab === 'actual' ? grupo.jugadoresActuales : grupo.jugadoresHistorial;
            return (
              <section key={`${grupo.modalidad}|${grupo.categoria}`}>
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3">
                  <span className="h-5 w-1 bg-slate-300 rounded-full"></span>
                  {grupo.modalidad} · {grupo.categoria}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {jugadores.map((jugador) => (
                    <JugadorCard key={jugador.id} jugador={jugador} historico={activeTab === 'historial'} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};
