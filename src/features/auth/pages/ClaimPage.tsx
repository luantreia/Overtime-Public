import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthContext';
import { useToast } from '../../../shared/components/Toast/ToastProvider';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';
import api from '../../../shared/api/client';

const ClaimPage: React.FC = () => {
  usePageTitle('Reclamar perfil');
  const { token } = useParams<{ token: string }>();
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [jugador, setJugador] = useState<{ nombre: string; alias?: string; foto?: string } | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(true);

  const [formData, setFormData] = useState({ nombre: '', email: '', password: '', confirmPassword: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const { jugador: preview } = await api.getClaimInvite(token);
        if (!cancelled) setJugador(preview);
      } catch (err: any) {
        if (!cancelled) setPreviewError(err?.message || 'Esta invitación ya no es válida');
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setSubmitting(false);
      return;
    }
    const { password } = formData;
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setSubmitting(false);
      return;
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      setError('La contraseña debe incluir mayúscula, minúscula y número');
      setSubmitting(false);
      return;
    }

    try {
      const response = await api.claimWithToken(token, formData);
      login(response.user, response.accessToken, response.refreshToken);
      addToast({
        type: 'success',
        title: '¡Perfil reclamado!',
        message: `Ya sos el dueño del perfil de ${jugador?.nombre ?? 'tu jugador'}.`,
      });
      navigate('/perfil?welcome=1');
    } catch (err: any) {
      setError(err?.message || 'No se pudo reclamar el perfil');
      addToast({ type: 'error', title: 'Error', message: err?.message || 'No se pudo reclamar el perfil' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-6 sm:p-8 backdrop-blur">
        <div className="mb-6 flex flex-col items-center">
          <img src="/logo.png" alt="Overtime Logo" className="h-20 w-auto mb-2" />
          {previewLoading && <p className="text-sm text-slate-200/80">Cargando invitación…</p>}
          {!previewLoading && previewError && (
            <>
              <h1 className="mt-2 text-xl font-semibold text-white">Invitación no disponible</h1>
              <p className="mt-2 text-center text-sm text-slate-200/80">{previewError}</p>
            </>
          )}
          {!previewLoading && jugador && (
            <>
              {jugador.foto && (
                <img src={jugador.foto} alt={jugador.nombre} className="mb-3 h-16 w-16 rounded-full object-cover" />
              )}
              <h1 className="mt-2 text-xl font-semibold text-white">Estás reclamando el perfil de {jugador.nombre}</h1>
              <p className="text-sm text-slate-200/80">Creá tu cuenta para tomar control de este perfil</p>
            </>
          )}
        </div>

        {!previewLoading && jugador && (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1 block text-sm text-white">Nombre completo</label>
              <input
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-slate-300 focus:border-brand-500 focus:outline-none"
                type="text"
                name="nombre"
                autoComplete="name"
                value={formData.nombre}
                onChange={handleChange}
                required
                placeholder="Tu nombre completo"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-white">Email</label>
              <input
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-slate-300 focus:border-brand-500 focus:outline-none"
                type="email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-white">Contraseña</label>
              <input
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-slate-300 focus:border-brand-500 focus:outline-none"
                type="password"
                name="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Mínimo 8 caracteres, con mayúscula, minúscula y número"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-white">Confirmar contraseña</label>
              <input
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-slate-300 focus:border-brand-500 focus:outline-none"
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Repite tu contraseña"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              className="w-full rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
              disabled={submitting}
              type="submit"
            >
              {submitting ? 'Reclamando perfil…' : 'Crear cuenta y reclamar perfil'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ClaimPage;
