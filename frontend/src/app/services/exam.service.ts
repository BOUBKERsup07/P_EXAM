import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Exam, Question, StudentAnswer, ExamResult } from '../models/exam.model';

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private apiUrl = 'http://localhost:8082/api';

  constructor(private http: HttpClient) { }

  // Gestion des examens pour les professeurs
  getProfessorExams(): Observable<Exam[]> {
    return this.http.get<Exam[]>(`${this.apiUrl}/professor/exams`);
  }

  getExam(id: number): Observable<Exam> {
    return this.http.get<Exam>(`${this.apiUrl}/professor/exams/${id}`);
  }

  createExam(exam: Exam): Observable<Exam> {
    return this.http.post<Exam>(`${this.apiUrl}/professor/exams`, exam);
  }

  updateExam(id: number, exam: Exam): Observable<Exam> {
    return this.http.put<Exam>(`${this.apiUrl}/professor/exams/${id}`, exam);
  }

  deleteExam(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/professor/exams/${id}`);
  }

  // Gestion des examens pour les étudiants
  getAvailableExams(): Observable<Exam[]> {
    return this.http.get<Exam[]>(`${this.apiUrl}/student/exams/available`);
  }

  getCompletedExams(): Observable<Exam[]> {
    return this.http.get<Exam[]>(`${this.apiUrl}/student/exams/completed`);
  }

  getExamForStudent(id: number): Observable<Exam> {
    return this.http.get<Exam>(`${this.apiUrl}/student/exams/${id}`);
  }

  // Gestion des questions
  addQuestion(examId: number, question: Question): Observable<Question> {
    return this.http.post<Question>(`${this.apiUrl}/professor/exams/${examId}/questions`, question);
  }

  updateQuestion(examId: number, questionId: number, question: Question): Observable<Question> {
    return this.http.put<Question>(`${this.apiUrl}/professor/exams/${examId}/questions/${questionId}`, question);
  }

  deleteQuestion(examId: number, questionId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/professor/exams/${examId}/questions/${questionId}`);
  }

  // Gestion des réponses
  submitAnswer(examId: number, answer: StudentAnswer): Observable<StudentAnswer> {
    return this.http.post<StudentAnswer>(`${this.apiUrl}/student/exams/${examId}/answers`, answer);
  }

  getExamResult(examId: number, studentEmail: string): Observable<ExamResult> {
    return this.http.get<ExamResult>(`${this.apiUrl}/student/exams/${examId}/results/${studentEmail}`);
  }

  // Gestion des images
  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<string>(`${this.apiUrl}/upload`, formData);
  }

  deleteQuestionAnswers(questionId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/professor/questions/${questionId}/answers`);
  }

  deleteQuestion(questionId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/professor/questions/${questionId}`);
  }
}