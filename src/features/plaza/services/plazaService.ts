import { fetchWithAuth } from '../../../utils/apiClient';
import { Lobby } from '../types';

export class PlazaService {
  private static readonly API_ENDPOINT = '/plaza';

  static async getLobbies(lat?: number, lng?: number, radius?: number): Promise<Lobby[]> {
    const params = new URLSearchParams();
    if (lat) params.append('lat', lat.toString());
    if (lng) params.append('lng', lng.toString());
    if (radius) params.append('radius', radius.toString());

    return fetchWithAuth<Lobby[]>(`${this.API_ENDPOINT}/lobbies?${params.toString()}`);
  }

  static async getLobbyById(id: string): Promise<Lobby> {
    return fetchWithAuth<Lobby>(`${this.API_ENDPOINT}/lobbies/${id}`);
  }

  static async createLobby(data: any): Promise<Lobby> {
    return fetchWithAuth<Lobby>(`${this.API_ENDPOINT}/lobbies`, {
      method: 'POST',
      body: data,
    });
  }

  static async joinLobby(lobbyId: string): Promise<Lobby> {
    return fetchWithAuth<Lobby>(`${this.API_ENDPOINT}/lobbies/${lobbyId}/join`, {
      method: 'POST',
      body: {},
    });
  }

  static async joinOfficial(lobbyId: string): Promise<Lobby> {
    return fetchWithAuth<Lobby>(`${this.API_ENDPOINT}/lobbies/${lobbyId}/join-official`, {
      method: 'POST',
      body: { type: 'principal' },
    });
  }

  static async checkIn(lobbyId: string, lat: number, lng: number): Promise<any> {
    return fetchWithAuth(`${this.API_ENDPOINT}/lobbies/${lobbyId}/check-in`, {
      method: 'POST',
      body: { lat, lng },
    });
  }

  static async balanceTeams(lobbyId: string): Promise<Lobby> {
    return fetchWithAuth<Lobby>(`${this.API_ENDPOINT}/lobbies/${lobbyId}/balance-teams`, {
      method: 'POST',
      body: {},
    });
  }

  static async startMatch(lobbyId: string): Promise<Lobby> {
    return fetchWithAuth<Lobby>(`${this.API_ENDPOINT}/lobbies/${lobbyId}/start`, {
      method: 'POST',
      body: {},
    });
  }

  static async submitResult(lobbyId: string, result: any): Promise<Lobby> {
    // result expects scoreA, scoreB for backend
    const payload = {
      scoreA: result.sets.reduce((acc: number, s: any) => acc + (s.teamAScore > s.teamBScore ? 1 : 0), 0),
      scoreB: result.sets.reduce((acc: number, s: any) => acc + (s.teamBScore > s.teamAScore ? 1 : 0), 0)
    };
    
    return fetchWithAuth<Lobby>(`${this.API_ENDPOINT}/lobbies/${lobbyId}/result`, {
      method: 'POST',
      body: payload,
    });
  }

  static async confirmResult(lobbyId: string): Promise<Lobby> {
    return fetchWithAuth<Lobby>(`${this.API_ENDPOINT}/lobbies/${lobbyId}/confirm`, {
      method: 'POST',
      body: {},
    });
  }
}


