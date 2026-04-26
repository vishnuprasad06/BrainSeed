export type Grade = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10';
export type Language = 'English' | 'Kannada';
export type Interest = 'Math' | 'Science' | 'Stories';

export interface ActivityLog {
  id: string;
  type: 'Math' | 'Science' | 'Reading' | 'Alphabet' | 'Stories' | 'Writing';
  score: number;
  maxScore: number;
  timestamp: Date;
}

export interface UserProfile {
  name: string;
  email?: string;
  grade: Grade;
  language: Language;
  interests: Interest[];
  points: number;
  activityLog?: ActivityLog[];
  currentStreak?: number;
  lastLoginDate?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}
