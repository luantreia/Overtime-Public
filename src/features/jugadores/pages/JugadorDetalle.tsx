import React, { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEntity } from '../../../shared/hooks';
import { JugadorService, type Jugador } from '../services/jugadorService';

const JugadorDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: jugador, loading, error } = useEntity<Jugador>(
    useCallback(() => {
      if (!id) throw new Error('ID de jugador no proporcionado');
      return JugadorService.getById(id);
    }, [id])
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600 mx-auto"></div>
          <p className="text-slate-600">Cargando perfil del jugador...</p>
        </div>
      </div>
    );
  }

  if (error || !jugador) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-600">Error al cargar jugador: {error || 'No encontrado'}</p>
          <button 
            onClick={() => navigate('/jugadores')} 
            className="text-brand-600 hover:underline"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => navigate('/jugadores')} 
          className="mb-6 text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
        >
          ← Volver a jugadores
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header/Cover color */}
          <div className="h-32 bg-gradient-to-r from-brand-600 to-indigo-600"></div>
          
          <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-12 mb-6">
              <div className="p-1 bg-white rounded-2xl shadow-sm">
                <div className="h-24 w-24 rounded-xl bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-400 overflow-hidden border border-slate-100">
                  {jugador.foto ? (
                    <img src={jugador.foto} alt={jugador.nombre} className="h-full w-full object-cover" />
                  ) : (
                    jugador.nombre.charAt(0)
                  )}
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900">{jugador.nombre}</h1>
              {jugador.alias && (
                <p className="text-xl text-slate-500 font-medium">"{jugador.alias}"</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b">Información Personal</h2>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Género</dt>
                    <dd className="mt-1 text-sm text-slate-900 capitalize">{jugador.genero || 'No especificado'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Nacionalidad</dt>
                    <dd className="mt-1 text-sm text-slate-900">{jugador.nacionalidad || 'No especificada'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Edad</dt>
                    <dd className="mt-1 text-sm text-slate-900">{jugador.edad ? `${jugador.edad} años` : 'No especificada'}</dd>
                  </div>
                </dl>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b">Estadísticas</h2>
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                  <p className="text-sm text-slate-500 italic text-center">Las estadísticas detalladas estarán disponibles próximamente.</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JugadorDetalle;
