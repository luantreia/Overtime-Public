import { fetchWithAuth } from '../../../utils/apiClient';

export interface Equipo {
  id: string;
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

    const url = queryParams.toString() ? `${this.API_ENDPOINT}?${queryParams}` : this.API_ENDPOINT;
    return fetchWithAuth<Equipo[]>(url);
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
    return fetchWithAuth<{ items: Equipo[]; page: number; limit: number; total: number }>(url);
  }

  static async getById(id: string): Promise<Equipo> {
    return fetchWithAuth<Equipo>(`${this.API_ENDPOINT}/${id}`);
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
