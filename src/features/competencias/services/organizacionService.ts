import { fetchWithAuth } from '../../../utils/apiClient';

export interface RedesSociales {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  tiktok?: string;
  youtube?: string;
}

export interface Organizacion {
  id: string;
  nombre: string;
  logoUrl?: string;
  responsables?: string[];
  descripcion?: string;
  sitioWeb?: string;
  redesSociales?: RedesSociales;
  /** URL de YouTube que se usa como fondo del header. La carga el organizador. */
  videoFondoUrl?: string;
}

// El backend guarda el escudo en `logo`; el resto de Public lo consume como `logoUrl`.
// Sin este mapeo el campo llegaba siempre undefined y el logo no se renderizaba nunca.
const mapOrganizacion = (data: any): Organizacion => ({
  ...data,
  id: data._id || data.id,
  logoUrl: data.logoUrl || data.logo,
});

export class OrganizacionService {
  private static readonly API_ENDPOINT = '/organizaciones';

  static async getAll(): Promise<Organizacion[]> {
    const data = await fetchWithAuth<any[]>(this.API_ENDPOINT);
    return data.map(mapOrganizacion);
  }

  static async getById(id: string): Promise<Organizacion> {
    const data = await fetchWithAuth<any>(`${this.API_ENDPOINT}/${id}`);
    return mapOrganizacion(data);
  }
}