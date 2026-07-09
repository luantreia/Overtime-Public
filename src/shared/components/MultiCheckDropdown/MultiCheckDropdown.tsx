import React from 'react';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export interface MultiCheckOption {
  value: string;
  label: string;
}

export interface MultiCheckDropdownProps {
  options: MultiCheckOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  label: string;
}

export const MultiCheckDropdown: React.FC<MultiCheckDropdownProps> = ({ options, selected, onChange, label }) => {
  const toggle = (value: string) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <Popover className="relative">
        <PopoverButton className="flex w-full items-center justify-between rounded-lg border border-slate-300 shadow-sm sm:text-sm p-2 text-left text-slate-700 focus:border-brand-500 focus:ring-brand-500">
          <span>{selected.length ? `${label} (${selected.length})` : 'Todos'}</span>
          <ChevronDownIcon className="h-4 w-4 text-slate-400" />
        </PopoverButton>
        <PopoverPanel
          anchor="bottom start"
          transition
          className="z-20 mt-1 w-[var(--button-width)] rounded-lg bg-white py-1 shadow-lg border border-slate-200"
        >
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={() => toggle(opt.value)}
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              {opt.label}
            </label>
          ))}
        </PopoverPanel>
      </Popover>
    </div>
  );
};

export default MultiCheckDropdown;
