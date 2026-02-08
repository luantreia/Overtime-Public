export interface LobbyPlayer {
  _id?: string;
  player: {
    _id: string;
    nombre: string;
    alias?: string;
    foto?: string;
    elo?: number;
    karma?: number;
  };
  userUid: string;
  team: 'A' | 'B' | 'none';
  confirmed: boolean;
  isAFK: boolean;
  joinedAt: string;
}

export interface LobbyOfficial {
  player: {
    _id: string;
    nombre: string;
    alias?: string;
    foto?: string;
    elo?: number;
    karma?: number;
  };
  userUid: string;
  type: 'principal' | 'secundario' | 'linea';
  confirmed: boolean;
}

export interface Lobby {
  _id: string;
  host: string;
  title: string;
  description?: string;
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
  requireOfficial: boolean;
  genderPolicy: 'open' | 'male' | 'female' | 'mixed';
  modalidad: 'Foam' | 'Cloth';
  categoria: 'Masculino' | 'Femenino' | 'Mixto' | 'Libre';
  averageElo?: number;
  hostInfo?: {
    nombre: string;
    elo: number;
    karma: number;
  };
  rivalCaptainUid?: string;
  distance?: number;
  result?: {
    scoreA: number;
    scoreB: number;
    submittedBy: string;
    confirmedByOpponent: boolean;
    validatedByOfficial: boolean;
    disputed: boolean;
  };
  cancelRequest?: {
    hostRequested: boolean;
    rivalConfirmed: boolean;
  };
}
