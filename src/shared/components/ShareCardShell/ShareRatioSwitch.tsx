import React from 'react';

export type ShareRatio = 'card' | 'story' | 'square';

export const SHARE_RATIO_ASPECT: Record<ShareRatio, string> = {
  card: '3 / 4',
  story: '9 / 16',
  square: '1 / 1',
};

const OPTIONS: { value: ShareRatio; label: string }[] = [
  { value: 'card', label: 'Post (3:4)' },
  { value: 'story', label: 'Story (9:16)' },
  { value: 'square', label: 'Cuadrado (1:1)' },
];

interface ShareRatioSwitchProps {
  value: ShareRatio;
  onChange: (ratio: ShareRatio) => void;
}

export const ShareRatioSwitch: React.FC<ShareRatioSwitchProps> = ({ value, onChange }) => (
  <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-0.5">
    {OPTIONS.map(opt => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onChange(opt.value)}
        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
          value === opt.value ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);
