import { fetchWithAuth } from '../../../utils/apiClient';

export interface Fase {
  _id: string;
  nombre: string;
  tipo?: string;
  estado?: string;
  temporada?: string;
}

export class FaseService {
  private static readonly API_ENDPOINT = '/fases';

  static async getByTemporada(temporadaId: string): Promise<Fase[]> {
    return fetchWithAuth<Fase[]>(`${this.API_ENDPOINT}?temporada=${temporadaId}`);
  }
}
