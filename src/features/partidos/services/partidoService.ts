import { fetchWithAuth } from '../../../utils/apiClient';

/**
 * Único origen de verdad para el estado de un partido en esta app.
 * Refleja exactamente el enum de Mongoose en `overtime/src/models/Partido/Partido.js`.
 * No agregar valores acá sin agregarlos primero en el backend: el filtro `?estado=`
 * va directo a la query de Mongo, así que un valor inventado devuelve 0 resultados
 * en silencio en vez de fallar.
 */
export type PartidoEstado = 'programado' | 'en_juego' | 'finalizado' | 'cancelado';

export interface Partido {
  id: string;
  _id?: string;
  nombre?: string;
  equipoLocal?: {
    id: string;
    nombre: string;
    escudo?: string;
  };
  equipoVisitante?: {
    id: string;
    nombre: string;
    escudo?: string;
  };
  fecha?: string;
  hora?: string;
  estado?: PartidoEstado;
  /** El backend devuelve string; el objeto es la forma que usa el perfil del jugador. */
  resultado?: string | { puntosEquipo: number; puntosRival: number };
  competenciaId?: string;
  competencia?: {
    nombre: string;
  };
  faseId?: string;
  etapa?: 'octavos' | 'cuartos' | 'semifinal' | 'final' | 'tercer_puesto' | 'repechaje' | 'otro';
  fase?: {
    _id: string;
    nombre: string;
    tipo: string;
    orden: number;
    temporada?: {
      _id: string;
      nombre: string;
    };
  };
  rival?: string;
  escenario?: string;
  sede?: {
    _id: string;
    nombre: string;
    direccion?: string;
    coordenadas?: { lat: number; lng: number };
    canchas?: string[];
  };
  imagen?: string;
  marcadorLocal?: number;
  marcadorVisitante?: number;
  modoEstadisticas?: any;
  modoVisualizacion?: any;
  sets?: any[];
  [key: string]: any;
}

export class PartidoService {
  private static readonly API_ENDPOINT = '/partidos';

  static async getAll(filters?: Record<string, any>): Promise<Partido[]> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (Array.isArray(value)) {
          value.forEach((v) => queryParams.append(key, String(v)));
        } else {
          queryParams.append(key, String(value));
        }
      });
    }

    // Ensure we get enough items since backend paginates by default
    if (!queryParams.has('limit')) {
      queryParams.append('limit', '1000');
    }

    const url = queryParams.toString() ? `${this.API_ENDPOINT}?${queryParams}` : this.API_ENDPOINT;
    const response = await fetchWithAuth<any>(url);
    
    if (Array.isArray(response)) {
      return response;
    } else if (response && Array.isArray(response.items)) {
      return response.items;
    }
    return [];
  }

  static async getPaginated(options?: { page?: number; limit?: number; filters?: Record<string, any> }): Promise<{ items: Partido[]; page: number; limit: number; total: number }> {
    const queryParams = new URLSearchParams();
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    queryParams.append('page', String(page));
    queryParams.append('limit', String(limit));

    const filters = options?.filters;
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (Array.isArray(value)) {
          value.forEach((v) => queryParams.append(key, String(v)));
        } else {
          queryParams.append(key, String(value));
        }
      });
    }

    const url = `${this.API_ENDPOINT}?${queryParams.toString()}`;
    return fetchWithAuth<{ items: Partido[]; page: number; limit: number; total: number }>(url);
  }

  static async getById(id: string): Promise<Partido> {
    return fetchWithAuth<Partido>(`${this.API_ENDPOINT}/${id}`);
  }

  static async create(data: Omit<Partido, 'id'>): Promise<Partido> {
    return fetchWithAuth<Partido>(`${this.API_ENDPOINT}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async update(id: string, data: Partial<Partido>): Promise<Partido> {
    return fetchWithAuth<Partido>(`${this.API_ENDPOINT}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  static async delete(id: string): Promise<void> {
    return fetchWithAuth<void>(`${this.API_ENDPOINT}/${id}`, {
      method: 'DELETE',
    });
  }

  static async getByCompetenciaId(competenciaId: string): Promise<Partido[]> {
    return this.getAll({ competenciaId });
  }

  static async getByFaseId(faseId: string): Promise<Partido[]> {
    return this.getAll({ fase: faseId });
  }

  static async getByEstado(estado: PartidoEstado): Promise<Partido[]> {
    return this.getAll({ estado });
  }

  static async getProximos(): Promise<Partido[]> {
    return this.getByEstado('programado');
  }

  static async getEnCurso(): Promise<Partido[]> {
    return this.getByEstado('en_juego');
  }

  static async getFinalizados(): Promise<Partido[]> {
    return this.getByEstado('finalizado');
  }

  static async getMatchPlayers(id: string): Promise<any[]> {
    const response = await fetchWithAuth<any>(`/ranked/match/${id}/players`);
    return response?.items || [];
  }

  static async getJugadorPartido(id: string): Promise<any[]> {
    const response = await fetchWithAuth<any[]>(`/jugador-partido?partido=${id}`);
    return Array.isArray(response) ? response : [];
  }

  static async getSets(partidoId: string): Promise<any[]> {
    const response = await fetchWithAuth<any[]>(`/set-partido?partido=${partidoId}`);
    return Array.isArray(response) ? response : [];
  }
}
