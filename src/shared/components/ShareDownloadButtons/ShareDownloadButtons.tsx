import React from 'react';

export interface ShareDownloadButtonsProps {
  onShare: () => void;
  onDownload: () => void;
  loadingShare: boolean;
  loadingDownload: boolean;
  className?: string;
  hint?: string;
}

/**
 * Par de botones "Compartir" / "Descargar" consistente entre todos los modales de
 * exportar imagen (SharePartidoModal, ShareRankModal, ShareSynergyModal, etc.).
 */
export const ShareDownloadButtons: React.FC<ShareDownloadButtonsProps> = ({
  onShare,
  onDownload,
  loadingShare,
  loadingDownload,
  className = '',
  hint = 'Compartir abre el selector de apps en móvil',
}) => (
  <>
    <div className={`w-full flex gap-3 ${className}`}>
      <button
        onClick={onShare}
        disabled={loadingShare || loadingDownload}
        className="flex-1 py-3 rounded-xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-700 transition-all shadow active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loadingShare ? '…' : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M15.75 4.5a3 3 0 1 1 .825 2.066l-8.421 4.679a3.002 3.002 0 0 1 0 1.51l8.421 4.679a3 3 0 1 1-.729 1.31l-8.421-4.678a3 3 0 1 1 0-4.132l8.421-4.679a3 3 0 0 1-.096-.755Z" clipRule="evenodd" />
            </svg>
            Compartir
          </>
        )}
      </button>
      <button
        onClick={onDownload}
        disabled={loadingShare || loadingDownload}
        className="flex-1 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loadingDownload ? '…' : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
            </svg>
            Descargar
          </>
        )}
      </button>
    </div>
    <p className="mt-1.5 text-[10px] text-slate-400 text-center">{hint}</p>
  </>
);

export default ShareDownloadButtons;
