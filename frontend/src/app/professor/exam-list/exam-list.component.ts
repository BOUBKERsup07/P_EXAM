import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ExamService } from '../../exam/exam.service';
import { Exam } from '../../exam/exam.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-exam-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Mes examens</h1>
        <button routerLink="/professor/exams/new" 
                class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
          Créer un nouvel examen
        </button>
      </div>

      <!-- Loading spinner -->
      <div *ngIf="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>

      <!-- Error message -->
      <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ error }}
      </div>

      <!-- Empty state -->
      <div *ngIf="!loading && !error && exams.length === 0" 
           class="bg-gray-100 rounded-lg p-8 text-center">
        <p class="text-gray-600 mb-4">Vous n'avez pas encore créé d'examen.</p>
        <button routerLink="/professor/exams/new" 
                class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
          Créer votre premier examen
        </button>
      </div>

      <!-- Exams list -->
      <div *ngIf="!loading && !error && exams.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let exam of exams" class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-2">{{ exam.name }}</h2>
          <p class="text-gray-600 mb-4">{{ exam.description }}</p>
          <div class="text-sm text-gray-500 mb-4">
            {{ (exam.questions || []).length }} questions
          </div>
          <div class="flex justify-end space-x-2">
            <button [routerLink]="['/professor/exams', exam.id, 'view']" 
                    class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
              View
            </button>
            <button [routerLink]="['/professor/exams', exam.id, 'edit']" 
                    class="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700">
              Modifier
            </button>
            <button (click)="deleteExam(exam.id)" 
                    class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ExamListComponent implements OnInit {
  exams: Exam[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private examService: ExamService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadExams();
  }

  loadExams() {
    this.loading = true;
    this.error = null;
    
    this.examService.getProfessorExams().subscribe({
      next: (exams) => {
        this.exams = exams;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des examens:', err);
        this.error = 'Une erreur est survenue lors du chargement des examens.';
        this.loading = false;
        this.toastr.error(this.error);
      }
    });
  }

  deleteExam(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet examen ?')) {
      this.examService.deleteExam(id).subscribe({
        next: () => {
          this.toastr.success('L\'examen a été supprimé avec succès.');
          this.loadExams();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression de l\'examen:', err);
          this.toastr.error('Une erreur est survenue lors de la suppression de l\'examen.');
        }
      });
    }
  }
}