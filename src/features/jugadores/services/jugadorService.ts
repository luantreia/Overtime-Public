import { fetchWithAuth } from '../../../utils/apiClient';

export interface Jugador {
  _id?: string;
  id?: string;
  nombre: string;
  alias?: string;
  fechaNacimiento: string | Date;
  genero?: 'masculino' | 'femenino' | 'otro';
  foto?: string;
  nacionalidad?: string;
  creadoPor?: string;
  administradores?: string[];
  edad?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export class JugadorService {
  private static readonly API_ENDPOINT = '/jugadores';

  static async getAll(filters?: Record<string, any>): Promise<{ items: Jugador[] }> {
    const queryParams = new URLSearchParams();
    // For "getAll" in a public exploration context, we use a high limit 
    // to allow client-side sorting/filtering of the full directory
    queryParams.append('limit', '1000'); 
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const url = queryParams.toString() ? `${this.API_ENDPOINT}?${queryParams}` : this.API_ENDPOINT;
    return fetchWithAuth<{ items: Jugador[] }>(url);
  }

  static async getPaginated(options?: { page?: number; limit?: number; filters?: Record<string, any> }): Promise<{ items: Jugador[]; page: number; limit: number; total: number }> {
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
    return fetchWithAuth<{ items: Jugador[]; page: number; limit: number; total: number }>(url);
  }

  static async getById(id: string): Promise<Jugador> {
    return fetchWithAuth<Jugador>(`${this.API_ENDPOINT}/${id}`);
  }

  static async getRadarStats(id: string): Promise<any> {
    return fetchWithAuth<any>(`${this.API_ENDPOINT}/${id}/radar`);
  }

  static async getCompetencias(id: string): Promise<any[]> {
    return fetchWithAuth<any[]>(`${this.API_ENDPOINT}/${id}/competencias`);
  }

  static async create(data: Omit<Jugador, '_id' | 'id' | 'createdAt' | 'updatedAt'>): Promise<Jugador> {
    return fetchWithAuth<Jugador>(`${this.API_ENDPOINT}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async update(id: string, data: Partial<Jugador>): Promise<Jugador> {
    return fetchWithAuth<Jugador>(`${this.API_ENDPOINT}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  static async delete(id: string): Promise<void> {
    return fetchWithAuth<void>(`${this.API_ENDPOINT}/${id}`, {
      method: 'DELETE',
    });
  }

  static async claim(id: string): Promise<any> {
    return fetchWithAuth<any>(`${this.API_ENDPOINT}/${id}/claim`, {
      method: 'POST'
    });
  }
}
