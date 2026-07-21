import React from 'react';

export interface SegmentedToggleOption<T extends string = string> {
  value: T;
  label: string;
}

export interface SegmentedToggleProps<T extends string = string> {
  options: SegmentedToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * Toggle de N opciones con el estilo estándar de la app (brand color).
 * Reemplaza implementaciones ad-hoc de "Lista/Calendario", "Todas/Por organización", etc.
 */
function SegmentedToggle<T extends string = string>({
  options,
  value,
  onChange,
  className = '',
}: SegmentedToggleProps<T>) {
  return (
    <div
      className={`inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm ${className}`}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
            value === option.value
              ? 'bg-brand-600 text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default SegmentedToggle;
