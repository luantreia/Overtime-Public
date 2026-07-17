// Tipos para el componente unificado de Notificaciones
import type { SolicitudEdicionTipo, SolicitudEdicionEstado, SolicitudEdicion } from '../../../types/solicitudesEdicion';

// Tipo de entidad para filtrado
export type EntityType = 'organizacion' | 'equipo' | 'jugador' | 'none';

// Scope de las solicitudes
export type Scope = 'mine' | 'related' | 'aprobables';

// Props principales del componente NotificacionesPanel
export interface NotificacionesPanelProps {
  // Configuración general
  title: string;
  description?: string;

  // Filtro de tipos de solicitudes (solo estos tipos se mostrarán). Si se omite, no se filtra por tipo.
  allowedTipos?: readonly SolicitudEdicionTipo[];

  // Configuración de contexto
  entityType: EntityType;
  scope?: Scope;

  // Permisos - si false, solo puede ver (no aprobar/rechazar)
  canApprove: boolean;

  // Filtros adicionales
  showCategoriaFilter?: boolean;    // Mostrar filtro por categoría
  showEntidadFilter?: boolean;     // Mostrar selector de entidad (para jugadores/equipos)

  // Filtro extra arbitrario aplicado además de los filtros de UI (ej: solicitudes de un jugador específico)
  extraFilter?: (s: SolicitudEdicion) => boolean;

  // Callbacks
  onSolicitudUpdate?: (s: SolicitudEdicion) => void;
}

// Configuración de categoría
export interface NotificacionCategoriaConfig {
  label: string;
  tipos: readonly SolicitudEdicionTipo[];
}

// Props para AprobarButton
export interface AprobarButtonProps {
  solicitud: SolicitudEdicion;
  accionando: string | null;
  onAprobar: () => void;
  disabled?: boolean;
}

// Props para NotificacionesFilters
export interface NotificacionesFiltersProps {
  // Estados
  fEstado: SolicitudEdicionEstado | 'todos';
  setFEstado: (v: SolicitudEdicionEstado | 'todos') => void;
  fCategoria: string;
  setFCategoria: (v: string) => void;
  q: string;
  setQ: (v: string) => void;
  fMostrarSoloMias: boolean;
  setFMostrarSoloMias: (v: boolean) => void;
  autoRefresh: boolean;
  setAutoRefresh: (v: boolean) => void;

  // Opciones
  showCategoriaFilter?: boolean;
  showEntidadFilter?: boolean;
  showSoloMiasFilter?: boolean;
  entidadesDisponibles?: Array<{ id: string; nombre: string }>;
  entidadSeleccionada?: string;
  onEntidadChange?: (v: string) => void;

  // Categorías
  categorias: string[];

  // Actions
  onReload: () => void;
}

// Props para NotificacionesTable
export interface NotificacionesTableProps {
  categoria: string;
  items: SolicitudEdicion[];
  labelTipo: (tipo: SolicitudEdicionTipo) => string;
  expanded: Record<string, boolean>;
  setExpanded: (v: Record<string, boolean>) => void;
  rechazoEdit: { id: string; motivo: string } | null;
  setRechazoEdit: (v: { id: string; motivo: string } | null) => void;
  accionando: string | null;
  onAprobar: (s: SolicitudEdicion) => void;
  onRechazar: (s: SolicitudEdicion) => void;
  canApprove: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (ids: string[]) => void;
}

// Props para NotificacionesRow
export interface NotificacionesRowProps {
  solicitud: SolicitudEdicion;
  labelTipo: string;
  expanded: boolean;
  onToggle: () => void;
  rechazoEdit: { id: string; motivo: string } | null;
  setRechazoEdit: (v: { id: string; motivo: string } | null) => void;
  accionando: string | null;
  onAprobar: () => void;
  onRechazar: () => void;
  canApprove: boolean;
  selected: boolean;
  onToggleSelect: () => void;
}
