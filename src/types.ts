export interface GameState {
  score: number;
  highScore: number;
  previousScore: number;
  isGameOver: boolean;
  isStarted: boolean;
  playerName: string;
  hasRated: boolean;
  totalGamesPlayed: number;
}

export interface GlobalStats {
  totalPlayers: number;
  universalHighScore: number;
  highScorerName: string;
}

export interface DailyStats {
  count: number;
}

export interface ChatMessage {
  id?: string;
  sender: string;
  text: string;
  timestamp: string;
}

export interface Friend {
  name: string;
}

export interface PlayerData {
  name: string;
  highScore: number;
  totalGamesPlayed: number;
  totalMinutesPlayed: number;
  hasRated?: boolean;
  createdAt: string;
}

export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Player extends Entity {
  vy: number;
  isJumping: boolean;
}

export interface Obstacle extends Entity {
  speed: number;
  type: 'ground' | 'flying';
}
