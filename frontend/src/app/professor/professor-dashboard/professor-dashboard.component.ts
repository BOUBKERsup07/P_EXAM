import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ExamService } from '../../exam/exam.service';

@Component({
  selector: 'app-professor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">Tableau de bord du professeur</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">Mes examens</h2>
          <a routerLink="/professor/exams" 
             class="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
            Gérer mes examens
          </a>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">Statistiques</h2>
          <p>Fonctionnalité à venir...</p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProfessorDashboardComponent {
  exams: any[] = [];
  loading = false;

  constructor(private examService: ExamService) {
    this.loadExams();
  }

  loadExams() {
    this.loading = true;
    this.examService.getProfessorExams().subscribe({
      next: (exams) => {
        this.exams = exams;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des examens:', err);
        this.loading = false;
      }
    });
  }

  shareExam(exam: any) {
    // Implémentation de la méthode de partage
    console.log('Partage de l\'examen:', exam);
  }
} 