export interface Question {
  id: number;
  text: string;
  imageUrl?: string;
  timeLimit: number;
  type: 'MULTIPLE_CHOICE' | 'DIRECT_ANSWER';
  answers: Answer[];
}

export interface Answer {
  id: number;
  text: string;
  isCorrect: boolean;
}

export interface Exam {
  id: number;
  name: string;
  description: string;
  accessCode: string;
  professorId: number;
  questions: Question[];
  score?: number;
  completionDate?: Date;
  duration: number; // Duration in seconds
}

export interface StudentAnswer {
  questionId: number;
  questionText: string;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface AnswerSubmission {
  id: number;
  questionId: number;
  questionText: string;
  answer: string;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface ExamResult {
  id: number;
  exam: {
    id: number;
    name: string;
    description: string;
  };
  student: {
    id: number;
    email: string;
    name?: string;
  };
  score: number;
  completionDate: string | Date;
  submissionDate: string;
  answers: AnswerSubmission[];
}

export type QuestionType = 'MULTIPLE_CHOICE' | 'DIRECT_ANSWER';