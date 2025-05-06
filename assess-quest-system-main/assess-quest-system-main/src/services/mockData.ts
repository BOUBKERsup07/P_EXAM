
import { Exam, ExamResult, Question, User } from "@/types";
import { v4 as uuidv4 } from "uuid";

// Mock users (professors)
export const users: User[] = [
  {
    id: "1",
    name: "Prof. Smith",
    email: "prof.smith@example.com",
    role: "PROFESSOR",
  },
  {
    id: "2",
    name: "Dr. Johnson",
    email: "dr.johnson@example.com",
    role: "PROFESSOR",
  },
];

// Mock exams
export const exams: Exam[] = [
  {
    id: "1",
    name: "Introduction to Computer Science",
    description: "Basic concepts of programming and algorithms",
    questions: [
      {
        id: "q1",
        text: "What does CPU stand for?",
        type: "MCQ",
        choices: [
          { id: "a", text: "Central Processing Unit" },
          { id: "b", text: "Computer Personal Unit" },
          { id: "c", text: "Central Process Unified" },
          { id: "d", text: "Core Processing Unit" },
        ],
        correctAnswer: "a",
        timeLimit: 30,
      },
      {
        id: "q2",
        text: "What is the main function of RAM?",
        type: "MCQ",
        choices: [
          { id: "a", text: "Long-term storage" },
          { id: "b", text: "Temporary data storage for active programs" },
          { id: "c", text: "Processing calculations" },
          { id: "d", text: "Managing network connections" },
        ],
        correctAnswer: "b",
        timeLimit: 45,
      },
      {
        id: "q3",
        text: "What language is primarily used for styling web pages?",
        type: "DIRECT",
        correctAnswer: "CSS",
        timeLimit: 20,
      },
    ],
    uniqueLink: "cs-intro-101",
    createdBy: "1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Advanced Mathematics",
    description: "Calculus and linear algebra concepts",
    questions: [
      {
        id: "q1",
        text: "What is the derivative of f(x) = x²?",
        type: "DIRECT",
        correctAnswer: "2x",
        timeLimit: 60,
      },
      {
        id: "q2",
        text: "Which of the following is a solution to the equation x² - 4 = 0?",
        type: "MCQ",
        choices: [
          { id: "a", text: "x = 1" },
          { id: "b", text: "x = 2" },
          { id: "c", text: "x = 3" },
          { id: "d", text: "x = 4" },
        ],
        correctAnswer: "b",
        timeLimit: 45,
      },
    ],
    uniqueLink: "adv-math-202",
    createdBy: "2",
    createdAt: new Date().toISOString(),
  },
];

// Mock exam results
export const examResults: ExamResult[] = [];

// Mock API functions
export const generateUniqueLink = (): string => {
  return uuidv4().substring(0, 8);
};

export const getExamByLink = (link: string): Exam | undefined => {
  return exams.find((exam) => exam.uniqueLink === link);
};

export const addExam = (exam: Omit<Exam, "id" | "createdAt" | "uniqueLink">): Exam => {
  const newExam: Exam = {
    ...exam,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    uniqueLink: generateUniqueLink(),
  };
  exams.push(newExam);
  return newExam;
};

export const addQuestion = (examId: string, question: Omit<Question, "id">): Question => {
  const exam = exams.find((e) => e.id === examId);
  if (!exam) {
    throw new Error("Exam not found");
  }

  const newQuestion: Question = {
    ...question,
    id: uuidv4(),
  };
  exam.questions.push(newQuestion);
  return newQuestion;
};

export const submitExamResult = (result: Omit<ExamResult, "score">): ExamResult => {
  const exam = exams.find((e) => e.id === result.examId);
  if (!exam) {
    throw new Error("Exam not found");
  }

  // Calculate score
  const correctAnswers = result.answers.filter((a) => a.isCorrect).length;
  const score = (correctAnswers / result.totalQuestions) * 100;

  const examResult: ExamResult = {
    ...result,
    score,
  };

  examResults.push(examResult);
  return examResult;
};
