import React from 'react';
import type { FormatoDodgeball } from '../types';

interface FormatoToggleProps {
  formato: FormatoDodgeball;
  onChange: (formato: FormatoDodgeball) => void;
}

const OPCIONES: { value: FormatoDodgeball; label: string }[] = [
  { value: 'cloth', label: 'Cloth' },
  { value: 'foam', label: 'Foam' },
];

const FormatoToggle: React.FC<FormatoToggleProps> = ({ formato, onChange }) => (
  <div className="inline-flex rounded-lg border border-slate-300 bg-white p-1 text-sm font-medium">
    {OPCIONES.map((opcion) => (
      <button
        key={opcion.value}
        type="button"
        onClick={() => onChange(opcion.value)}
        className={`rounded-md px-4 py-1.5 transition-colors ${
          formato === opcion.value ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        {opcion.label}
      </button>
    ))}
  </div>
);

export default FormatoToggle;
