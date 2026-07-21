import React from 'react';

export interface CheckboxFilterOption {
  value: string;
  label: string;
}

export interface CheckboxFilterGroupProps {
  label: string;
  options: CheckboxFilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  /** 'multiple' (checkboxes, default) o 'single' (radios, para opciones excluyentes entre sí). */
  mode?: 'multiple' | 'single';
}

/**
 * Lista simple de checkboxes/radios, siempre visible (sin popover anidado), con filas
 * generosas para tocar en mobile. Usado para reemplazar dropdowns anidados dentro del
 * panel de filtros de una página (ej. Estado, Tipo en Partidos).
 */
const CheckboxFilterGroup: React.FC<CheckboxFilterGroupProps> = ({
  label,
  options,
  selected,
  onChange,
  mode = 'multiple',
}) => {
  const toggle = (value: string) => {
    if (mode === 'single') {
      onChange([value]);
      return;
    }
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <div className="grid grid-cols-2 gap-x-3 rounded-lg border border-slate-200 p-1">
        {options.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <input
              type={mode === 'single' ? 'radio' : 'checkbox'}
              name={mode === 'single' ? label : undefined}
              checked={selected.includes(opt.value)}
              onChange={() => toggle(opt.value)}
              className={mode === 'single'
                ? 'h-4 w-4 flex-shrink-0 border-slate-300 text-brand-600 focus:ring-brand-500'
                : 'h-4 w-4 flex-shrink-0 rounded border-slate-300 text-brand-600 focus:ring-brand-500'}
            />
            <span className="truncate">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default CheckboxFilterGroup;
