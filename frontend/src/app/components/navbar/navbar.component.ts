import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="bg-indigo-600 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <a routerLink="/" class="text-white text-xl font-bold">ExamPlatform</a>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a routerLink="/" class="text-white hover:text-indigo-100 px-3 py-2 rounded-md text-sm font-medium">Accueil</a>
              
              <!-- Liens pour les professeurs -->
              <ng-container *ngIf="authService.isLoggedIn() && authService.hasRole('PROFESSOR')">
                <a routerLink="/professor/dashboard" class="text-white hover:text-indigo-100 px-3 py-2 rounded-md text-sm font-medium">Tableau de bord</a>
                <a routerLink="/professor/exams" class="text-white hover:text-indigo-100 px-3 py-2 rounded-md text-sm font-medium">Mes examens</a>
              </ng-container>
              
              <!-- Liens pour les étudiants -->
              <ng-container *ngIf="authService.isLoggedIn() && authService.hasRole('STUDENT')">
                <a routerLink="/student/dashboard" class="text-white hover:text-indigo-100 px-3 py-2 rounded-md text-sm font-medium">Tableau de bord</a>
                <a routerLink="/student/exams" class="text-white hover:text-indigo-100 px-3 py-2 rounded-md text-sm font-medium">Examens disponibles</a>
                <a routerLink="/student/exams/calendar" class="text-white hover:text-indigo-100 px-3 py-2 rounded-md text-sm font-medium">Calendrier</a>
                <a routerLink="/student/exams/notifications" class="text-white hover:text-indigo-100 px-3 py-2 rounded-md text-sm font-medium">Notifications</a>
                <a routerLink="/student/exams/features" class="text-white hover:text-indigo-100 px-3 py-2 rounded-md text-sm font-medium">Fonctionnalités</a>
              </ng-container>
            </div>
          </div>
          <div class="hidden sm:ml-6 sm:flex sm:items-center">
            <div class="ml-3 relative">
              <div *ngIf="!authService.isLoggedIn()">
                <a routerLink="/login" class="text-white hover:text-indigo-100 px-3 py-2 rounded-md text-sm font-medium">Connexion</a>
                <a routerLink="/register" class="bg-white text-indigo-600 hover:bg-indigo-50 ml-2 px-3 py-2 rounded-md text-sm font-medium">Inscription</a>
              </div>
              <div *ngIf="authService.isLoggedIn()" class="flex items-center">
                <span class="text-white mr-2">{{ authService.getCurrentUser()?.username }}</span>
                <button (click)="logout()" class="bg-indigo-700 text-white hover:bg-indigo-800 px-3 py-2 rounded-md text-sm font-medium">Déconnexion</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: []
})