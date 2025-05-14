import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
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
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  private getStoredUser(): User | null {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
    } catch (error) {
      console.error('Error parsing stored user:', error);
      localStorage.removeItem('currentUser');
    }
    return null;
  }

  private decodeJwtToken(token: string): User | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const payload = JSON.parse(jsonPayload);
      console.log('Decoded JWT payload:', payload);

      if (!payload.sub || !payload.role) {
        throw new Error('Invalid token payload');
      }

      // Remove ROLE_ prefix if present
      const role = payload.role.replace('ROLE_', '');

      return {
        id: payload.id || 0,
        email: payload.sub,
        firstName: payload.firstName || '',
        lastName: payload.lastName || '',
        role: role as 'STUDENT' | 'PROFESSOR'
      };
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Auth Service Error:', error);
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Erreur ${error.status}: ${error.message}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<AuthResponse> {
    console.log('Auth Service - Tentative de connexion avec:', { email });
    
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          console.log('Auth Service - Réponse du serveur:', response);
          if (response?.token) {
            const user = this.decodeJwtToken(response.token);
            if (user) {
              localStorage.setItem('token', response.token);
              localStorage.setItem('currentUser', JSON.stringify(user));
              this.currentUserSubject.next(user);
            } else {
              throw new Error('Impossible de décoder les informations utilisateur');
            }
          } else {
            throw new Error('Token manquant dans la réponse');
          }
        }),
        map(response => {
          const user = this.decodeJwtToken(response.token);
          if (!user) {
            throw new Error('Impossible de décoder les informations utilisateur');
          }
          return { token: response.token, user };
        }),
        catchError(this.handleError)
      );
  }

  register(userData: any): Observable<any> {
    console.log('Auth Service - Tentative d\'inscription avec:', { email: userData.email, role: userData.role });
    
    return this.http.post<any>(`${this.apiUrl}/auth/register`, userData)
      .pipe(
        tap(response => {
          console.log('Auth Service - Réponse d\'inscription:', response);
        }),
        catchError(this.handleError)
      );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const user = this.decodeJwtToken(token);
      return !!user;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
} 