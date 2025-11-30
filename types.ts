export interface Message {
  id: string;
  text: string;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  color: string;
  rotation: number;
  delay: number;
}

export interface GeneratedResponse {
  messages: string[];
}

export enum AppState {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED'
}