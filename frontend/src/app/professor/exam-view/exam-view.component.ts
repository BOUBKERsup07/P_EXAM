import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ExamService } from '../../exam/exam.service';
import { Exam } from '../../exam/exam.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-exam-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Détails de l'examen</h1>
        <div class="space-x-2">
          <button [routerLink]="['/professor/exams', exam?.id, 'edit']" 
                  class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
            Modifier
          </button>
          <button routerLink="/professor/exams" 
                  class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
            Retour
          </button>
        </div>
      </div>

      <!-- Loading spinner -->
      <div *ngIf="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>

      <!-- Error message -->
      <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ error }}
      </div>

      <!-- Exam details -->
      <div *ngIf="!loading && !error && exam" class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-semibold mb-4">{{ exam.name }}</h2>
        <p class="text-gray-600 mb-6">{{ exam.description }}</p>
        
        <div class="mb-6">
          <h3 class="text-xl font-semibold mb-4">Questions</h3>
          <div *ngFor="let question of exam.questions; let i = index" class="mb-4 p-4 border rounded-lg">
            <p class="font-medium mb-2">{{ i + 1 }}. {{ question.text }}</p>
            <div *ngIf="question.type === 'MULTIPLE_CHOICE'" class="ml-4">
              <div *ngFor="let answer of question.answers" class="flex items-center mb-2">
                <span class="mr-2">{{ answer.text }}</span>
                <span *ngIf="answer.isCorrect" class="text-green-600">✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ExamViewComponent implements OnInit {
  exam: Exam | null = null;
  loading = false;
  error: string | null = null;
  examId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private examService: ExamService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.examId = id ? +id : null;
    this.loadExam();
  }

  loadExam() {
    if (!this.examId) {
      this.error = 'ID de l\'examen non valide';
      this.toastr.error(this.error);
      return;
    }

    this.loading = true;
    this.error = null;

    this.examService.getProfessorExam(this.examId).subscribe({
      next: (exam) => {
        this.exam = exam;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement de l\'examen:', err);
        this.error = 'Une erreur est survenue lors du chargement de l\'examen.';
        this.loading = false;
        this.toastr.error(this.error);
      }
    });
  }
} 