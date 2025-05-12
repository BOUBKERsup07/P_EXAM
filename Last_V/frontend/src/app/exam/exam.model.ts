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
  keywords?: string;
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
  questionText?: string;
  answer: string;
  isCorrect: boolean;
}

export interface ExamResult {
  id: number;
  examId?: number;
  score: number;
  endTime?: string;
  formattedEndTime?: string;
  completionDate: string;
  submissionDate?: string;
  exam?: {
    id: number;
    name: string;
    description: string;
  };
  student?: {
    id: number;
    email: string;
  };
  answers: AnswerSubmission[];
}

export type QuestionType = 'MULTIPLE_CHOICE' | 'DIRECT_ANSWER'; 