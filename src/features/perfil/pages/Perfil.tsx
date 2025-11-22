import React from 'react';

const Perfil: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Mi Perfil</h1>
        <p className="text-slate-600 mb-6">Gestiona tu información personal y configuración</p>

        <div className="border-t border-slate-200 pt-6">
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-2">Información Personal</h3>
              <p className="text-slate-600 text-sm">Tu información de perfil aparecerá aquí</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-2">Seguridad</h3>
              <p className="text-slate-600 text-sm">Cambiar contraseña y configuración de seguridad</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-2">Preferencias</h3>
              <p className="text-slate-600 text-sm">Gestiona tus preferencias y notificaciones</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
