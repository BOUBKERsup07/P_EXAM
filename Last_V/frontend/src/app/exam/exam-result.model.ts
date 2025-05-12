export interface ExamResult {
  examId: number;
  score: number;
  timeSpent: number;
  answers: AnswerResult[];
}


export interface AnswerResult {
  questionId: number;
  questionText: string;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  keywords?: string; // Mots-clés pour les questions à réponse directe
  questionType?: string; // Type de question (MULTIPLE_CHOICE ou DIRECT_ANSWER)
} 