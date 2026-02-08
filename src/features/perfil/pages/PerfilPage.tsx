import { useState } from 'react';
import { useAuth } from '../../../app/providers/AuthContext';
import { useToast } from '../../../shared/components/Toast/ToastProvider';
import SolicitudModal from '../../../shared/components/SolicitudModal/SolicitudModal';
import { SolicitudEdicionTipo } from '../../../shared/types/solicitudesEdicion';

const PerfilPage = () => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [isSolicitudOpen, setIsSolicitudOpen] = useState(false);
  const [prefillTipo, setPrefillTipo] = useState<SolicitudEdicionTipo | undefined>(undefined);
  const [prefillDatos, setPrefillDatos] = useState<Record<string, any>>({});

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
    addToast({
      type: 'success',
      title: 'Solicitud enviada',
      message: 'Tu solicitud ha sido enviada y será revisada por un administrador.'
    });
    handleCloseSolicitud();
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Mi Perfil</h1>
          <p className="mt-2 text-slate-600">Gestiona tu cuenta y participa en la comunidad</p>
        </div>

        {/* User Info Card */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Información de la cuenta</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Nombre</label>
              <p className="mt-1 text-slate-900">{user.nombre}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <p className="mt-1 text-slate-900">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Rol</label>
              <p className="mt-1 text-slate-900 capitalize">{user.rol}</p>
            </div>
          </div>
        </div>

        {/* Solicitudes Section */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Crear solicitudes</h2>
          <p className="text-slate-600 mb-6">
            Como miembro de la comunidad, puedes solicitar la creación de nuevos jugadores, equipos o competencias.
            Todas las solicitudes son revisadas por administradores antes de ser aprobadas.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button
              onClick={() => openSolicitud('usuario-crear-jugador')}
              className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-slate-300 p-6 text-center transition hover:border-brand-500 hover:bg-brand-50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                👤
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Crear Jugador</h3>
                <p className="text-sm text-slate-600">Solicitar registro de un nuevo jugador</p>
              </div>
            </button>

            <button
              onClick={() => openSolicitud('usuario-crear-equipo')}
              className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-slate-300 p-6 text-center transition hover:border-brand-500 hover:bg-brand-50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                👥
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Crear Equipo</h3>
                <p className="text-sm text-slate-600">Solicitar registro de un nuevo equipo</p>
              </div>
            </button>

            <button
              onClick={() => openSolicitud('usuario-crear-competencia')}
              className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-slate-300 p-6 text-center transition hover:border-brand-500 hover:bg-brand-50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                🏆
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Crear Competencia</h3>
                <p className="text-sm text-slate-600">Solicitar registro de una nueva competencia</p>
              </div>
            </button>
          </div>
        </div>

        {/* Admin Requests Section */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Solicitar administración</h2>
          <p className="text-slate-600 mb-6">
            Si eres representante o administrador de un jugador, equipo u organización existente,
            puedes solicitar permisos para gestionarlos.
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
              <div>
                <h3 className="font-semibold text-slate-900">Solicitar admin de Jugador</h3>
                <p className="text-sm text-slate-600">Si eres representante de un jugador registrado</p>
              </div>
              <button
                onClick={() => openSolicitud('usuario-solicitar-admin-jugador')}
                className="rounded-lg bg-slate-600 px-4 py-2 text-sm text-white hover:bg-slate-700"
              >
                Solicitar
              </button>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
              <div>
                <h3 className="font-semibold text-slate-900">Solicitar admin de Equipo</h3>
                <p className="text-sm text-slate-600">Si eres representante de un equipo registrado</p>
              </div>
              <button
                onClick={() => openSolicitud('usuario-solicitar-admin-equipo')}
                className="rounded-lg bg-slate-600 px-4 py-2 text-sm text-white hover:bg-slate-700"
              >
                Solicitar
              </button>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
              <div>
                <h3 className="font-semibold text-slate-900">Solicitar admin de Organización</h3>
                <p className="text-sm text-slate-600">Si eres representante de una organización registrada</p>
              </div>
              <button
                onClick={() => openSolicitud('usuario-solicitar-admin-organizacion')}
                className="rounded-lg bg-slate-600 px-4 py-2 text-sm text-white hover:bg-slate-700"
              >
                Solicitar
              </button>
            </div>
          </div>
        </div>

        {/* Logout Section */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Sesión</h2>
          <button
            onClick={logout}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Solicitud Modal */}
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
