export interface Question {
  id?: number;
  text: string;
  imageUrl?: string;
  type: 'MULTIPLE_CHOICE' | 'DIRECT_ANSWER';
  timeLimit: number; // en secondes
  difficultyLevel: 'EASY' | 'MEDIUM' | 'HARD';
  points: number;
  explanation?: string;
  answers: Answer[];
}

export interface Answer {
  id?: number;
  text: string;
  isCorrect: boolean;
}

export interface Exam {
  id?: number;
  title: string;
  description?: string;
  questions: Question[];
  shareLink?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StudentAnswer {
  id?: number;
  examId: number;
  studentEmail: string;
  questionId: number;
  answer: string;
  isCorrect?: boolean;
  score?: number;
}

export interface ExamResult {
  examId: number;
  studentEmail: string;
  totalScore: number;
  answers: StudentAnswer[];
} 