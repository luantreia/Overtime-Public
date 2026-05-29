import React from 'react';
import { NotificacionesPanel } from '../../../shared/features/notificaciones/components/NotificacionesPanel';

export default function MisSolicitudesPage() {
  return (
    <NotificacionesPanel
      title="Mis Solicitudes"
      description="Revisa el estado de tus solicitudes enviadas"
      allowedTipos={[
        'usuario-crear-jugador',
        'usuario-crear-equipo',
        'usuario-crear-organizacion',
        'jugador-claim',
      ]}
      entityType="none"
      scope="mine"
      canApprove={false}
      showCategoriaFilter={true}
      showEntidadFilter={false}
    />
  );
}
