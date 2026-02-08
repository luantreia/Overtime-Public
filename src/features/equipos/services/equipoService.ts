import { fetchWithAuth } from '../../../utils/apiClient';

export interface Equipo {
  _id?: string;
  id?: string;
  nombre: string;
  ciudad?: string;
  organizacionId?: string;
  organizacion?: {
    id: string;
    nombre: string;
  };
  miembros?: number;
  imagen?: string;
  escudo?: string;
  activo?: boolean;
  competenciasJugadas?: number;
  competenciasGanadas?: number;
  partidosJugados?: number;
  participaciontemporadas?: any[];
  equipopartido?: any[];
  jugadoresEquipos?: any[];
  [key: string]: any;
}

export class EquipoService {
  private static readonly API_ENDPOINT = '/equipos';

  static async getAll(filters?: Record<string, any>): Promise<Equipo[]> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    
    // Ensure we get enough items since backend paginates by default
    if (!queryParams.has('limit')) {
      queryParams.append('limit', '1000');
    }

    const url = queryParams.toString() ? `${this.API_ENDPOINT}?${queryParams}` : this.API_ENDPOINT;
    const response = await fetchWithAuth<any>(url, { useAuth: false });
    
    if (Array.isArray(response)) {
      return response;
    } else if (response && Array.isArray(response.items)) {
      return response.items;
    }
    return [];
  }

  static async getPaginated(options?: { page?: number; limit?: number; filters?: Record<string, any> }): Promise<{ items: Equipo[]; page: number; limit: number; total: number }> {
    const queryParams = new URLSearchParams();
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    queryParams.append('page', String(page));
    queryParams.append('limit', String(limit));

    const filters = options?.filters;
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const url = `${this.API_ENDPOINT}?${queryParams.toString()}`;
    return fetchWithAuth<{ items: Equipo[]; page: number; limit: number; total: number }>(url, { useAuth: false });
  }

  static async getById(id: string): Promise<Equipo> {
    const equipo = await fetchWithAuth<Equipo>(`${this.API_ENDPOINT}/${id}`, { useAuth: false });
    
    // Si el backend no devuelve estas relaciones, las pedimos por separado
    if (equipo && (!equipo.participaciontemporadas || !equipo.equipopartido)) {
      try {
        const [participaciones, partidos, jugadores] = await Promise.all([
          fetchWithAuth<any[]>(`/participacion-temporada?equipo=${id}`, { useAuth: false }),
          fetchWithAuth<any[]>(`/equipo-partido?equipo=${id}`, { useAuth: false }),
          fetchWithAuth<any[]>(`/jugadores-equipos?equipo=${id}`, { useAuth: false })
        ]);
        
        equipo.participaciontemporadas = Array.isArray(participaciones) ? participaciones : [];
        equipo.equipopartido = Array.isArray(partidos) ? partidos : [];
        equipo.jugadoresEquipos = Array.isArray(jugadores) ? jugadores : [];
      } catch (error) {
        console.error('Error fetching extra team stats:', error);
        // Inicializamos como vacíos si fallun los estadísticos
        equipo.participaciontemporadas = equipo.participaciontemporadas || [];
        equipo.equipopartido = equipo.equipopartido || [];
        equipo.jugadoresEquipos = equipo.jugadoresEquipos || [];
      }
    }
    
    return equipo;
  }

  static async create(data: Omit<Equipo, 'id'>): Promise<Equipo> {
    return fetchWithAuth<Equipo>(`${this.API_ENDPOINT}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async update(id: string, data: Partial<Equipo>): Promise<Equipo> {
    return fetchWithAuth<Equipo>(`${this.API_ENDPOINT}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  static async delete(id: string): Promise<void> {
    return fetchWithAuth<void>(`${this.API_ENDPOINT}/${id}`, {
      method: 'DELETE',
    });
  }

  static async getByOrganizacionId(organizacionId: string): Promise<Equipo[]> {
    return fetchWithAuth<Equipo[]>(`${this.API_ENDPOINT}?organizacionId=${organizacionId}`);
  }
}
