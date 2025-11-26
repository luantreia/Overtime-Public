import React, { useCallback } from 'react';
import { JugadorCard } from '../../../shared/components';
import { useEntity } from '../../../shared/hooks';
import { JugadorService, type Jugador } from '../services/jugadorService';

const Jugadores: React.FC = () => {
  const { data: jugadores, loading, error, refetch } = useEntity<Jugador[]>(
    useCallback(() => JugadorService.getAll(), [])
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600 mx-auto"></div>
          <p className="text-slate-600">Cargando jugadores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-600">Error al cargar jugadores: {error}</p>
          <button
            onClick={refetch}
            className="rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Jugadores</h1>
          <p className="mt-2 text-slate-600">Directorio de jugadores registrados</p>
        </div>

        {!jugadores || jugadores.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No hay jugadores disponibles</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {jugadores.map((jugador) => {
              const jugadorId = jugador._id || jugador.id;
              return (
              <JugadorCard
                key={jugadorId}
                jugador={jugador}
                variante="activo"
                actions={
                  <button
                    onClick={() => console.log('Ver detalles de', jugador.nombre)}
                    className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm text-white hover:bg-brand-700"
                  >
                    Ver detalles
                  </button>
                }
              />
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Jugadores;
