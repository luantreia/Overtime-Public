import React from 'react';
import type { FormatoDodgeball } from '../types';

interface PdfDocumentCardProps {
  formato: FormatoDodgeball;
  archivo: string;
  tituloDocumento: string;
  fuente: string;
}

const ACCENTOS: Record<FormatoDodgeball, { emoji: string; badge: string; boton: string }> = {
  foam: { emoji: '🟠', badge: 'bg-sky-50 text-sky-700 border-sky-100', boton: 'bg-sky-600 hover:bg-sky-700' },
  cloth: { emoji: '🧵', badge: 'bg-amber-50 text-amber-700 border-amber-100', boton: 'bg-amber-600 hover:bg-amber-700' },
};

const PdfDocumentCard: React.FC<PdfDocumentCardProps> = ({ formato, archivo, tituloDocumento, fuente }) => {
  const acento = ACCENTOS[formato];
  const url = `/reglamentos/${archivo}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 sm:p-5">
        <div>
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${acento.badge}`}>
            <span aria-hidden="true">{acento.emoji}</span>
            {formato === 'foam' ? 'Foam' : 'Cloth'}
          </span>
          <h3 className="mt-2 text-base font-bold text-slate-900 sm:text-lg">{tituloDocumento}</h3>
          <p className="text-xs text-slate-500 sm:text-sm">Documento oficial de la {fuente}, en inglés.</p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex-1 rounded-lg px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors sm:flex-none ${acento.boton}`}
          >
            Abrir PDF
          </a>
          <a
            href={url}
            download
            className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:flex-none"
          >
            Descargar
          </a>
        </div>
      </div>

      {/* Vista previa embebida: solo desde tablet en adelante. En celular el visor de PDF nativo del
          navegador (al abrir en pestaña nueva) da mejor experiencia que un iframe chico. */}
      <div className="hidden sm:block">
        <iframe
          src={`${url}#view=FitH`}
          title={`${tituloDocumento} — vista previa`}
          className="h-[60vh] w-full"
        />
      </div>
    </div>
  );
};

export default PdfDocumentCard;
