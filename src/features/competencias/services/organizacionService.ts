import { fetchWithAuth } from '../../../utils/apiClient';

export interface Organizacion {
  id: string;
  nombre: string;
  logoUrl?: string;
  responsables?: string[];
  descripcion?: string;
}

export class OrganizacionService {
  private static readonly API_ENDPOINT = '/organizaciones';

  static async getAll(): Promise<Organizacion[]> {
    const data = await fetchWithAuth<any[]>(this.API_ENDPOINT);
    return data.map(item => ({ ...item, id: item._id || item.id }));
  }

  static async getById(id: string): Promise<Organizacion> {
    const data = await fetchWithAuth<any>(`${this.API_ENDPOINT}/${id}`);
    return { ...data, id: data._id || data.id };
  }
}