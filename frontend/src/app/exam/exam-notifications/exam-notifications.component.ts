import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamService, ExamCalendarInfo } from '../exam.service';

@Component({
  selector: 'app-exam-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">Notifications d'Examens</h1>

      <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ error }}
      </div>

      <div *ngIf="loading" class="flex justify-center items-center h-32">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>

      <!-- Paramètres de notification -->
      <div *ngIf="!loading" class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Paramètres de notification</h2>
        <p class="text-gray-600 mb-4">Configurez quand vous souhaitez recevoir des rappels pour vos examens à venir.</p>
        
        <div class="space-y-4">
          <div class="flex items-center">
            <input type="checkbox" id="notify-1-week" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" checked>
            <label for="notify-1-week" class="ml-2 block text-sm text-gray-900">1 semaine avant l'examen</label>
          </div>
          
          <div class="flex items-center">
            <input type="checkbox" id="notify-3-days" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" checked>
            <label for="notify-3-days" class="ml-2 block text-sm text-gray-900">3 jours avant l'examen</label>
          </div>
          
          <div class="flex items-center">
            <input type="checkbox" id="notify-1-day" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" checked>
            <label for="notify-1-day" class="ml-2 block text-sm text-gray-900">1 jour avant l'examen</label>
          </div>
          
          <div class="flex items-center">
            <input type="checkbox" id="notify-day-of" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" checked>
            <label for="notify-day-of" class="ml-2 block text-sm text-gray-900">Le jour de l'examen</label>
          </div>
        </div>
        
        <div class="mt-6">
          <button type="button" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Enregistrer les préférences
          </button>
        </div>
      </div>

      <!-- Prochaines notifications -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Prochaines notifications</h2>
        
        <div *ngIf="upcomingExams.length === 0" class="text-gray-500 text-center py-4">
          Aucun examen programmé pour le moment.
        </div>
        
        <div *ngIf="upcomingExams.length > 0" class="space-y-4">
          <div *ngFor="let exam of upcomingExams" class="border-l-4 border-indigo-500 pl-4 py-2">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-medium">{{ exam.name }}</h3>
                <p class="text-sm text-gray-500">{{ exam.subject }}</p>
                <p class="text-sm">{{ exam.startDate | date:'EEEE dd MMMM' }} à {{ exam.startDate | date:'HH:mm' }}</p>
                <p class="text-sm">Salle: {{ exam.location }}</p>
              </div>
              <div class="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {{ getRemainingDays(exam) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ExamNotificationsComponent implements OnInit {
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
        // Filtrer pour ne garder que les examens à venir dans les 7 prochains jours
        const today = new Date();
        const oneWeekLater = new Date(today);
        oneWeekLater.setDate(today.getDate() + 7);
        
        this.upcomingExams = calendarExams
          .filter(exam => {
            const examDate = new Date(exam.startDate);
            return examDate >= today && examDate <= oneWeekLater;
          })
          .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des notifications:', error);
        this.error = 'Erreur lors du chargement des notifications';
        this.loading = false;
      }
    });
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