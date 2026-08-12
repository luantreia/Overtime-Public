import { fetchWithAuth } from '../../../utils/apiClient';

export interface Sede {
  id: string;
  _id?: string;
  nombre: string;
  direccion?: string;
  coordenadas?: {
    lat: number;
    lng: number;
  };
  canchas?: string[];
  organizacion?: {
    _id: string;
    nombre: string;
    logoUrl?: string;
  } | string;
}

export class SedeService {
  private static readonly API_ENDPOINT = '/sedes';

  static async getById(id: string): Promise<Sede> {
    const data = await fetchWithAuth<any>(`${this.API_ENDPOINT}/${id}`);
    return { ...data, id: data._id || data.id };
  }

  static async getByOrganizacion(organizacionId: string): Promise<Sede[]> {
    const data = await fetchWithAuth<any[]>(`${this.API_ENDPOINT}?organizacion=${organizacionId}`);
    return data.map(item => ({ ...item, id: item._id || item.id }));
  }
}
