import React from 'react';

export interface IconToggleOption {
  value: string;
  icon: React.ReactNode;
  label: string;
}

export interface IconToggleProps {
  options: IconToggleOption[];
  value: string;
  onChange: (value: string) => void;
}

/**
 * Switch compacto solo-ícono para elegir entre modos de vista (ej. lista/calendario).
 * Pensado para integrarse en la misma fila que la barra de búsqueda + botón de filtros
 * (misma altura que ese botón), no como un bloque de navegación aparte.
 */
const IconToggle: React.FC<IconToggleProps> = ({ options, value, onChange }) => {
  return (
    <div className="flex-shrink-0 flex items-center gap-0.5 rounded-lg border border-slate-300 bg-white p-0.5 h-[38px]">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-label={opt.label}
          title={opt.label}
          className={`flex items-center justify-center h-full min-w-[34px] rounded-md text-base transition-colors ${
            value === opt.value ? 'bg-brand-600 text-white' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
};

export default IconToggle;
