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
            
            <!-- Image de la question (si disponible) -->
            <div class="my-3 text-center">
              <ng-container *ngIf="question.imageUrl">
                <img [src]="question.imageUrl" alt="Image de la question" class="max-h-64 rounded shadow-sm" />
              </ng-container>
              <div *ngIf="!question.imageUrl" class="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                <i class="fas fa-info-circle mr-2"></i>
                Aucune image n'a été fournie pour cette question.
              </div>
            </div>
            
            <!-- Affichage des réponses pour les questions à choix multiple -->
            <div *ngIf="question.type === 'MULTIPLE_CHOICE'" class="ml-4">
              <h4 class="text-lg font-medium mb-2">Options de réponse :</h4>
              <div *ngFor="let answer of question.answers" class="flex items-center mb-2">
                <span class="mr-2">{{ answer.text }}</span>
                <span *ngIf="answer.isCorrect" class="text-green-600 font-bold">✓ Correcte</span>
              </div>
            </div>
            
            <!-- Affichage des informations pour les questions à réponse directe -->
            <div *ngIf="question.type === 'DIRECT_ANSWER'" class="ml-4">
              <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 class="text-lg font-medium mb-2">Réponse directe</h4>
                
                <div class="mb-3">
                  <span class="font-medium text-gray-700">Réponse correcte :</span>
                  <span class="ml-2 text-green-600 font-semibold">{{ question.answers[0].text }}</span>
                </div>
                
                <div *ngIf="question.answers[0].keywords" class="mb-2">
                  <span class="font-medium text-gray-700">Mots-clés acceptés :</span>
                  <div class="mt-1">
                    <span *ngFor="let keyword of getKeywords(question.answers[0].keywords)" 
                          class="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm mr-2 mb-2">
                      {{ keyword }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-500 mt-1">
                    Si tous ces mots-clés sont présents dans la réponse de l'étudiant, elle sera considérée comme correcte
                    même si elle ne correspond pas exactement à la réponse attendue.
                  </p>
                </div>
                
                <div *ngIf="!question.answers[0].keywords" class="text-sm text-gray-500">
                  Aucun mot-clé défini. Seule la correspondance exacte sera acceptée.
                </div>
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
        this.error = err.message || 'Une erreur est survenue lors du chargement de l\'examen.';
        this.loading = false;
        this.toastr.error(this.error || 'Une erreur est survenue');
      }
    });
  }
  
  /**
   * Convertit une chaîne de mots-clés séparés par des virgules en tableau
   * @param keywordsString Chaîne de mots-clés séparés par des virgules
   * @returns Tableau de mots-clés
   */
  getKeywords(keywordsString: string | undefined): string[] {
    if (!keywordsString) return [];
    return keywordsString.split(',').map(keyword => keyword.trim()).filter(keyword => keyword.length > 0);
  }
} 