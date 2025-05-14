import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ExamService } from '../exam.service';
import { Exam } from '../exam.model';

@Component({
  selector: 'app-exam-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-white shadow overflow-hidden sm:rounded-md">
      <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 class="text-lg leading-6 font-medium text-gray-900">Exams</h3>
        <a routerLink="/professor/exams/new" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Create New Exam
        </a>
      </div>
      <ul class="divide-y divide-gray-200">
        <li *ngFor="let exam of exams" class="px-4 py-4 sm:px-6">
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-indigo-600 truncate">
                {{ exam.name }}
              </p>
              <p class="mt-1 text-sm text-gray-500">
                {{ exam.description || 'No description' }}
              </p>
              <p class="mt-1 text-sm text-gray-500">
                {{ (exam.questions || []).length }} questions
              </p>
            </div>
            <div class="flex items-center space-x-4">
              <a [routerLink]="['/professor/exams', exam.id]" 
                 class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                View
              </a>
              <a [routerLink]="['/professor/exams', exam.id, 'edit']" 
                 class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Edit
              </a>
              <button (click)="deleteExam(exam.id)" 
                      class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Delete
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  `,
  styles: []
})
export class ExamListComponent implements OnInit {
  exams: Exam[] = [];
  error: string | null = null;

  constructor(private examService: ExamService) {}

  ngOnInit() {
    this.loadExams();
  }

  loadExams() {
    this.examService.getProfessorExams().subscribe({
      next: (exams) => {
        this.exams = exams.map(exam => ({
          ...exam,
          questions: exam.questions || []
        }));
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des examens';
        console.error('Erreur:', error);
      }
    });
  }

  deleteExam(id: number | undefined): void {
    if (id === undefined) {
      this.error = 'ID de l\'examen non défini';
      return;
    }
    if (confirm('Êtes-vous sûr de vouloir supprimer cet examen ?')) {
      this.examService.deleteExam(id).subscribe({
        next: () => {
          this.exams = this.exams.filter(exam => exam.id !== id);
        },
        error: (err) => {
          this.error = 'Erreur lors de la suppression de l\'examen';
          console.error('Erreur:', err);
        }
      });
    }
  }
}
