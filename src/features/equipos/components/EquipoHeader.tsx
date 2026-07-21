import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthContext';
import { useToast } from '../../../shared/components/Toast/ToastProvider';
import ModalBase from '../../../shared/components/ModalBase/ModalBase';
import { crearSolicitudEdicion } from '../../solicitudes/services/solicitudesEdicionService';
import type { Equipo, RedesSociales } from '../services/equipoService';
import { EquipoPlantelTab } from './EquipoPlantelTab';

interface EquipoHeaderProps {
  equipo: Equipo;
}

const MAX_ADMINS = 3;

const SOCIAL_ICONS: Record<keyof RedesSociales, { label: string; path: React.ReactNode }> = {
  instagram: {
    label: 'Instagram',
    path: (
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.332.014 7.052.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    ),
  },
  facebook: {
    label: 'Facebook',
    path: (
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a7.94 7.94 0 011.141.195v3.325a8.623 8.623 0 00-.653-.036 26.805 26.805 0 00-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 00-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647z" />
    ),
  },
  twitter: {
    label: 'X / Twitter',
    path: (
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    ),
  },
  tiktok: {
    label: 'TikTok',
    path: (
      <path d="M12.53.02C13.84 0 15.14.01 16.44.02c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    ),
  },
  youtube: {
    label: 'YouTube',
    path: (
      <path d="M23.499 6.203a3.01 3.01 0 00-2.119-2.129C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.38.529a3.01 3.01 0 00-2.119 2.129A31.36 31.36 0 000 12a31.36 31.36 0 00.501 5.797 3.01 3.01 0 002.119 2.129c1.875.529 9.38.529 9.38.529s7.505 0 9.38-.529a3.01 3.01 0 002.119-2.129A31.36 31.36 0 0024 12a31.36 31.36 0 00-.501-5.797zM9.545 15.568V8.432L15.818 12z" />
    ),
  },
};

export const EquipoHeader: React.FC<EquipoHeaderProps> = ({ equipo }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [actionLoading, setActionLoading] = useState(false);
  const [solicitudEnviada, setSolicitudEnviada] = useState(false);
  const [plantelAbierto, setPlantelAbierto] = useState(false);

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
    <>
      <div className="h-16 sm:h-28 bg-gradient-to-r from-slate-800 to-slate-900" />

      <div className="px-4 sm:px-8 pb-6 sm:pb-8">
        <div className="flex items-end gap-4 -mt-8 sm:-mt-14 mb-4">
          <div className="p-2 bg-white rounded-3xl shadow-md border border-slate-100 w-fit flex-shrink-0">
            <div className="h-[72px] w-[72px] sm:h-32 sm:w-32 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl sm:text-4xl font-bold text-slate-300 overflow-hidden border border-slate-100">
              {escudo ? (
                <img src={escudo} alt={equipo.nombre} className="h-full w-full object-cover" />
              ) : (
                equipo.nombre.charAt(0)
              )}
            </div>
          </div>
        </div>

        <div className="pb-4 sm:pb-5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-4xl font-extrabold text-slate-900 break-words">{equipo.nombre}</h1>
            {!equipo.fechaDisolucion && (
              <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Activo
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {equipo.ciudad && (
              <span className="text-sm sm:text-lg text-slate-500 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {equipo.ciudad}
              </span>
            )}
            {equipo.pais && (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                {equipo.pais}
              </span>
            )}
          </div>

          {(equipo.miembros ?? 0) > 0 && (
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs sm:text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span><strong className="text-slate-700">{equipo.miembros}</strong> en el plantel</span>
              </span>
              <button
                type="button"
                onClick={() => setPlantelAbierto(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-brand-200 hover:text-brand-600"
              >
                Ver plantel
              </button>
            </div>
          )}
        </div>

        {(equipo.sitioWeb || (equipo.redesSociales && Object.values(equipo.redesSociales).some(Boolean))) && (
          <div className="flex flex-wrap items-center gap-3 py-4 border-t border-slate-100">
            {equipo.sitioWeb && (
              <a
                href={equipo.sitioWeb.startsWith('http') ? equipo.sitioWeb : `https://${equipo.sitioWeb}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-brand-600 hover:underline mr-1"
              >
                Sitio web
              </a>
            )}
            {(Object.keys(SOCIAL_ICONS) as (keyof RedesSociales)[]).map((key) => {
              const url = equipo.redesSociales?.[key];
              if (!url) return null;
              const { label, path } = SOCIAL_ICONS[key];
              return (
                <a
                  key={key}
                  href={url.startsWith('http') ? url : `https://${url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    {path}
                  </svg>
                </a>
              );
            })}
          </div>
        )}

        {!esAdmin && (equipo.administradores?.length ?? 0) < MAX_ADMINS && (
          <details className="pt-4 border-t border-slate-100 group">
            <summary className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer list-none flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ¿Sos responsable de este equipo?
            </summary>
            <div className="mt-3 max-w-sm">
              {solicitudEnviada ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-100 rounded-lg w-fit">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-green-500"></span>
                  <span className="text-xs font-semibold text-green-700">Solicitud enviada</span>
                </div>
              ) : (
                <div className="p-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 space-y-3">
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
            </div>
          </details>
        )}
      </div>

      {plantelAbierto && (
        <ModalBase onClose={() => setPlantelAbierto(false)} title="Plantel" size="xl">
          <div className="p-4">
            <EquipoPlantelTab equipo={equipo} />
          </div>
        </ModalBase>
      )}
    </>
  );
};
