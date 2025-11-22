import { fetchWithAuth } from '../../../utils/apiClient';

export interface Competencia {
  id: string;
  nombre: string;
  descripcion?: string;
  fechaInicio?: string;
  fechaFin?: string;
  estado?: 'proximamente' | 'en_curso' | 'finalizada';
  imagen?: string;
  equipos?: number;
  [key: string]: any;
}

export class CompetenciaService {
  private static readonly API_ENDPOINT = '/competencias';

  static async getAll(filters?: Record<string, any>): Promise<Competencia[]> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const url = queryParams.toString() ? `${this.API_ENDPOINT}?${queryParams}` : this.API_ENDPOINT;
    return fetchWithAuth<Competencia[]>(url);
  }

  static async getById(id: string): Promise<Competencia> {
    return fetchWithAuth<Competencia>(`${this.API_ENDPOINT}/${id}`);
  }

  static async create(data: Omit<Competencia, 'id'>): Promise<Competencia> {
    return fetchWithAuth<Competencia>(`${this.API_ENDPOINT}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async update(id: string, data: Partial<Competencia>): Promise<Competencia> {
    return fetchWithAuth<Competencia>(`${this.API_ENDPOINT}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  static async delete(id: string): Promise<void> {
    return fetchWithAuth<void>(`${this.API_ENDPOINT}/${id}`, {
      method: 'DELETE',
    });
  }

  static async getByEstado(estado: string): Promise<Competencia[]> {
    return fetchWithAuth<Competencia[]>(`${this.API_ENDPOINT}?estado=${estado}`);
  }

  static async getActivas(): Promise<Competencia[]> {
    return this.getByEstado('en_curso');
  }

  static async getProximas(): Promise<Competencia[]> {
    return this.getByEstado('proximamente');
  }
}
