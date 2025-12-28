export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: number;
  text: string;
  options: Option[];
  correctAnswerId: string;
  points: number;
}

export enum QuizState {
  WELCOME = 'WELCOME',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED',
}

export interface QuizResult {
  minScore: number;
  maxScore: number;
  title: string;
  description: string;
  level: 'beginner' | 'practitioner' | 'strategist';
}