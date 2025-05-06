import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ExamService } from '../../exam/exam.service';
import { Exam } from '../../exam/exam.model';

@Component({
  selector: 'app-student-exam-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">Mes Examens</h1>

      <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ error }}
      </div>

      <div *ngIf="loading" class="flex justify-center items-center h-32">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>

      <div *ngIf="!loading && exams.length === 0" class="bg-gray-50 p-6 text-center rounded-lg">
        <p class="text-gray-600">Aucun examen disponible pour le moment.</p>
      </div>

      <div *ngIf="!loading && exams.length > 0" class="grid gap-6">
        <div *ngFor="let exam of exams" class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <h3 class="text-xl font-semibold text-indigo-600 mb-2">
                {{ exam.name }}
              </h3>
              <p class="text-gray-600 mb-2">
                {{ exam.description || 'Pas de description' }}
              </p>
              <p class="text-sm text-gray-500">
                {{ exam.questions.length }} questions
              </p>
            </div>
            <div>
              <button [routerLink]="['/student/exams', exam.id, 'take']" 
                      class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Commencer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class StudentExamListComponent implements OnInit {
  exams: Exam[] = [];
  error: string | null = null;
  loading = true;

  constructor(private examService: ExamService) {}

  ngOnInit(): void {
    this.loadExams();
  }

  loadExams(): void {
    this.loading = true;
    this.examService.getAvailableExams().subscribe({
      next: (exams) => {
        console.log('Examens reçus (données brutes):', exams);
        // S'assurer que chaque examen a un tableau de questions
        this.exams = exams.map(exam => ({
          ...exam,
          questions: Array.isArray(exam.questions) ? exam.questions : []
        }));
        console.log('Examens traités:', this.exams);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des examens:', error);
        this.error = 'Erreur lors du chargement des examens';
        this.loading = false;
      }
    });
  }
} 