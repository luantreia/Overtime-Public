import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../app/providers/AuthContext';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';
import { useToast } from '../../../shared/components/Toast/ToastProvider';
import SolicitudModal from '../../../shared/components/SolicitudModal/SolicitudModal';
import { SolicitudEdicionTipo } from '../../../shared/types/solicitudesEdicion';
import { actualizarUsuario, cambiarPassword } from '../services/usuarioService';
import { getSolicitudesEdicion } from '../../solicitudes/services/solicitudesEdicionService';
import { JugadorService } from '../../jugadores/services/jugadorService';

const PerfilPage = () => {
  usePageTitle('Mi Perfil');
  const { user, logout, refreshProfile } = useAuth();
  const { addToast } = useToast();

  // Solicitud modal
  const [isSolicitudOpen, setIsSolicitudOpen] = useState(false);
  const [prefillTipo, setPrefillTipo] = useState<SolicitudEdicionTipo | undefined>(undefined);
  const [prefillDatos, setPrefillDatos] = useState<Record<string, any>>({});

  // Editar perfil
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ nombre: user?.nombre ?? '' });
  const [profileLoading, setProfileLoading] = useState(false);

  // Cambiar contraseña
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ passwordActual: '', passwordNueva: '', confirmar: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const { data: miJugador } = useQuery({
    queryKey: ['mi-jugador'],
    queryFn: () => JugadorService.getMyProfile(),
    enabled: !!user,
    retry: false,
  });

  const { data: solicitudesPendientes } = useQuery({
    queryKey: ['mis-solicitudes-pendientes'],
    queryFn: async () => {
      const res = await getSolicitudesEdicion({ estado: 'pendiente', creadoPor: user!.id });
      return res.solicitudes?.length ?? 0;
    },
    enabled: !!user,
  });

  const openSolicitud = (tipo: SolicitudEdicionTipo, datos?: Record<string, any>) => {
    setPrefillTipo(tipo);
    setPrefillDatos(datos || {});
    setIsSolicitudOpen(true);
  };

  const handleCloseSolicitud = () => {
    setIsSolicitudOpen(false);
    setPrefillTipo(undefined);
    setPrefillDatos({});
  };

  const handleSolicitudSuccess = () => {
    addToast({ type: 'success', title: 'Solicitud enviada', message: 'Será revisada por un administrador.' });
    handleCloseSolicitud();
  };

  const handleSaveProfile = async () => {
    if (!profileForm.nombre.trim()) return;
    try {
      setProfileLoading(true);
      await actualizarUsuario({ nombre: profileForm.nombre });
      await refreshProfile();
      setIsEditingProfile(false);
      addToast({ type: 'success', title: 'Perfil actualizado', message: 'Tus datos fueron guardados.' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.passwordNueva !== passwordForm.confirmar) {
      addToast({ type: 'error', title: 'Error', message: 'Las contraseñas no coinciden.' });
      return;
    }
    if (passwordForm.passwordNueva.length < 8) {
      addToast({ type: 'error', title: 'Error', message: 'La contraseña debe tener al menos 8 caracteres.' });
      return;
    }
    try {
      setPasswordLoading(true);
      await cambiarPassword({ passwordActual: passwordForm.passwordActual, passwordNueva: passwordForm.passwordNueva });
      setPasswordForm({ passwordActual: '', passwordNueva: '', confirmar: '' });
      setIsChangingPassword(false);
      addToast({ type: 'success', title: 'Contraseña actualizada', message: 'Tu contraseña fue cambiada correctamente.' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center"><p>Cargando...</p></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-slate-900">Mi Perfil</h1>
          <p className="mt-1 text-sm text-slate-500">Gestioná tu cuenta y tu participación en la comunidad</p>
        </div>

        {/* Info de cuenta */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-brand-100 flex items-center justify-center text-2xl font-black text-brand-600">
                {user.nombre.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-lg leading-tight">{user.nombre}</p>
                <p className="text-sm text-slate-500">{user.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-slate-100 text-xs font-semibold text-slate-600 capitalize">{user.rol}</span>
              </div>
            </div>
            {!isEditingProfile && (
              <button
                onClick={() => { setProfileForm({ nombre: user.nombre }); setIsEditingProfile(true); }}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-all"
              >
                Editar
              </button>
            )}
          </div>

          {isEditingProfile && (
            <div className="border-t border-slate-100 pt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  value={profileForm.nombre}
                  onChange={e => setProfileForm(p => ({ ...p, nombre: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email</label>
                <p className="mt-1 text-sm text-slate-400">{user.email} <span className="text-xs">(no editable)</span></p>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSaveProfile}
                  disabled={profileLoading}
                  className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-all"
                >
                  {profileLoading ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Cambiar contraseña */}
          <div className="border-t border-slate-100 mt-5 pt-5">
            <button
              onClick={() => setIsChangingPassword(v => !v)}
              className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Cambiar contraseña
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${isChangingPassword ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isChangingPassword && (
              <div className="mt-4 space-y-3">
                {(['passwordActual', 'passwordNueva', 'confirmar'] as const).map((field) => (
                  <div key={field}>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      {field === 'passwordActual' ? 'Contraseña actual' : field === 'passwordNueva' ? 'Nueva contraseña' : 'Confirmar nueva'}
                    </label>
                    <input
                      type="password"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      value={passwordForm[field]}
                      onChange={e => setPasswordForm(p => ({ ...p, [field]: e.target.value }))}
                    />
                  </div>
                ))}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleChangePassword}
                    disabled={passwordLoading}
                    className="px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-900 disabled:opacity-50 transition-all"
                  >
                    {passwordLoading ? 'Guardando...' : 'Cambiar contraseña'}
                  </button>
                  <button
                    onClick={() => { setIsChangingPassword(false); setPasswordForm({ passwordActual: '', passwordNueva: '', confirmar: '' }); }}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mi perfil de jugador */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Mi perfil de jugador</h2>
          {miJugador ? (
            <Link
              to={`/jugadores/${miJugador._id || miJugador.id}`}
              className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50 transition-all group"
            >
              <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-400 overflow-hidden flex-shrink-0">
                {miJugador.foto
                  ? <img src={miJugador.foto} alt={miJugador.nombre} className="h-full w-full object-cover" />
                  : miJugador.nombre.charAt(0)
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 group-hover:text-brand-700 transition-colors">{miJugador.nombre}</p>
                {miJugador.alias && <p className="text-sm text-brand-600 font-medium">@{miJugador.alias}</p>}
                <p className="text-xs text-slate-400 capitalize">{miJugador.genero} · {miJugador.nacionalidad}</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-300 group-hover:text-brand-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-slate-600">No tenés un perfil de jugador vinculado.</p>
                <Link to="/jugadores" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                  Buscá tu perfil en el directorio →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Solicitudes pendientes */}
        <Link
          to="/solicitudes"
          className="flex items-center justify-between rounded-2xl bg-white p-6 shadow-sm border border-slate-100 hover:border-brand-200 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-slate-900">Mis solicitudes</p>
              <p className="text-xs text-slate-500">Revisá el estado de tus solicitudes enviadas</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!!solicitudesPendientes && solicitudesPendientes > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-black">
                {solicitudesPendientes} pendiente{solicitudesPendientes > 1 ? 's' : ''}
              </span>
            )}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-300 group-hover:text-brand-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Crear entidades */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Crear entidades</h2>
          <p className="text-xs text-slate-500 mb-5">Las solicitudes son revisadas por administradores antes de publicarse.</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { tipo: 'usuario-crear-jugador' as SolicitudEdicionTipo, label: 'Jugador', icon: '👤', color: 'bg-blue-50 text-blue-600' },
              { tipo: 'usuario-crear-equipo' as SolicitudEdicionTipo, label: 'Equipo', icon: '👥', color: 'bg-green-50 text-green-600' },
              { tipo: 'usuario-crear-organizacion' as SolicitudEdicionTipo, label: 'Organización', icon: '🏢', color: 'bg-purple-50 text-purple-600' },
            ].map(({ tipo, label, icon, color }) => (
              <button
                key={tipo}
                onClick={() => openSolicitud(tipo)}
                className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 p-4 text-center hover:border-brand-300 hover:bg-brand-50 transition-all"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${color}`}>{icon}</div>
                <span className="text-xs font-semibold text-slate-700">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Logout */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar sesión
          </button>
        </div>

      </div>

      <SolicitudModal
        isOpen={isSolicitudOpen}
        onClose={handleCloseSolicitud}
        prefillTipo={prefillTipo}
        prefillDatos={prefillDatos}
        onSuccess={handleSolicitudSuccess}
      />
    </div>
  );
};

export default PerfilPage;
