import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'PROFESSOR';
}

export interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkStoredAuth();
  }

  private checkStoredAuth() {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('currentUser');
    
    console.log('Auth Service - Stored Token:', storedToken ? 'Present' : 'Absent');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      console.log('Auth Service - Stored User:', {
        email: user.email,
        role: user.role,
        id: user.id
      });
      this.currentUserSubject.next(user);
    } else {
      console.log('Auth Service - No stored user');
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    if (!email || !password) {
      return throwError(() => new Error('Email et mot de passe requis'));
    }

    console.log('Auth Service - Tentative de connexion avec:', { email });
    
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          console.log('Auth Service - Réponse de connexion:', {
            tokenPresent: !!response.token,
            user: {
              email: response.user.email,
              role: response.user.role,
              id: response.user.id
            }
          });
          
          if (!response.token || !response.user) {
            throw new Error('Réponse invalide du serveur');
          }

          if (!response.user.role) {
            console.error('Auth Service - Rôle manquant dans la réponse:', response.user);
            throw new Error('Rôle utilisateur manquant');
          }

          localStorage.setItem('token', response.token);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
          
          const storedToken = localStorage.getItem('token');
          const storedUser = localStorage.getItem('currentUser');
          
          if (!storedToken || !storedUser) {
            throw new Error('Erreur lors du stockage des informations de connexion');
          }
          
          console.log('Auth Service - Stockage réussi:', {
            tokenStored: !!storedToken,
            userStored: !!storedUser
          });
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Auth Service - Erreur de connexion:', {
            status: error.status,
            message: error.message,
            error: error.error
          });
          let errorMessage = 'Une erreur est survenue lors de la connexion';
          if (error.status === 400) {
            errorMessage = error.error?.message || 'Email ou mot de passe incorrect';
          } else if (error.status === 403) {
            errorMessage = 'Email ou mot de passe incorrect';
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  register(userData: any): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${environment.apiUrl}/auth/register`, userData);
  }

  logout(): void {
    console.log('Auth Service - Déconnexion');
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    const token = localStorage.getItem('token');
    console.log('Auth Service - Get Token:', token ? 'Present' : 'Absent');
    return token;
  }
} 