import React, { useState } from 'react';
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/outline';

export interface FilterComboboxItem {
  id: string;
  label: string;
}

export interface FilterComboboxProps {
  items: FilterComboboxItem[];
  value: string;
  onChange: (id: string) => void;
  label: string;
  placeholder?: string;
}

export const FilterCombobox: React.FC<FilterComboboxProps> = ({ items, value, onChange, label, placeholder }) => {
  const [query, setQuery] = useState('');
  const selected = items.find((item) => item.id === value) || null;

  const filtered = query === ''
    ? items
    : items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <Combobox<FilterComboboxItem | null>
        value={selected}
        onChange={(item) => onChange(item?.id ?? '')}
        onClose={() => setQuery('')}
      >
        <div className="relative">
          <ComboboxInput
            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-2 border"
            displayValue={(item: FilterComboboxItem | null) => item?.label ?? ''}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
          />
          <ChevronUpDownIcon className="pointer-events-none absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        </div>
        <ComboboxOptions
          anchor="bottom start"
          transition
          className="z-20 mt-1 max-h-60 w-[var(--input-width)] overflow-auto rounded-lg bg-white py-1 shadow-lg border border-slate-200 empty:invisible"
        >
          {selected && (
            <ComboboxOption
              value={null}
              className="cursor-pointer select-none px-3 py-2 text-sm text-slate-500 hover:bg-slate-50"
            >
              Todos
            </ComboboxOption>
          )}
          {filtered.map((item) => (
            <ComboboxOption
              key={item.id}
              value={item}
              className="group flex items-center gap-2 cursor-pointer select-none px-3 py-2 text-sm text-slate-700 data-[focus]:bg-brand-50"
            >
              <CheckIcon className="invisible h-4 w-4 text-brand-600 group-data-[selected]:visible" />
              {item.label}
            </ComboboxOption>
          ))}
          {filtered.length === 0 && (
            <div className="px-3 py-2 text-sm text-slate-400">Sin resultados</div>
          )}
        </ComboboxOptions>
      </Combobox>
    </div>
  );
};

export default FilterCombobox;
