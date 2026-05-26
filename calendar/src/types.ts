export type Subject = 'math' | '408' | 'english' | 'politics';
export type MathPhase = 'basic' | 'round2' | 'intensive' | 'exam' | 'sprint';

export interface Task {
  id: string;
  subject: Subject;
  text: string;
  duration: number;
}

export interface DayData {
  light?: boolean;
  mathPhase?: MathPhase;
  tasks: Task[];
}

export interface ScheduleData {
  year: number;
  startDate: string;
  endDate: string;
  days: Record<string, DayData>;
}

export interface StudyState {
  completed: Record<string, boolean>;
  basicUnlockedRound2: boolean;
}
