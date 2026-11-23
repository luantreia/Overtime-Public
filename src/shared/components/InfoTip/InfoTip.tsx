import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

/**
 * Ícono de "más info" con tooltip que funciona en touch.
 *
 * Los tooltips con `opacity-0 group-hover:opacity-100` no existen en un celular: no hay hover.
 * Aplicarles `[@media(hover:hover)]:opacity-0` tampoco sirve, porque en touch quedarían visibles
 * siempre, tapando lo de al lado. Este abre con hover en desktop y con toque o foco en cualquier
 * dispositivo, y se cierra con Escape o tocando afuera.
 */
type Props = {
  /** Texto accesible del botón (lo que anuncia el lector de pantalla). */
  label: string;
  children: ReactNode;
  /** Dónde aparece el globo respecto del ícono. */
  side?: 'top' | 'right';
  iconClassName?: string;
};

const POSICION: Record<NonNullable<Props['side']>, string> = {
  top: 'bottom-full left-0 mb-2',
  right: 'left-5 top-1/2 -translate-y-1/2',
};

export default function InfoTip({ label, children, side = 'top', iconClassName = 'h-3.5 w-3.5' }: Props) {
  const [abierto, setAbierto] = useState(false);
  const raiz = useRef<HTMLSpanElement>(null);
  const id = useId();

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: PointerEvent) => {
      if (raiz.current && !raiz.current.contains(e.target as Node)) setAbierto(false);
    };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setAbierto(false); };
    document.addEventListener('pointerdown', fuera);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('pointerdown', fuera);
      document.removeEventListener('keydown', esc);
    };
  }, [abierto]);

  return (
    <span ref={raiz} className="group/infotip relative inline-flex">
      <button
        type="button"
        aria-label={label}
        aria-expanded={abierto}
        aria-describedby={abierto ? id : undefined}
        onClick={(e) => { e.stopPropagation(); setAbierto((v) => !v); }}
        className="-m-2 inline-flex items-center justify-center p-2 text-muted transition-colors hover:text-brand-500 focus-visible:text-brand-600 focus-visible:outline-none [touch-action:manipulation]"
      >
        <InformationCircleIcon className={iconClassName} aria-hidden="true" />
      </button>
      <span
        id={id}
        role="tooltip"
        className={`absolute ${POSICION[side]} z-50 w-56 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-2xs font-normal normal-case leading-relaxed tracking-normal text-slate-100 shadow-xl transition-opacity motion-reduce:transition-none ${
          abierto
            ? 'visible opacity-100'
            : 'invisible opacity-0 [@media(hover:hover)]:group-hover/infotip:visible [@media(hover:hover)]:group-hover/infotip:opacity-100'
        }`}
      >
        {children}
      </span>
    </span>
  );
}
