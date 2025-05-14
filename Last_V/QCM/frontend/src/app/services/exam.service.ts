import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Exam } from '../models/exam.model';
import { AuthService } from '../auth/auth.service';

export interface Question {
  id?: number;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'DIRECT_ANSWER';
  timeLimit: number;
  imageUrl?: string;
  difficultyLevel: 'EASY' | 'MEDIUM' | 'HARD';
  points: number;
  answers?: Answer[];
}

export interface Answer {
  id?: number;
  text: string;
  isCorrect: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getExams(): Observable<Exam[]> {
    return this.http.get<Exam[]>(`${this.apiUrl}/professor/exams`, { headers: this.getHeaders() });
  }

  getExam(id: number): Observable<Exam> {
    return this.http.get<Exam>(`${this.apiUrl}/professor/exams/${id}`, { headers: this.getHeaders() })
      .pipe(
        tap(exam => {
          console.log('ExamService - Examen détaillé reçu:', exam);
          if (exam.questions && exam.questions.length > 0) {
            exam.questions.forEach(question => {
              if (question.type === 'DIRECT_ANSWER' && question.answers && question.answers.length > 0) {
                console.log('Question à réponse directe trouvée:', question.text);
                const answer = question.answers[0];
                console.log('Réponse correcte:', answer.text);
                console.log('Mots-clés:', answer.keywords);
              }
            });
          }
        })
      );
  }

  createExam(exam: Exam): Observable<Exam> {
    console.log('Envoi des données de l\'examen:', exam);
    return this.http.post<Exam>(`${this.apiUrl}/professor/exams`, exam, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Erreur détaillée lors de la création de l\'examen:', error);
          if (error.error) {
            console.error('Message d\'erreur du serveur:', error.error);
          }
          return this.handleError(error);
        })
      );
  }

  updateExam(id: number, exam: Exam): Observable<Exam> {
    return this.http.put<Exam>(`${this.apiUrl}/professor/exams/${id}`, exam, { headers: this.getHeaders() });
  }

  deleteExam(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/professor/exams/${id}`, { headers: this.getHeaders() });
  }

  submitAnswer(examId: number, questionId: number, answer: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/professor/exams/${examId}/questions/${questionId}/answer`, answer, { headers: this.getHeaders() });
  }

  getExamResult(examId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/professor/exams/${examId}/result`, { headers: this.getHeaders() });
  }

  private handleError(error: any) {
    console.error('ExamService - Erreur HTTP:', error);
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error) {
      if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error.message) {
        errorMessage = error.error.message;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}