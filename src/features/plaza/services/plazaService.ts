import { fetchWithAuth } from '../../../utils/apiClient';
import { Lobby } from '../types';

export class PlazaService {
  private static readonly API_ENDPOINT = '/plaza';

  static async getLobbies(lat?: number, lng?: number, radius?: number): Promise<Lobby[]> {
    const params = new URLSearchParams();
    if (lat) params.append('lat', lat.toString());
    if (lng) params.append('lng', lng.toString());
    if (radius) params.append('radius', radius.toString());

    const response = await fetchWithAuth(`${this.API_ENDPOINT}/lobbies?${params.toString()}`);
    if (!response.ok) throw new Error('Error al obtener lobbies');
    return response.json();
  }

  static async getLobbyById(id: string): Promise<Lobby> {
    const response = await fetchWithAuth(`${this.API_ENDPOINT}/lobbies/${id}`);
    if (!response.ok) throw new Error('Error al obtener el lobby');
    return response.json();
  }

  static async createLobby(data: any): Promise<Lobby> {
    const response = await fetchWithAuth(`${this.API_ENDPOINT}/lobbies`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear el lobby');
    }
    return response.json();
  }

  static async joinLobby(lobbyId: string): Promise<Lobby> {
    const response = await fetchWithAuth(`${this.API_ENDPOINT}/lobbies/${lobbyId}/join`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al unirse al lobby');
    }
    return response.json();
  }

  static async joinOfficial(lobbyId: string): Promise<Lobby> {
    const response = await fetchWithAuth(`${this.API_ENDPOINT}/lobbies/${lobbyId}/join-official`, {
      method: 'POST',
      body: JSON.stringify({ type: 'principal' }), // Default to principal for UI simplicity or expand later
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al unirse como oficial');
    }
    return response.json();
  }

  static async checkIn(lobbyId: string, lat: number, lng: number): Promise<any> {
    const response = await fetchWithAuth(`${this.API_ENDPOINT}/lobbies/${lobbyId}/check-in`, {
      method: 'POST',
      body: JSON.stringify({ lat, lng }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error en check-in (demasiado lejos o no estás en el lobby)');
    }
    return response.json();
  }

  static async balanceTeams(lobbyId: string): Promise<Lobby> {
    const response = await fetchWithAuth(`${this.API_ENDPOINT}/lobbies/${lobbyId}/balance-teams`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Solo el creador puede balancear equipos');
    }
    return response.json();
  }

  static async startMatch(lobbyId: string): Promise<Lobby> {
    const response = await fetchWithAuth(`${this.API_ENDPOINT}/lobbies/${lobbyId}/start`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'No se pudo iniciar el partido');
    }
    return response.json();
  }

  static async submitResult(lobbyId: string, result: any): Promise<Lobby> {
    // result expects scoreA, scoreB for backend
    const payload = {
      scoreA: result.sets.reduce((acc: number, s: any) => acc + (s.teamAScore > s.teamBScore ? 1 : 0), 0),
      scoreB: result.sets.reduce((acc: number, s: any) => acc + (s.teamBScore > s.teamAScore ? 1 : 0), 0)
    };
    
    const response = await fetchWithAuth(`${this.API_ENDPOINT}/lobbies/${lobbyId}/result`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Solo el anfitrión o un oficial pueden subir resultados');
    }
    return response.json();
  }

  static async confirmResult(lobbyId: string): Promise<Lobby> {
    const response = await fetchWithAuth(`${this.API_ENDPOINT}/lobbies/${lobbyId}/confirm`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al confirmar resultado');
    }
    return response.json();
  }
}

