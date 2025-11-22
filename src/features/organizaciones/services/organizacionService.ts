import { fetchWithAuth } from '../../../utils/apiClient';

export interface Organizacion {
  id: string;
  nombre: string;
  ciudad?: string;
  pais?: string;
  descripcion?: string;
  imagen?: string;
  activa?: boolean;
  [key: string]: any;
}

export class OrganizacionService {
  private static readonly API_ENDPOINT = '/organizaciones';

  static async getAll(filters?: Record<string, any>): Promise<Organizacion[]> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const url = queryParams.toString() ? `${this.API_ENDPOINT}?${queryParams}` : this.API_ENDPOINT;
    return fetchWithAuth<Organizacion[]>(url);
  }

  static async getById(id: string): Promise<Organizacion> {
    return fetchWithAuth<Organizacion>(`${this.API_ENDPOINT}/${id}`);
  }

  static async create(data: Omit<Organizacion, 'id'>): Promise<Organizacion> {
    return fetchWithAuth<Organizacion>(`${this.API_ENDPOINT}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async update(id: string, data: Partial<Organizacion>): Promise<Organizacion> {
    return fetchWithAuth<Organizacion>(`${this.API_ENDPOINT}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  static async delete(id: string): Promise<void> {
    return fetchWithAuth<void>(`${this.API_ENDPOINT}/${id}`, {
      method: 'DELETE',
    });
  }

  static async getByPais(pais: string): Promise<Organizacion[]> {
    return fetchWithAuth<Organizacion[]>(`${this.API_ENDPOINT}?pais=${pais}`);
  }
}
