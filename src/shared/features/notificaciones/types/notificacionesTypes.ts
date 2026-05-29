import type { SolicitudEdicionTipo, SolicitudEdicionEstado, SolicitudEdicion } from '../../../../types/solicitudesEdicion';

export type EntityType = 'organizacion' | 'equipo' | 'jugador' | 'none';
export type Scope = 'mine' | 'related' | 'aprobables';

export interface NotificacionesPanelProps {
  title: string;
  description?: string;
  allowedTipos: readonly SolicitudEdicionTipo[];
  entityType: EntityType;
  scope?: Scope;
  canApprove: boolean;
  showCategoriaFilter?: boolean;
  showEntidadFilter?: boolean;
}

export interface NotificacionFilterState {
  estado: string;
  categoria: string;
  entidad: string;
  query: string;
  soloMisSolicitudes: boolean;
  autoRefresh: boolean;
}

export interface NotificacionCategoriaConfig {
  categoriasDisponibles: readonly string[];
  categoriaDeTipo: (tipo: SolicitudEdicionTipo) => string;
  labelTipo: (tipo: SolicitudEdicionTipo) => string;
}

export interface UseNotificacionesConfigResult extends NotificacionCategoriaConfig {
  allowedTipos: readonly SolicitudEdicionTipo[];
  canApprove: boolean;
}

export interface AprobarButtonProps {
  solicitud: SolicitudEdicion;
  accionando: string | null;
  onAprobar: (solicitud: SolicitudEdicion) => void;
}

export interface NotificacionesFiltersProps {
  filters: NotificacionFilterState;
  onFiltersChange: (filters: NotificacionFilterState) => void;
  categoriasDisponibles: readonly string[];
  showCategoriaFilter?: boolean;
  showEntidadFilter?: boolean;
  onRefresh?: () => void;
  loading?: boolean;
}

export interface NotificacionesTableProps {
  solicitudes: SolicitudEdicion[];
  loading: boolean;
  error: string | null;
  filters: NotificacionFilterState;
  onFiltersChange: (filters: NotificacionFilterState) => void;
  categoriasDisponibles: readonly string[];
  categoriaDeTipo: (tipo: SolicitudEdicionTipo) => string;
  labelTipo: (tipo: SolicitudEdicionTipo) => string;
  canApprove: boolean;
  showCategoriaFilter?: boolean;
  showEntidadFilter?: boolean;
  onRefresh?: () => void;
  onAprobar: (solicitud: SolicitudEdicion) => void;
  onRechazar: (solicitud: SolicitudEdicion) => void;
  onViewDetails: (solicitud: SolicitudEdicion) => void;
}

export interface NotificacionesRowProps {
  solicitud: SolicitudEdicion;
  labelTipo: (tipo: SolicitudEdicionTipo) => string;
  canApprove: boolean;
  accionando: string | null;
  isExpanding: boolean;
  onToggleExpand: () => void;
  onAprobar: (solicitud: SolicitudEdicion) => void;
  onRechazar: (solicitud: SolicitudEdicion) => void;
  onViewDetails: (solicitud: SolicitudEdicion) => void;
}

export interface UseNotificacionesDataResult {
  loading: boolean;
  error: string | null;
  solicitudes: SolicitudEdicion[];
  aprobar: (solicitud: SolicitudEdicion) => Promise<void>;
  rechazar: (solicitud: SolicitudEdicion) => Promise<void>;
  refresh: () => void;
}
