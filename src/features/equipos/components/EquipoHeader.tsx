import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PartidoCard from '../../../shared/components/PartidoCard';
import type { Partido } from '../../partidos/services/partidoService';
import { useAuth } from '../../../app/providers/AuthContext';
import { useToast } from '../../../shared/components/Toast/ToastProvider';
import { crearSolicitudEdicion } from '../../solicitudes/services/solicitudesEdicionService';
import type { Equipo } from '../services/equipoService';
import type { CategoriaActiva } from '../hooks/useEquipoCategoriasActivas';

interface EquipoHeaderProps {
  equipo: Equipo;
  proximoPartido?: Partido | null;
  categorias: CategoriaActiva[];
  onBack: () => void;
}

const MAX_ADMINS = 3;

export const EquipoHeader: React.FC<EquipoHeaderProps> = ({ equipo, proximoPartido, categorias, onBack }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [actionLoading, setActionLoading] = useState(false);
  const [solicitudEnviada, setSolicitudEnviada] = useState(false);
  const [showAdminRequest, setShowAdminRequest] = useState(false);

  const escudo = equipo.escudo || equipo.imagen;
  const equipoId = equipo._id || equipo.id;
  const esAdmin = user && (
    equipo.administradores?.some((a) => a?.toString() === user.id) ||
    equipo.creadoPor?.toString() === user.id
  );

  const handleRequestAdmin = async () => {
    if (!user || !equipoId) return;
    try {
      setActionLoading(true);
      await crearSolicitudEdicion({
        tipo: 'usuario-solicitar-admin-equipo',
        entidad: equipoId,
        datosPropuestos: { equipoId },
      });
      setSolicitudEnviada(true);
      addToast({
        type: 'success',
        title: 'Solicitud enviada',
        message: 'Tu solicitud para administrar este equipo fue enviada. Un administrador la revisará pronto.',
      });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <button
        onClick={onBack}
        className="mt-4 ml-6 text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
      >
        ← Volver a equipos
      </button>

      <div className="h-32 bg-gradient-to-r from-slate-800 to-slate-900 flex items-end justify-end p-6 -mt-6">
        {!equipo.fechaDisolucion && (
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

          {!esAdmin && (equipo.administradores?.length ?? 0) < MAX_ADMINS && (
            <div className="flex flex-col items-end gap-2">
              {solicitudEnviada ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-100 rounded-lg">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-green-500"></span>
                  <span className="text-xs font-semibold text-green-700">Solicitud enviada</span>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowAdminRequest((v) => !v)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all text-xs"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Datos desactualizados
                  </button>

                  {showAdminRequest && (
                    <div className="w-full sm:w-72 p-4 bg-white border border-slate-200 rounded-xl shadow-lg text-sm text-slate-600 space-y-3">
                      <p>Si sos responsable de este equipo, podés solicitar administración para mantener el perfil actualizado.</p>
                      {user ? (
                        <button
                          onClick={handleRequestAdmin}
                          disabled={actionLoading}
                          className="w-full py-2 bg-brand-600 text-white rounded-lg font-semibold text-xs hover:bg-brand-700 transition-all disabled:opacity-50"
                        >
                          {actionLoading ? 'Enviando...' : 'Solicitar administración'}
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate(`/register?redirect=/equipos/${equipoId}`)}
                          className="w-full py-2 bg-brand-600 text-white rounded-lg font-semibold text-xs hover:bg-brand-700 transition-all"
                        >
                          Registrate para solicitarlo
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900">{equipo.nombre}</h1>
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

          {(equipo.sitioWeb || (equipo.redesSociales && Object.values(equipo.redesSociales).some(Boolean))) && (
            <div className="flex flex-wrap items-center gap-3 mt-3">
              {equipo.sitioWeb && (
                <a
                  href={equipo.sitioWeb.startsWith('http') ? equipo.sitioWeb : `https://${equipo.sitioWeb}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-600 hover:underline"
                >
                  Sitio web
                </a>
              )}
              {([
                ['instagram', 'Instagram'],
                ['facebook', 'Facebook'],
                ['twitter', 'X / Twitter'],
                ['tiktok', 'TikTok'],
                ['youtube', 'YouTube'],
              ] as const).map(([key, label]) => {
                const url = equipo.redesSociales?.[key];
                if (!url) return null;
                return (
                  <a
                    key={key}
                    href={url.startsWith('http') ? url : `https://${url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand-600 hover:underline"
                  >
                    {label}
                  </a>
                );
              })}
            </div>
          )}

          {categorias.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {categorias.map((cat) => (
                <Link
                  key={cat.faseId}
                  to={`/equipos/${equipoId}?tab=resumen`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10 hover:bg-indigo-100 transition-colors"
                >
                  {cat.competenciaNombre}
                  <span className="text-indigo-400">·</span>
                  {cat.posicion}° de {cat.total}
                </Link>
              ))}
            </div>
          )}
        </div>

        {proximoPartido && (
          <div>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Próximo partido</h2>
            <PartidoCard
              partido={proximoPartido}
              variante="proximo"
              onClick={() => navigate(`/partidos/${(proximoPartido as any)._id || proximoPartido.id}`)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
