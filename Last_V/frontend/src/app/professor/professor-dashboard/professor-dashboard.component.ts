import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ExamService, ExamStatistics } from '../../exam/exam.service';
import { ToastrService } from 'ngx-toastr';

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
          
          <!-- Loading spinner -->
          <div *ngIf="loading" class="flex justify-center items-center h-32">
            <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>

          <!-- Error message -->
          <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {{ error }}
          </div>

          <!-- Statistics -->
          <div *ngIf="!loading && !error && statistics" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="text-sm font-medium text-gray-500">Total des examens</h3>
                <p class="text-2xl font-semibold text-gray-900">{{ statistics.totalExams }}</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="text-sm font-medium text-gray-500">Total des questions</h3>
                <p class="text-2xl font-semibold text-gray-900">{{ statistics.totalQuestions }}</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="text-sm font-medium text-gray-500">Total des résultats</h3>
                <p class="text-2xl font-semibold text-gray-900">{{ statistics.totalResults }}</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="text-sm font-medium text-gray-500">Moyenne des scores</h3>
                <p class="text-2xl font-semibold text-gray-900">
                  {{ getAverageScore() | number:'1.0-1' }}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProfessorDashboardComponent implements OnInit {
  statistics: ExamStatistics | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private examService: ExamService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadStatistics();
  }

  loadStatistics() {
    this.loading = true;
    this.error = null;

    this.examService.getProfessorExamStatistics().subscribe({
      next: (stats) => {
        this.statistics = stats;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des statistiques:', err);
        this.error = 'Une erreur est survenue lors du chargement des statistiques.';
        this.loading = false;
        this.toastr.error(this.error);
      }
    });
  }

  getAverageScore(): number {
    if (!this.statistics || !this.statistics.examAverages) {
      return 0;
    }
    const scores = Object.values(this.statistics.examAverages);
    if (scores.length === 0) {
      return 0;
    }
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }
} 