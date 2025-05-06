import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ExamService } from '../../exam/exam.service';
import { Exam } from '../../exam/exam.model';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">Tableau de bord de l'étudiant</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">Mes examens</h2>
          <div class="flex flex-col space-y-2">
            <a routerLink="/student/exams" 
               class="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
              Voir les examens disponibles
            </a>
            <a routerLink="/student/exams/calendar" 
               class="inline-block bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700">
              Calendrier des examens
            </a>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">Mes résultats</h2>
          <p>Fonctionnalité à venir...</p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class StudentDashboardComponent {
  availableExams: Exam[] = [];
  completedExams: Exam[] = [];
  loading = true;

  constructor(private examService: ExamService) {
    this.loadExams();
  }

  loadExams(): void {
    this.loading = true;
    this.examService.getAvailableExams().subscribe({
      next: (exams) => {
        this.availableExams = exams;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des examens disponibles:', err);
        this.loading = false;
      }
    });

    this.examService.getCompletedExams().subscribe({
      next: (exams) => {
        this.completedExams = exams;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des examens complétés:', err);
      }
    });
  }
}