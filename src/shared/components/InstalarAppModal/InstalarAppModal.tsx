import React from 'react';
import ModalBase from '../ModalBase/ModalBase';

interface InstalarAppModalProps {
  onClose: () => void;
}

type Plataforma = 'ios' | 'android' | 'otro';

const detectarPlataforma = (): Plataforma => {
  const ua = navigator.userAgent || '';
  if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'otro';
};

const Paso: React.FC<{ numero: number; children: React.ReactNode }> = ({ numero, children }) => (
  <li className="flex items-start gap-3">
    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
      {numero}
    </span>
    <span className="text-sm text-slate-700">{children}</span>
  </li>
);

const InstalarAppModal: React.FC<InstalarAppModalProps> = ({ onClose }) => {
  const plataforma = detectarPlataforma();

  return (
    <ModalBase onClose={onClose} title="Instalá Overtime en tu dispositivo" size="sm">
      <div className="space-y-6 p-6">
        <p className="text-sm text-slate-500">
          Agregá Overtime a tu pantalla de inicio para acceder como si fuera una app, sin pasar por el navegador.
        </p>

        {plataforma === 'ios' && (
          <div>
            <p className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
              <span aria-hidden="true">📱</span> En iPhone / iPad (Safari)
            </p>
            <ol className="space-y-3">
              <Paso numero={1}>
                Tocá el ícono de <strong>Compartir</strong> (el cuadrado con la flecha hacia arriba) en la barra inferior.
              </Paso>
              <Paso numero={2}>
                Deslizá y elegí <strong>"Agregar a inicio"</strong>.
              </Paso>
              <Paso numero={3}>
                Confirmá tocando <strong>"Agregar"</strong> arriba a la derecha.
              </Paso>
            </ol>
            <p className="mt-4 text-xs text-slate-400">
              Nota: esto solo funciona desde Safari. Si estás en Chrome o Instagram, abrí este sitio en Safari primero.
            </p>
          </div>
        )}

        {plataforma === 'android' && (
          <div>
            <p className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
              <span aria-hidden="true">🤖</span> En Android (Chrome)
            </p>
            <ol className="space-y-3">
              <Paso numero={1}>
                Tocá el menú <strong>⋮</strong> (tres puntos) arriba a la derecha.
              </Paso>
              <Paso numero={2}>
                Elegí <strong>"Instalar app"</strong> o <strong>"Agregar a pantalla de inicio"</strong>.
              </Paso>
              <Paso numero={3}>
                Confirmá en el diálogo que aparece.
              </Paso>
            </ol>
          </div>
        )}

        {plataforma === 'otro' && (
          <div>
            <p className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
              <span aria-hidden="true">💻</span> En computadora (Chrome / Edge)
            </p>
            <ol className="space-y-3">
              <Paso numero={1}>
                Buscá el ícono de instalación <strong>⊕</strong> en la barra de direcciones, a la derecha.
              </Paso>
              <Paso numero={2}>
                Hacé click y confirmá <strong>"Instalar"</strong>.
              </Paso>
            </ol>
            <p className="mt-4 text-xs text-slate-400">
              Desde el celular: en iPhone usá Safari y en Android usá Chrome para ver la opción de instalar.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Entendido
        </button>
      </div>
    </ModalBase>
  );
};

export default InstalarAppModal;
