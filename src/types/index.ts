// TypeScript interfaces for KidsEdu state management

export interface StudentStats {
  name: string;
  age: number;
  grade: string; // 'Kindergarten' | 'Grade 1' | 'Grade 2' | 'Grade 3' | 'Grade 4'
  xp: number;
  stars: number;
  streak: number;
  mathSolved: number;
  readingSolved: number;
  badges: string[];
  mathStreak: number;
  readingStreak: number;
  currentMathDiff: 'easy' | 'medium' | 'hard';
  currentReadingDiff: 'easy' | 'medium' | 'hard';
}

export interface Question {
  id: string;
  subject: 'math' | 'reading';
  grade: 'K' | '1' | '2' | '3' | '4'; // Kindergarten, Grade 1, Grade 2, Grade 3, Grade 4
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string; // e.g. 'addition', 'spelling', 'phonics', 'comprehension'
  questionText: string;
  options: string[];
  answer: string;
  emoji?: string;
  hint?: string;
  paragraph?: string;
}

export interface Badge {
  id: string;
  name: string;
  desc: string;
  icon: string;
  color: string;
  borderColor: string;
  requirement: (stats: StudentStats) => boolean;
}
