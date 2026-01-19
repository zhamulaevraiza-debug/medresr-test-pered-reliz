export interface Option {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface QuizData {
  text: string;
  options: Option[];
}

export interface PlanData {
  title: string;
  total: string;
  period: string;
  weekly: string;
  advice: string[];
}

export interface ContentItem {
  id?: number | string;
  ar?: string;
  tr?: string;
  ru?: string;
  target?: number;
  name?: string;
  title?: string;
  content?: string;
}

export interface FiqhItem {
  id: number;
  question: string;
  answer: string;
  arabic?: string;
}

export interface SectionState {
  quiz: boolean;
  plan: boolean;
}

export interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

export type Theme = {
  bg: string;
  card: string;
  accent: string;
  accentColor: string;
  buttonPrimary: string;
  input: string;
};