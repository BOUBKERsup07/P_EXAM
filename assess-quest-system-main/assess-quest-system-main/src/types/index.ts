
export type QuestionType = 'MCQ' | 'DIRECT';

export interface Choice {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  imageUrl?: string;
  type: QuestionType;
  choices?: Choice[];
  correctAnswer: string;
  timeLimit: number; // in seconds
}

export interface Exam {
  id: string;
  name: string;
  description?: string;
  questions: Question[];
  uniqueLink: string;
  createdBy: string;
  createdAt: string;
}

export interface Student {
  email: string;
}

export interface Answer {
  questionId: string;
  value: string;
  isCorrect: boolean;
}

export interface ExamResult {
  studentEmail: string;
  examId: string;
  answers: Answer[];
  score: number;
  totalQuestions: number;
}

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'PROFESSOR' | 'ADMIN';
};
