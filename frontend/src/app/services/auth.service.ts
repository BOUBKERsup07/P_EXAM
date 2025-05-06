import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private currentUserSubject = new BehaviorSubject<string | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Vérifier si un token existe dans le localStorage
    const storedEmail = localStorage.getItem('studentEmail');
    if (storedEmail) {
      this.currentUserSubject.next(storedEmail);
    }
  }

  // Authentification professeur
  loginTeacher(email: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/teacher/login`, { email, password })
      .pipe(
        tap(response => {
          localStorage.setItem('teacherToken', response.token);
        })
      );
  }

  // Authentification étudiant
  loginStudent(email: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/student/login`, { email })
      .pipe(
        tap(() => {
          localStorage.setItem('studentEmail', email);
          this.currentUserSubject.next(email);
        })
      );
  }

  // Vérification de l'authentification
  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  // Déconnexion
  logout(): void {
    localStorage.removeItem('studentEmail');
    localStorage.removeItem('teacherToken');
    this.currentUserSubject.next(null);
  }

  // Vérification du rôle
  isTeacher(): boolean {
    return !!localStorage.getItem('teacherToken');
  }

  getCurrentUser(): string | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  removeToken(): void {
    localStorage.removeItem('token');
  }
}
