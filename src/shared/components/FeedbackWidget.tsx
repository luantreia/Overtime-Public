import { useState } from 'react';
import {
  ChatBubbleLeftEllipsisIcon,
  XMarkIcon,
  CheckCircleIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../app/providers/AuthContext';

const TIPOS = [
  { value: 'sugerencia', label: 'Sugerencia' },
  { value: 'bug',        label: 'Bug' },
  { value: 'pregunta',   label: 'Pregunta' },
  { value: 'otro',       label: 'Otro' },
] as const;

type Tipo = typeof TIPOS[number]['value'];

const API_BASE = process.env.REACT_APP_API_URL || 'https://overtime-ddyl.onrender.com/api';

export default function FeedbackWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<Tipo>('sugerencia');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!message.trim()) { setError('Escribí tu mensaje antes de enviar.'); return; }
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('overtime_token');
      await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: message.trim(),
          tipo,
          page: window.location.pathname,
          userName: user?.nombre,
        }),
      });
      setSent(true);
    } catch {
      setError('No se pudo enviar. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => { setSent(false); setMessage(''); setTipo('sugerencia'); setError(''); }, 300);
  };

  return (
    <>
      {/* Panel */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-80 rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-brand-600 text-white">
            <div className="flex items-center gap-2">
              <ChatBubbleLeftEllipsisIcon className="h-4 w-4" />
              <span className="text-sm font-bold">¿Tenés alguna sugerencia?</span>
            </div>
            <button onClick={handleClose} className="hover:bg-white/20 rounded-lg p-1 transition-colors">
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3">
            {sent ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircleIcon className="h-10 w-10 text-green-500 mx-auto" />
                <p className="font-bold text-slate-900">¡Gracias por tu feedback!</p>
                <p className="text-xs text-slate-500">Lo vamos a revisar pronto.</p>
                <button
                  onClick={handleClose}
                  className="mt-2 text-xs text-brand-600 hover:underline"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <>
                {/* Tipo */}
                <div className="flex flex-wrap gap-1.5">
                  {TIPOS.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setTipo(t.value)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                        tipo === t.value
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Textarea */}
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Contanos qué pensás, qué te confunde o qué mejorarías..."
                  rows={4}
                  maxLength={1000}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">{message.length}/1000</span>
                  {error && <span className="text-[11px] text-red-500">{error}</span>}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading || !message.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors"
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                  {loading ? 'Enviando...' : 'Enviar feedback'}
                </button>

                <p className="text-[11px] text-slate-400 text-center">
                  Página: <span className="font-mono">{window.location.pathname}</span>
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
        aria-label="Feedback"
        title="¿Tenés alguna sugerencia?"
      >
        {open
          ? <XMarkIcon className="h-5 w-5" />
          : <ChatBubbleLeftEllipsisIcon className="h-5 w-5" />
        }
      </button>
    </>
  );
}
