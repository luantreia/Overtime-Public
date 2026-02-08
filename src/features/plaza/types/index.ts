export interface LobbyPlayer {
  _id?: string;
  player: {
    _id: string;
    nombre: string;
    alias?: string;
    foto?: string;
    elo?: number;
  } | string;
  userUid: string;
  team: 'A' | 'B' | 'none';
  confirmed: boolean;
  isAFK: boolean;
  joinedAt: string;
}

export interface LobbyOfficial {
  player: any;
  userUid: string;
  type: 'principal' | 'secundario' | 'linea';
  confirmed: boolean;
}

export interface Lobby {
  _id: string;
  host: string;
  title: string;
  description?: string;
  modalidad: 'Foam' | 'Cloth';
  categoria: string;
  location: {
    name: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  scheduledDate: string;
  status: 'open' | 'full' | 'playing' | 'finished' | 'cancelled';
  players: LobbyPlayer[];
  officials: LobbyOfficial[];
  maxPlayers: number;
  rivalCaptainUid?: string;
  result?: {
    scoreA: number;
    scoreB: number;
    submittedBy: string;
    confirmedByOpponent: boolean;
    validatedByOfficial: boolean;
    disputed: boolean;
  };
  distance?: number;
}
