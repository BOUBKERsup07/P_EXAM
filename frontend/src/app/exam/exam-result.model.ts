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
  };
  score: number;
  completionDate: string;
  submissionDate: string;
  answers: AnswerSubmission[];
}

export interface AnswerSubmission {
  id: number;
  questionId: number;
  questionText: string;
  answer: string;
  correctAnswer: string;
  isCorrect: boolean;
} 