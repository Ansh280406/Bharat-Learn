export type Language = 'en' | 'hi' | 'gu';

export type PageType = 'heart' | 'water_cycle' | 'math' | 'history' | 'unknown';

export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface Quiz {
  questions: QuizQuestion[];
}

export interface ScanResult {
  pageType: PageType;
  confidence: number;
  title: string;
  details: string;
  mathEquation?: string | null;
  battleName?: string | null;
}

export interface PartExplanation {
  name: string;
  en: string;
  hi: string;
  gu: string;
}
