import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Rediriger vers la page de login si non authentifié
          this.router.navigate(['/auth/login']);
        } else if (error.status === 403) {
          // Rediriger vers la page d'accueil si non autorisé
          this.router.navigate(['/']);
        }
        // Vous pouvez ajouter d'autres traitements d'erreur ici
        return throwError(() => error);
      })
    );
  }
} 