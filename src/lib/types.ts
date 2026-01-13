export type QuizQuestion = {
  id: number;
  topic: string;
  question: string;
  options: string[];
  answer: string;
};

export type QuizConfig = {
  id: string;
  name: string;
  file: string;
  description: string;
  icon: 'globe' | 'coffee' | 'cpu';
};

export type GameState = 'subject-selection' | 'loading' | 'menu' | 'playing' | 'result' | 'error';

export type QuizSettings = {
  topic: string;
  questionCount: number | 'full';
  timerEnabled: boolean;
};
