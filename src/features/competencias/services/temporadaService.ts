import { fetchWithAuth } from '../../../utils/apiClient';

export interface Temporada {
  _id: string;
  nombre: string;
  fechaInicio?: string;
  fechaFin?: string;
  estado?: string;
  competencia?: string;
  ganador?: {
    _id: string;
    nombre: string;
    escudo?: string;
  } | null;
}

export class TemporadaService {
  private static readonly API_ENDPOINT = '/temporadas';

  static async getByCompetencia(competenciaId: string): Promise<Temporada[]> {
    return fetchWithAuth<Temporada[]>(`${this.API_ENDPOINT}?competencia=${competenciaId}`);
  }

  static async getById(id: string): Promise<Temporada> {
    return fetchWithAuth<Temporada>(`${this.API_ENDPOINT}/${id}`);
  }
}
