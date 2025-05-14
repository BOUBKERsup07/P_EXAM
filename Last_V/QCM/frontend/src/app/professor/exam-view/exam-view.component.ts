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
        
        <!-- Informations sur la durée -->
        <div class="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 class="text-lg font-semibold mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Informations sur la durée
          </h3>
          

          
          <!-- Mode de durée utilisé -->
          <div class="mb-3 p-3 rounded-md" [ngClass]="{'bg-indigo-50 border border-indigo-200': hasGlobalDuration(), 'bg-green-50 border border-green-200': !hasGlobalDuration()}">
            <p class="font-medium mb-2" [ngClass]="{'text-indigo-700': hasGlobalDuration(), 'text-green-700': !hasGlobalDuration()}">
              <span *ngIf="hasGlobalDuration()">Mode durée globale</span>
              <span *ngIf="!hasGlobalDuration()">Mode durée par question</span>
            </p>
            <p class="text-sm" [ngClass]="{'text-indigo-600': hasGlobalDuration(), 'text-green-600': !hasGlobalDuration()}">
              <span *ngIf="hasGlobalDuration()">
                Dans ce mode, l'examen a une durée totale fixe de <span class="font-semibold">{{ formatDuration(exam && exam.duration ? exam.duration : 0) }}</span>.
                Les durées individuelles des questions sont indicatives.
              </span>
              <span *ngIf="!hasGlobalDuration()">
                Dans ce mode, chaque question a sa propre durée limitée. La durée totale de l'examen est la somme des durées de toutes les questions.
              </span>
            </p>
          </div>
          
          <!-- Détail des durées par question -->
          <div class="mb-3 p-3 bg-blue-50 rounded-md border border-blue-100">
            <p class="text-blue-700 font-medium mb-2">Détail des durées par question:</p>
            <div class="max-h-60 overflow-y-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-blue-100">
                    <th class="py-2 px-3 text-left">Question</th>
                    <th class="py-2 px-3 text-right">Durée</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let question of exam.questions; let i = index" 
                      [ngClass]="{'bg-blue-50': i % 2 === 0, 'bg-white': i % 2 !== 0}">
                    <td class="py-2 px-3 text-left">{{ i + 1 }}. {{ truncateText(question.text, 40) }}</td>
                    <td class="py-2 px-3 text-right">{{ formatDuration(question.timeLimit) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- Durée totale -->
          <div class="p-3 rounded-md border" [ngClass]="{'bg-indigo-50 border-indigo-100': hasGlobalDuration(), 'bg-green-50 border-green-100': !hasGlobalDuration()}">
            <p [ngClass]="{'text-indigo-700': hasGlobalDuration(), 'text-green-700': !hasGlobalDuration()}">
              <span class="font-medium">
                <span *ngIf="hasGlobalDuration()">Durée totale de l'examen:</span>
                <span *ngIf="!hasGlobalDuration()">Durée totale (somme des questions):</span>
              </span>
              <span class="ml-2 font-semibold">
                <span *ngIf="hasGlobalDuration()">{{ formatDuration(exam && exam.duration ? exam.duration : 0) }}</span>
                <span *ngIf="!hasGlobalDuration()">{{ formatDuration(getTotalQuestionTime()) }}</span>
              </span>
            </p>
          </div>
        </div>
        
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
  
  /**
   * Formate une durée en secondes en format lisible (heures, minutes, secondes)
   * @param seconds Durée en secondes
   * @returns Durée formatée
   */
  formatDuration(seconds: number): string {
    if (!seconds) return '0 seconde';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    let result = '';
    
    if (hours > 0) {
      result += `${hours} heure${hours > 1 ? 's' : ''} `;
    }
    
    if (minutes > 0 || hours > 0) {
      result += `${minutes} minute${minutes > 1 ? 's' : ''} `;
    }
    
    if (remainingSeconds > 0 || (hours === 0 && minutes === 0)) {
      result += `${remainingSeconds} seconde${remainingSeconds > 1 ? 's' : ''}`;
    }
    
    return result.trim();
  }
  
  /**
   * Calcule la durée totale de l'examen en additionnant les durées de chaque question
   * @returns Durée totale en secondes
   */
  getTotalQuestionTime(): number {
    if (!this.exam?.questions) return 0;
    
    return this.exam.questions.reduce((total, question) => {
      return total + (question.timeLimit || 0);
    }, 0);
  }

  /**
   * Tronque un texte s'il dépasse une certaine longueur
   * @param text Texte à tronquer
   * @param maxLength Longueur maximale
   * @returns Texte tronqué
   */
  truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
  
  /**
   * Vérifie si l'examen a une durée globale définie
   * @returns true si l'examen a une durée globale définie, false sinon
   */
  hasGlobalDuration(): boolean {
    console.log('Vérification du mode de durée:', this.exam);
    
    // PRIORITÉ 1: Utiliser directement le champ useDurationPerQuestion s'il est défini
    // Ce champ est maintenant explicitement défini lors de la création/modification de l'examen
    if (this.exam?.useDurationPerQuestion !== undefined) {
      console.log('useDurationPerQuestion est défini:', this.exam.useDurationPerQuestion);
      // C'est le choix explicite de l'utilisateur, le respecter même avec une seule question
      return !this.exam.useDurationPerQuestion;
    }
    
    // PRIORITÉ 2: Pour les anciens examens sans le champ useDurationPerQuestion
    if (this.exam?.duration && this.exam.duration > 0) {
      const totalQuestionTime = this.getTotalQuestionTime();
      console.log('Durée globale:', this.exam.duration, 'Somme des durées des questions:', totalQuestionTime);
      
      // Si la différence est supérieure à 20 secondes, c'est clairement le mode durée globale
      // (nous ajoutons 30 secondes lors de la création en mode durée globale)
      if (this.exam.duration - totalQuestionTime > 20) {
        console.log('Différence significative détectée, mode durée globale');
        return true;
      }
      
      // SUPPRESSION de la détection automatique pour une seule question
      // Nous respectons maintenant le choix explicite de l'utilisateur
    }
    
    // Par défaut, c'est le mode durée par question
    console.log('Mode durée par question détecté');
    return false;
  }
} 