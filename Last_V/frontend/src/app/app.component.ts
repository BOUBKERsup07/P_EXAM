import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="min-h-screen bg-gray-100">
      <nav class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex">
              <div class="flex-shrink-0 flex items-center">
                <h1 class="text-xl font-bold">Exam Platform</h1>
              </div>
            </div>
            <div class="flex items-center" *ngIf="authService.getCurrentUser()">
              <div class="flex items-center space-x-4">
                <span class="text-gray-700">
                  {{ authService.getCurrentUser()?.firstName }} {{ authService.getCurrentUser()?.lastName }}
                </span>
                <span class="text-sm text-gray-500">
                  ({{ authService.getCurrentUser()?.role === 'PROFESSOR' ? 'Professeur' : 'Étudiant' }})
                </span>
                <button 
                  (click)="logout()" 
                  class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors duration-200">
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  title = 'exam-platform';

  constructor(
    private router: Router,
    public authService: AuthService
  ) {
    // Écouter les événements de navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      console.log('Navigation terminée:', event.url);
    });
  }

  ngOnInit() {
    // Vérifier l'état de l'authentification au démarrage
    const currentUser = this.authService.getCurrentUser();
    console.log('État initial - Utilisateur:', currentUser);
    
    // Vérifier si l'utilisateur est sur la page d'accueil
    if (this.router.url === '/' || this.router.url === '') {
      // Ne pas rediriger si l'utilisateur est sur la page d'accueil
      console.log('Utilisateur sur la page d\'accueil, pas de redirection');
      return;
    }
    
    if (currentUser) {
      const targetRoute = currentUser.role === 'PROFESSOR' 
        ? '/professor/dashboard' 
        : '/student/dashboard';
      console.log('Redirection initiale vers:', targetRoute);
      this.router.navigate([targetRoute]);
    } else if (this.router.url !== '/login' && this.router.url !== '/register') {
      // Rediriger vers login seulement si l'utilisateur n'est pas déjà sur login ou register
      console.log('Aucun utilisateur connecté, redirection vers login');
      this.router.navigate(['/login']);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
