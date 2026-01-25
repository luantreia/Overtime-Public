import { fetchWithAuth } from '../../../utils/apiClient';

export interface JugadorCompetencia {
  _id: string;
  jugador: {
    _id: string;
    nombre: string;
    foto?: string;
  } | string;
  competencia: string;
  foto?: string; // Sometimes the photo is directly in the relationship
  [key: string]: any;
}

export class JugadorCompetenciaService {
  private static readonly API_ENDPOINT = '/jugador-competencia';

  static async getByCompetencia(competenciaId: string): Promise<JugadorCompetencia[]> {
    return fetchWithAuth<JugadorCompetencia[]>(`${this.API_ENDPOINT}?competencia=${competenciaId}`);
  }

  static async getByJugador(jugadorId: string): Promise<JugadorCompetencia[]> {
    return fetchWithAuth<JugadorCompetencia[]>(`${this.API_ENDPOINT}?jugador=${jugadorId}`);
  }
}
