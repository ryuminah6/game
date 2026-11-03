export type DonutType = 'PINK' | 'GOLD' | 'GREEN';

export interface Donut {
  id: number;
  x: number;
  y: number;
  radius: number;
  type: DonutType;
  speed: number;
  rotation: number;
  rotSpeed: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  rotation: number;
  rotSpeed: number;
  life: number;
  maxLife: number;
  shape?: 'circle' | 'star' | 'heart';
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  scale: number;
  life: number;
}

export interface HamsterState {
  x: number;
  y: number;
  speed: number;
  direction: 1 | -1;
  eatBounce: number;
  wobble: number;
}

export type GameStatus = 'IDLE' | 'PLAYING' | 'PAUSED' | 'VICTORY' | 'GAMEOVER';
