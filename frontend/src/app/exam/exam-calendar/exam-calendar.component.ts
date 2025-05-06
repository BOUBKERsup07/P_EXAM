import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ExamService, ExamCalendarInfo } from '../exam.service';

// Utilisation de l'interface ExamCalendarInfo du service

@Component({
  selector: 'app-exam-calendar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">Calendrier des Examens</h1>

      <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ error }}
      </div>

      <div *ngIf="loading" class="flex justify-center items-center h-32">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>

      <!-- Vue Calendrier -->
      <div *ngIf="!loading" class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Examens à venir</h2>
        
        <div *ngIf="upcomingExams.length === 0" class="text-gray-500 text-center py-4">
          Aucun examen programmé pour le moment.
        </div>
        
        <div *ngIf="upcomingExams.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matière</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heure</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durée</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salle</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let exam of upcomingExams">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ exam.subject }}</div>
                  <div class="text-sm text-gray-500">{{ exam.name }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ exam.startDate | date:'dd/MM/yyyy' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ exam.startDate | date:'HH:mm' }} - {{ exam.endDate | date:'HH:mm' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ getDurationInMinutes(exam) }} minutes</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ exam.location }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button [routerLink]="['/student/exams', exam.id, 'take']" 
                          class="text-indigo-600 hover:text-indigo-900">
                    Détails
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Rappels -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Rappels</h2>
        <div class="space-y-4">
          <div *ngFor="let exam of upcomingExams.slice(0, 3)" class="flex items-start p-4 border rounded-lg">
            <div class="flex-shrink-0 bg-indigo-100 rounded-full p-2 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 class="font-medium">{{ exam.name }}</h3>
              <p class="text-sm text-gray-500">{{ getRemainingDays(exam) }}</p>
              <p class="text-sm">{{ exam.startDate | date:'EEEE dd MMMM' }} à {{ exam.startDate | date:'HH:mm' }}</p>
              <p class="text-sm">Salle: {{ exam.location }}</p>
            </div>
          </div>
          
          <div *ngIf="upcomingExams.length === 0" class="text-gray-500 text-center py-4">
            Aucun rappel pour le moment.
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ExamCalendarComponent implements OnInit {
  upcomingExams: ExamCalendarInfo[] = [];
  error: string | null = null;
  loading = true;

  constructor(private examService: ExamService) {}

  ngOnInit(): void {
    this.loadExams();
  }

  loadExams(): void {
    this.loading = true;
    this.examService.getExamsCalendar().subscribe({
      next: (calendarExams) => {
        this.upcomingExams = calendarExams;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du calendrier des examens:', error);
        this.error = 'Erreur lors du chargement du calendrier des examens';
        this.loading = false;
      }
    });
  }

  // Cette méthode n'est plus nécessaire car la logique a été déplacée dans le service

  // Calcul de la durée en minutes
  getDurationInMinutes(exam: ExamCalendarInfo): number {
    return Math.floor(exam.duration / 60);
  }

  // Calcul du nombre de jours restants avant l'examen
  getRemainingDays(exam: ExamCalendarInfo): string {
    const today = new Date();
    const examDate = new Date(exam.startDate);
    const diffTime = Math.abs(examDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Aujourd'hui";
    } else if (diffDays === 1) {
      return "Demain";
    } else {
      return `Dans ${diffDays} jours`;
    }
  }
}