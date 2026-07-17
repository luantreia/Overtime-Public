import { authFetch } from '../../../shared/utils/authFetch';

export interface ParticipacionTemporada {
  _id: string;
  equipo: { _id: string; nombre: string; escudo?: string; tipo?: string; pais?: string };
  temporada: { _id: string; nombre: string };
  estado?: string;
}

export interface JugadorTemporadaRoster {
  _id: string;
  jugadorEquipo: {
    _id: string;
    jugador: { _id: string; nombre: string; alias?: string; genero?: string; foto?: string };
  };
  estado?: string;
  rol?: string;
}

export interface ParticipacionFaseStat {
  _id: string;
  participacionTemporada: {
    equipo: { _id: string; nombre: string; escudo?: string };
  };
  fase?: { nombre: string; tipo: string };
  grupo?: string;
  division?: string;
  puntos: number;
  partidosJugados: number;
  partidosGanados: number;
  partidosPerdidos: number;
  partidosEmpatados: number;
  diferenciaPuntos: number;
  posicion?: number;
}

export class EquipoCompetenciaService {
  static async getParticipacionTemporada(equipoId: string, temporadaId: string): Promise<ParticipacionTemporada | null> {
    const params = new URLSearchParams({ equipo: equipoId, temporada: temporadaId });
    const items = await authFetch<ParticipacionTemporada[]>(`/participacion-temporada?${params.toString()}`, {
      useAuth: false,
    });
    return items[0] ?? null;
  }

  static async getRoster(participacionTemporadaId: string): Promise<JugadorTemporadaRoster[]> {
    const params = new URLSearchParams({ participacionTemporada: participacionTemporadaId });
    return authFetch<JugadorTemporadaRoster[]>(`/jugador-temporada?${params.toString()}`, {
      useAuth: false,
    });
  }

  static async getParticipacionesFase(faseId: string): Promise<ParticipacionFaseStat[]> {
    const params = new URLSearchParams({ fase: faseId });
    return authFetch<ParticipacionFaseStat[]>(`/participacion-fase?${params.toString()}`, {
      useAuth: false,
    });
  }
}
