import React from 'react';

export interface FilterChip {
  key: string;
  label: string;
  onRemove: () => void;
}

export interface FilterBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  showFilters: boolean;
  onToggleFilters: () => void;
  activeFiltersCount: number;
  chips?: FilterChip[];
  children?: React.ReactNode;
}

/**
 * Barra de búsqueda + filtros colapsables estándar de la app pública.
 * - Input de búsqueda opcional (si no se pasan searchValue/onSearchChange, no se renderiza).
 * - Botón cuadrado de embudo con badge de filtros activos.
 * - Panel colapsable (children) con el contenido de filtros específico de cada página.
 * - Chips de filtros activos removibles debajo del panel.
 */
const FilterBar: React.FC<FilterBarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  showFilters,
  onToggleFilters,
  activeFiltersCount,
  chips = [],
  children,
}) => {
  const hasSearch = searchValue !== undefined && onSearchChange !== undefined;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        {hasSearch && (
          <div className="relative flex-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
              />
            </svg>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full rounded-lg border-slate-300 bg-white shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm py-2 pl-9 pr-3 border"
            />
          </div>
        )}
        <button
          onClick={onToggleFilters}
          className={`relative flex-shrink-0 flex items-center justify-center h-[38px] w-[38px] rounded-lg border transition-colors ${
            showFilters
              ? 'bg-brand-600 border-brand-600 text-white'
              : 'bg-white border-slate-300 text-slate-500 hover:text-slate-700'
          } ${hasSearch ? '' : 'ml-auto'}`}
          aria-label="Filtros"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {showFilters && children && (
        <div className="mt-2 bg-white p-3 rounded-xl shadow-sm border border-slate-200">
          {children}
        </div>
      )}

      {chips.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1 rounded-full bg-brand-50 border border-brand-200 px-3 py-0.5 text-xs font-medium text-brand-700"
            >
              {chip.label}
              <button onClick={chip.onRemove} className="ml-1 text-brand-400 hover:text-brand-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
