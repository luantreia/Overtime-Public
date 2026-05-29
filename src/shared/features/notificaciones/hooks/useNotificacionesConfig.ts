import type { SolicitudEdicionTipo } from '../../../../types/solicitudesEdicion';
import type { UseNotificacionesConfigResult } from '../types/notificacionesTypes';

const TIPO_CATEGORIAS: Record<string, string> = {
  // Creación de usuarios y entidades
  'usuario-crear-jugador': 'Mi Cuenta',
  'usuario-crear-equipo': 'Mi Cuenta',
  'usuario-crear-organizacion': 'Mi Cuenta',
  
  // Claims
  'jugador-claim': 'Mi Cuenta',
};

const TIPO_LABELS: Record<string, string> = {
  // Creación de usuarios y entidades
  'usuario-crear-jugador': 'Crear Jugador',
  'usuario-crear-equipo': 'Crear Equipo',
  'usuario-crear-organizacion': 'Crear Organización',
  
  // Claims
  'jugador-claim': 'Claim Jugador',
};

/**
 * Hook de configuración para NotificacionesPanel en Overtime-Public
 * Tipos: usuario-crear-*, jugador-claim
 * canApprove: false (usuarios normales no pueden aprobar)
 */
export const useNotificacionesConfig = (): UseNotificacionesConfigResult => {
  const allowedTipos: readonly SolicitudEdicionTipo[] = [
    'usuario-crear-jugador',
    'usuario-crear-equipo',
    'usuario-crear-organizacion',
    'jugador-claim',
  ];

  const categoriaDeTipo = (tipo: SolicitudEdicionTipo): string => {
    return TIPO_CATEGORIAS[tipo] || 'Otros';
  };

  const labelTipo = (tipo: SolicitudEdicionTipo): string => {
    return TIPO_LABELS[tipo] || tipo;
  };

  const categoriasDisponibles = ['Mi Cuenta', 'Otros'];

  return {
    allowedTipos,
    categoriaDeTipo,
    labelTipo,
    categoriasDisponibles,
    canApprove: false, // Público no puede aprobar
  };
};
