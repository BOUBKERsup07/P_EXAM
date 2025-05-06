import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Exam, ExamResult } from './exam.model';
import { AuthService } from '../auth/auth.service';

export interface ExamCalendarInfo {
  id: number;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  subject: string;
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private checkProfessorRole(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.role === 'PROFESSOR';
  }

  getProfessorExams(): Observable<Exam[]> {
    console.log('ExamService - Récupération des examens du professeur');
    return this.http.get<Exam[]>(`${environment.apiUrl}/professor/exams`, { headers: this.headers }).pipe(
      tap(exams => console.log('ExamService - Examens reçus:', exams)),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('ExamService - Erreur HTTP:', {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      error: error.error,
      rawResponse: error instanceof HttpErrorResponse ? error : 'Non HTTP Error'
    });
    
    let errorMessage = 'Une erreur est survenue';
    
    if (error.status === 200 && error.error instanceof ProgressEvent) {
      console.log('ExamService - Réponse brute reçue:', error);
      errorMessage = 'Erreur lors de la lecture de la réponse du serveur';
    } else if (error.status === 403) {
      errorMessage = 'Vous n\'avez pas les permissions nécessaires pour accéder à cette ressource';
    } else if (error.status === 401) {
      errorMessage = 'Votre session a expiré, veuillez vous reconnecter';
    } else if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur: ${error.error.message}`;
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }

  getAvailableExams(): Observable<Exam[]> {
    console.log('ExamService - Récupération des examens disponibles');
    return this.http.get<Exam[]>(`${environment.apiUrl}/student/exams/available`, { headers: this.headers }).pipe(
      tap(response => console.log('ExamService - Réponse des examens disponibles:', response)),
      catchError(this.handleError.bind(this))
    );
  }

  getCompletedExams(): Observable<Exam[]> {
    return this.http.get<Exam[]>(`${environment.apiUrl}/student/exams/completed`, { headers: this.headers }).pipe(
      tap(response => console.log('ExamService - Réponse des examens complétés:', response)),
      catchError(this.handleError)
    );
  }

  getExam(id: number): Observable<Exam> {
    console.log(`ExamService - Récupération de l'examen ${id}`);
    const role = this.checkProfessorRole() ? 'professor' : 'student';
    return this.http.get<Exam>(`${environment.apiUrl}/${role}/exams/${id}`, { 
      headers: this.headers,
      observe: 'response'
    }).pipe(
      tap(response => {
        console.log('ExamService - Headers de la réponse:', {
          contentType: response.headers.get('Content-Type'),
          contentLength: response.headers.get('Content-Length'),
          allHeaders: Object.fromEntries(response.headers.keys().map(key => [key, response.headers.get(key)]))
        });
        console.log('ExamService - Corps de la réponse brut:', response.body);
        if (response.body) {
          console.log('ExamService - Structure de la réponse:', {
            hasId: 'id' in response.body,
            hasName: 'name' in response.body,
            hasQuestions: 'questions' in response.body,
            questionsType: response.body.questions ? typeof response.body.questions : 'undefined',
            isQuestionsArray: Array.isArray(response.body.questions),
            questionsLength: Array.isArray(response.body.questions) ? response.body.questions.length : 'N/A'
          });
        }
      }),
      map(response => {
        if (!response.body) {
          throw new Error('La réponse du serveur est vide');
        }
        return response.body;
      }),
      catchError(this.handleError.bind(this))
    );
  }

  createExam(exam: Partial<Exam>): Observable<Exam> {
    return this.http.post<Exam>(`${environment.apiUrl}/professor/exams`, exam, { headers: this.headers }).pipe(
      catchError(this.handleError)
    );
  }

  updateExam(id: number, exam: Partial<Exam>): Observable<Exam> {
    if (!this.checkProfessorRole()) {
      return throwError(() => new Error('Seuls les professeurs peuvent modifier les examens'));
    }

    return this.http.put<Exam>(`${environment.apiUrl}/professor/exams/${id}`, exam, { headers: this.headers }).pipe(
      catchError(this.handleError)
    );
  }

  deleteExam(id: number): Observable<void> {
    if (!this.checkProfessorRole()) {
      return throwError(() => new Error('Seuls les professeurs peuvent supprimer les examens'));
    }

    return this.http.delete<void>(`${environment.apiUrl}/professor/exams/${id}`, { headers: this.headers }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Soumet les réponses d'un examen au serveur
   * @param examId - L'identifiant de l'examen
   * @param answers - Les réponses de l'étudiant
   * @returns Un Observable contenant le résultat de l'examen
   */
  submitExam(examId: number, answers: { questionId: number; answer: string; answerId: number | null; questionType?: string }[]): Observable<ExamResult> {
    // Formatage amélioré des soumissions pour assurer la compatibilité avec le backend
    const submissions = answers.map(a => {
      // Structure de base commune à tous les types de questions
      const baseSubmission = {
        question: { id: a.questionId },
        isCorrect: null // Le backend déterminera si la réponse est correcte
      };

      // Pour les questions à choix multiples (QCM)
      if (a.questionType === 'MULTIPLE_CHOICE' || (a.answerId !== null && a.answerId !== undefined)) {
        return {
          ...baseSubmission,
          answerId: a.answerId, // ID de la réponse sélectionnée pour les QCM
          answer: a.answer,     // Texte de la réponse (pour le débogage et la traçabilité)
          type: 'MULTIPLE_CHOICE'
        };
      } 
      // Pour les questions à réponse directe
      else {
        return {
          ...baseSubmission,
          answer: a.answer?.trim(), // Texte de la réponse directe (nettoyé des espaces inutiles)
          type: 'DIRECT_ANSWER'
        };
      }
    });

    console.log('ExamService - Soumission des réponses:', JSON.stringify(submissions, null, 2));
    
    // Assurons-nous que les headers sont correctement définis
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    // Ajout d'un timestamp pour tracer le temps de réponse du serveur
    const startTime = Date.now();

    return this.http.post<ExamResult>(`${environment.apiUrl}/student/exams/${examId}/submit`, submissions, { 
      headers: headers,
      observe: 'response'
    }).pipe(
      tap(response => {
        const responseTime = Date.now() - startTime;
        console.log(`ExamService - Réponse reçue en ${responseTime}ms`);
        console.log('ExamService - Headers de la réponse de soumission:', {
          contentType: response.headers.get('Content-Type'),
          allHeaders: Object.fromEntries(response.headers.keys().map(key => [key, response.headers.get(key)]))
        });
        console.log('ExamService - Corps de la réponse de soumission:', response.body);
      }),
      map(response => {
        if (!response.body) {
          throw new Error('La réponse du serveur est vide');
        }
        return response.body;
      }),
      tap(result => {
        console.log('ExamService - Résultat de la soumission:', result);
        console.log('ExamService - Score obtenu:', result.score);
        if (result.answers && Array.isArray(result.answers)) {
          const correctAnswers = result.answers.filter(a => a.isCorrect).length;
          const totalAnswers = result.answers.length;
          console.log(`ExamService - Réponses correctes: ${correctAnswers}/${totalAnswers}`);
        }
      }),
      catchError(error => {
        console.error('ExamService - Erreur lors de la soumission:', error);
        // Ajout d'informations détaillées sur l'erreur pour faciliter le débogage
        if (error instanceof HttpErrorResponse) {
          console.error('ExamService - Détails de l\'erreur HTTP:', {
            status: error.status,
            statusText: error.statusText,
            url: error.url,
            error: error.error
          });
        }
        return this.handleError(error);
      })
    );
  }

  getExamResult(examId: number): Observable<ExamResult> {
    return this.http.get<ExamResult>(`${environment.apiUrl}/student/exams/${examId}/result`, { headers: this.headers }).pipe(
      catchError(this.handleError)
    );
  }

  getProfessorExam(id: number): Observable<Exam> {
    return this.http.get<Exam>(`${environment.apiUrl}/professor/exams/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<string>(`${environment.apiUrl}/professor/exams/upload-image`, formData).pipe(
      catchError(this.handleError)
    );
  }

  getExamForStudent(examId: number): Observable<Exam> {
    return this.http.get<Exam>(`${environment.apiUrl}/student/exams/${examId}`, { headers: this.headers }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Récupère les examens à venir avec les informations de calendrier
   * @returns Un Observable contenant la liste des examens avec les informations de calendrier
   */
  getExamsCalendar(): Observable<ExamCalendarInfo[]> {
    console.log('ExamService - Récupération du calendrier des examens');
    return this.http.get<Exam[]>(`${environment.apiUrl}/student/exams/available`, { headers: this.headers }).pipe(
      map(exams => {
        // Transformation des examens pour ajouter les informations de calendrier
        // Dans un environnement de production, ces informations viendraient du backend
        return exams.map(exam => {
          // Création d'une date de début basée sur la date actuelle + un nombre aléatoire de jours (pour la démo)
          const today = new Date();
          const startDate = new Date(today);
          startDate.setDate(today.getDate() + Math.floor(Math.random() * 14) + 1); // Entre 1 et 15 jours à partir d'aujourd'hui
          startDate.setHours(8 + Math.floor(Math.random() * 8), 0, 0); // Entre 8h et 16h
          
          // Calcul de la date de fin basée sur la durée de l'examen
          const endDate = new Date(startDate);
          const durationInMinutes = Math.floor(exam.duration / 60);
          endDate.setMinutes(startDate.getMinutes() + durationInMinutes);
          
          // Extraction du nom de la matière à partir du nom de l'examen
          const subjects = ['Mathématiques', 'Physique', 'Informatique', 'Anglais', 'Histoire', 'Biologie'];
          let subject = 'Matière non spécifiée';
          
          for (const s of subjects) {
            if (exam.name.toLowerCase().includes(s.toLowerCase())) {
              subject = s;
              break;
            }
          }
          
          // Génération d'une salle aléatoire pour la démo
          const location = `Salle ${100 + Math.floor(Math.random() * 20)}`;
          
          return {
            id: exam.id,
            name: exam.name,
            description: exam.description,
            startDate,
            endDate,
            location,
            subject,
            duration: exam.duration
          };
        }).sort((a, b) => a.startDate.getTime() - b.startDate.getTime()); // Tri par date
      }),
      tap(calendarExams => console.log('ExamService - Calendrier des examens:', calendarExams)),
      catchError(error => {
        console.error('ExamService - Erreur lors de la récupération du calendrier:', error);
        return this.handleError(error);
      })
    );
  }
}