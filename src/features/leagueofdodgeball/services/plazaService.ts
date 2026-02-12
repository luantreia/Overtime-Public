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

  static async deleteLobby(id: string): Promise<void> {
    return fetchWithAuth<void>(`${this.API_ENDPOINT}/lobbies/${id}`, {
      method: 'DELETE',
    });
  }

  static async kickOfficial(id: string, userUid: string): Promise<Lobby> {
    return fetchWithAuth<Lobby>(`${this.API_ENDPOINT}/lobbies/${id}/officials/${userUid}`, {
      method: 'DELETE',
    });
  }

  static async kickPlayer(id: string, userUid: string): Promise<Lobby> {
    return fetchWithAuth<Lobby>(`${this.API_ENDPOINT}/lobbies/${id}/players/${userUid}`, {
      method: 'DELETE',
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

  static async leaveLobby(lobbyId: string): Promise<Lobby> {
    return fetchWithAuth<Lobby>(`${this.API_ENDPOINT}/lobbies/${lobbyId}/leave`, {
      method: 'POST',
      body: {},
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
    // result expects sets: { teamAScore, teamBScore }[]
    const payload = {
      scoreA: result.sets.reduce((acc: number, s: any) => acc + (s.teamAScore > s.teamBScore ? 1 : 0), 0),
      scoreB: result.sets.reduce((acc: number, s: any) => acc + (s.teamBScore > s.teamAScore ? 1 : 0), 0),
      sets: result.sets
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

  static async submitRatings(lobbyId: string, ratings: any[]): Promise<any> {
    return fetchWithAuth(`${this.API_ENDPOINT}/lobbies/${lobbyId}/rate`, {
      method: 'POST',
      body: { ratings },
    });
  }

  static async reportAuthorityInactivity(lobbyId: string, targetRole: 'host' | 'rivalCaptain' | 'official'): Promise<any> {
    return fetchWithAuth(`${this.API_ENDPOINT}/lobbies/${lobbyId}/report-authority`, {
      method: 'POST',
      body: { targetRole },
    });
  }

  static async requestCancel(lobbyId: string): Promise<any> {
    return fetchWithAuth(`${this.API_ENDPOINT}/lobbies/${lobbyId}/cancel-request`, {
      method: 'POST',
      body: {},
    });
  }

  static async getMyProfile(): Promise<any> {
    return fetchWithAuth('/jugadores/me/profile');
  }
}


