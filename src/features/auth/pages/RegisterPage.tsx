import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthContext';
import { useToast } from '../../../shared/components/Toast/ToastProvider';

const RegisterPage: React.FC = () => {
  const { addToast } = useToast();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    // Validaciones según backend: mínimo 8, mayúscula, minúscula y número
    const password = formData.password;
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setLoading(false);
      return;
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      setError('La contraseña debe incluir mayúscula, minúscula y número');
      setLoading(false);
      return;
    }

    try {
      // Registrar usuario
      await register(formData.nombre, formData.email, formData.password);

      addToast({
        type: 'success',
        title: 'Registro exitoso',
        message: 'Tu cuenta ha sido creada correctamente. ¡Bienvenido!'
      });

      navigate('/');
    } catch (err: any) {
      let message = err?.message || 'Error al registrar usuario';
      // Si el backend devuelve errores de validación, mostrar el primero
      const details = err?.details;
      if (details && Array.isArray(details.errors) && details.errors.length > 0) {
        message = details.errors[0].message || message;
      }
      setError(message);
      addToast({
        type: 'error',
        title: 'Error en registro',
        message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur">
        <div className="mb-6 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 font-bold text-white">
            OT
          </div>
          <h1 className="mt-4 text-xl font-semibold text-white">Únete a Overtime</h1>
          <p className="text-sm text-slate-200/80">Crea tu cuenta para participar</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm text-white">Nombre completo</label>
            <input
              className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-slate-300 focus:border-brand-500 focus:outline-none"
              type="text"
              name="nombre"
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
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Repite tu contraseña"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            className="w-full rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            disabled={loading}
            type="submit"
          >
            {loading ? 'Enviando solicitud…' : 'Enviar solicitud de registro'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-200/80">
            ¿Ya tienes cuenta?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-brand-400 hover:text-brand-300 underline"
            >
              Inicia sesión
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;