import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export interface BackButtonProps {
  /** Ruta a la que ir si la página se abrió directamente (sin historial previo en la app) */
  fallback: string;
  label?: string;
  className?: string;
}

/** Vuelve al historial de la app si existe; si la página se abrió directamente por URL, va a `fallback`. */
export function useSmartBack(fallback: string) {
  const navigate = useNavigate();
  const location = useLocation();

  return () => {
    // react-router asigna key="default" cuando no hay historial previo dentro de la app
    // (entrada directa por URL o refresh) — en ese caso navigate(-1) podría sacar al usuario del sitio.
    if (location.key === 'default') {
      navigate(fallback);
    } else {
      navigate(-1);
    }
  };
}

export const BackButton: React.FC<BackButtonProps> = ({ fallback, label = 'Volver', className = '' }) => {
  const handleClick = useSmartBack(fallback);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors ${className}`}
    >
      <span aria-hidden="true">←</span>
      {label}
    </button>
  );
};

export default BackButton;
