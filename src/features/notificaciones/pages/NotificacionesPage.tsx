import React, { useMemo } from 'react';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';
import { NotificacionesPanel } from '../../../shared/features/notificaciones/components/NotificacionesPanel';
import { useJugador } from '../../../app/providers/JugadorContext';
import type { SolicitudEdicion } from '../../../shared/types/solicitudesEdicion';

const perteneceAlJugador = (s: SolicitudEdicion, jugadorId: string): boolean => {
  try {
    if (s.entidad === jugadorId) return true;
    const dp = s.datosPropuestos || {};
    return dp.jugadorId === jugadorId || dp.jugador === jugadorId || JSON.stringify(dp).includes(jugadorId);
  } catch {
    return false;
  }
};

const NotificacionesPage = () => {
  usePageTitle('Notificaciones');
  const { jugadorSeleccionado } = useJugador();

  const extraFilter = useMemo(() => {
    if (!jugadorSeleccionado) return undefined;
    const jugadorId = jugadorSeleccionado.id || '';
    return (s: SolicitudEdicion) => perteneceAlJugador(s, jugadorId);
  }, [jugadorSeleccionado]);

  if (!jugadorSeleccionado) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-slate-900">Notificaciones</h1>
          <p className="text-sm text-slate-500">Gestioná solicitudes del jugador por categoría.</p>
        </header>
        <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
          Seleccioná un jugador para ver sus notificaciones.
        </p>
      </div>
    );
  }

  return (
    <NotificacionesPanel
      title="Notificaciones"
      description="Gestioná solicitudes del jugador por categoría."
      entityType="jugador"
      scope="related"
      canApprove={true}
      showCategoriaFilter={true}
      showEntidadFilter={false}
      extraFilter={extraFilter}
    />
  );
};

export default NotificacionesPage;
