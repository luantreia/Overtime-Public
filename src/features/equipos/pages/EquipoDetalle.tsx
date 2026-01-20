import React, { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEntity } from '../../../shared/hooks';
import { EquipoService, type Equipo } from '../services/equipoService';

const EquipoDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: equipo, loading, error } = useEntity<Equipo>(
    useCallback(() => {
      if (!id) throw new Error('ID de equipo no proporcionado');
      return EquipoService.getById(id);
    }, [id])
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600 mx-auto"></div>
          <p className="text-slate-600">Cargando detalles del equipo...</p>
        </div>
      </div>
    );
  }

  if (error || !equipo) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-600">Error al cargar equipo: {error || 'No encontrado'}</p>
          <button 
            onClick={() => navigate('/equipos')} 
            className="text-brand-600 hover:underline"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  const escudo = equipo.escudo || equipo.imagen;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => navigate('/equipos')} 
          className="mb-6 text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
        >
          ← Volver a equipos
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header/Cover color */}
          <div className="h-40 bg-gradient-to-r from-slate-800 to-slate-900 flex items-end justify-end p-6">
             {equipo.activo && (
               <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                 Activo
               </span>
             )}
          </div>
          
          <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-16 mb-6">
              <div className="p-2 bg-white rounded-3xl shadow-md border border-slate-100">
                <div className="h-32 w-32 rounded-2xl bg-slate-50 flex items-center justify-center text-4xl font-bold text-slate-300 overflow-hidden border border-slate-100">
                  {escudo ? (
                    <img src={escudo} alt={equipo.nombre} className="h-full w-full object-cover" />
                  ) : (
                    equipo.nombre.charAt(0)
                  )}
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h1 className="text-4xl font-extrabold text-slate-900">{equipo.nombre}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-lg text-slate-500 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  {equipo.ciudad || 'Sede no especificada'}
                </span>
                {equipo.pais && (
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                    {equipo.pais}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                <div className="text-sm text-slate-500">Partidos Jugados</div>
              </div>
            </div>

            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="h-8 w-1 bg-brand-600 rounded-full"></span>
                  Información de la Organización
                </h2>
                <div className="bg-white rounded-xl p-6 border border-slate-200">
                  {equipo.organizacion ? (
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 font-bold">
                        {equipo.organizacion.nombre.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{equipo.organizacion.nombre}</div>
                        <div className="text-sm text-slate-500">Organización oficial</div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 italic">Equipo independiente / Sin organización asignada.</p>
                  )}
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                   <span className="h-8 w-1 bg-indigo-600 rounded-full"></span>
                   Plantel y Actividad
                </h2>
                <div className="bg-slate-50 rounded-2xl p-12 border border-slate-100 text-center">
                  <div className="mx-auto h-12 w-12 text-slate-300 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.998 5.998 0 00-12 0m12 0c0-1.657-1.343-3-3-3m-3 3c0-1.657-1.343-3-3-3m-3 3c0-1.657-1.343-3-3-3m-3 3a5.998 5.998 0 0112 0" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-900">Historial no disponible</h3>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2">
                    Próximamente podrás ver la lista de jugadores activos, próximos partidos y trofeos ganados por este equipo.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipoDetalle;
