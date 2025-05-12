export interface Question {
  id?: number;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'DIRECT_ANSWER';
  timeLimit: number;
  imageUrl?: string;
  answers: Answer[];
}

export interface Exam {
  id?: number;
  name: string;
  description?: string;
  duration: number;
  accessCode?: string;
  professorId?: number;
  questions: Question[];
  startTime?: Date;
  endTime?: Date;
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

export interface Answer {
  id?: number;
  text: string;
  isCorrect: boolean;
  keywords?: string;
}