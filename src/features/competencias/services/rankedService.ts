import { fetchWithAuth } from '../../../utils/apiClient';

export interface LeaderboardItem {
  playerId: string;
  playerName?: string; // Assuming the API might return this or we need to fetch it
  rating: number;
  matchesPlayed: number;
  wins?: number;
  lastDelta?: number;
}

export interface LeaderboardResponse {
  ok: boolean;
  items: LeaderboardItem[];
}

export interface PlayerRankedDetail {
  ok: boolean;
  rating: any;
  history: any[];
  synergy?: {
    id: string;
    name: string;
    matches: number;
    wins: number;
    winrate: number;
    matchIds: string[];
  }[];
}

export class RankedService {
  private static readonly BASE = '/ranked';

  static async getLeaderboard(params: { 
    modalidad: string; 
    categoria: string; 
    competition?: string; 
    season?: string; 
    minMatches?: number; 
    limit?: number 
  }): Promise<LeaderboardResponse> {
    const sp = new URLSearchParams({
      modalidad: params.modalidad,
      categoria: params.categoria,
      minMatches: String(params.minMatches ?? 0),
      limit: String(params.limit ?? 50),
    });
    if (params.competition) sp.set('competition', params.competition);
    if (params.season) sp.set('season', params.season);
    
    return fetchWithAuth<LeaderboardResponse>(`${this.BASE}/leaderboard?${sp.toString()}`);
  }

  static async getPlayerDetail(playerId: string, params: { 
    modalidad: string; 
    categoria: string; 
    competition?: string; 
    season?: string 
  }): Promise<PlayerRankedDetail> {
    const sp = new URLSearchParams({
      modalidad: params.modalidad,
      categoria: params.categoria,
    });
    if (params.competition) sp.set('competition', params.competition);
    if (params.season) sp.set('season', params.season);
    
    return fetchWithAuth<PlayerRankedDetail>(`${this.BASE}/players/${playerId}/detail?${sp.toString()}`);
  }
}
