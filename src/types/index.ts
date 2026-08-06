export * from './solicitudesEdicion';

export type RolUsuario = 'admin' | 'manager' | 'staff' | 'lector';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
}

export interface Notificacion {
    id: string;
    mensaje: string;
    leido: boolean;
    fecha: string;
    tipo: 'info' | 'alerta' | 'error';
}

export interface EquipoCompetencia {
    id: string;
    nombre: string;
    estado: 'pendiente' | 'aceptado' | 'rechazado';
    fixtureUrl?: string;
    competencia?: {
        nombre: string;
        faseActual?: string;
        posicionActual?: number;
    };
}

export interface Equipo {
    id: string;
    nombre: string;
    descripcion?: string;
    staff: string[];
}

export interface Jugador {
    id: string;
    nombre: string;
    estado: 'activo' | 'pendiente' | 'baja';
    rolEnEquipo?: string;
    posicion?: string;
    numeroCamiseta?: number;
    fechaInicio?: string;
    fechaFin?: string;
    contratoId?: string;
}

export interface SolicitudJugador {
    id: string;
    nombre: string;
    jugador?: {
        nombre: string;
        posicion?: string;
    };
    estado?: string;
    mensaje?: string;
    origen?: 'equipo' | 'jugador';
}

export interface SetPartido {
    _id: string;
    numeroSet: number;
    estadoSet: string;
    ganadorSet: string;
    marcadorLocal?: number;
    marcadorVisitante?: number;
}

// `Partido` vivía acá duplicado. La definición canónica es la de
// `features/partidos/services/partidoService.ts` — importala de ahí.
// Se re-exporta para no romper imports viejos que apunten a este módulo.
export type { Partido, PartidoEstado } from '../features/partidos/services/partidoService';