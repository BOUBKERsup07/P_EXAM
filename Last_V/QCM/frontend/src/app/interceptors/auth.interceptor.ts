import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();
  const currentUser = authService.getCurrentUser();
  
  console.log('Auth Interceptor - URL:', req.url);
  console.log('Auth Interceptor - Token présent:', !!token);
  console.log('Auth Interceptor - Utilisateur actuel:', currentUser);
  
  if (token) {
    console.log('Auth Interceptor - Headers avant:', req.headers.keys());
    const clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    console.log('Auth Interceptor - Headers après:', clonedReq.headers.keys());
    console.log('Auth Interceptor - Token ajouté:', `Bearer ${token}`);
    
    return next(clonedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Auth Interceptor - Erreur:', {
          status: error.status,
          message: error.message,
          headers: error.headers.keys(),
          error: error.error
        });
        
        if (error.status === 401) {
          console.log('Auth Interceptor - Token expiré ou invalide, déconnexion...');
          authService.logout();
          router.navigate(['/login']);
        } else if (error.status === 403) {
          console.log('Auth Interceptor - Accès refusé, redirection...');
          const errorMessage = error.error?.message || 'Vous n\'avez pas les permissions nécessaires pour accéder à cette ressource';
          return throwError(() => new Error(errorMessage));
        }
        return throwError(() => error);
      })
    );
  }
  return next(req);
}; 