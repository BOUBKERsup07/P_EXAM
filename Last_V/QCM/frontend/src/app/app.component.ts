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
              <!-- Version desktop -->
              <div class="hidden md:flex items-center space-x-4">
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
              
              <!-- Version mobile -->
              <div class="md:hidden flex items-center">
                <div class="relative">
                  <button 
                    (click)="toggleMobileMenu()" 
                    class="flex items-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none">
                    <span class="sr-only">Menu utilisateur</span>
                    <!-- Icône utilisateur -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  
                  <!-- Menu déroulant mobile -->
                  <div *ngIf="showMobileMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <div class="px-4 py-2 border-b border-gray-100">
                      <p class="text-sm font-medium text-gray-700">{{ authService.getCurrentUser()?.firstName }} {{ authService.getCurrentUser()?.lastName }}</p>
                      <p class="text-xs text-gray-500">{{ authService.getCurrentUser()?.role === 'PROFESSOR' ? 'Professeur' : 'Étudiant' }}</p>
                    </div>
                    <button 
                      (click)="logout()" 
                      class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                      Déconnexion
                    </button>
                  </div>
                </div>
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
  showMobileMenu = false; // Contrôle l'affichage du menu mobile

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
    this.showMobileMenu = false; // Fermer le menu mobile après déconnexion
  }
  
  /**
   * Affiche ou masque le menu mobile
   */
  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }
}
