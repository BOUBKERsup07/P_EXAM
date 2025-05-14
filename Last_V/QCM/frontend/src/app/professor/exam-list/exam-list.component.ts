import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
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
    <div class="bg-gray-50 min-h-screen pb-12">
      <!-- En-tête avec fond coloré et ombre -->
      <div class="bg-gradient-to-r from-indigo-700 to-purple-700 text-white shadow-lg mb-8">
        <div class="container mx-auto px-4 py-6">
          <div class="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 class="text-3xl font-bold mb-2">Mes examens</h1>
              <p class="text-indigo-100">Gérez vos examens et suivez les performances de vos étudiants</p>
            </div>
            <div class="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <button routerLink="/professor/dashboard" 
                      class="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg shadow transition duration-200 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Tableau de bord
              </button>
              <button routerLink="/professor/exams/new" 
                      class="bg-white text-indigo-700 px-4 py-2 rounded-lg shadow hover:bg-indigo-50 transition duration-200 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Créer un examen
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="container mx-auto px-4">
        <!-- Statistiques des examens -->
        <div *ngIf="!loading && !error && exams.length > 0" class="bg-white rounded-xl shadow-md p-6 mb-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-indigo-50 rounded-lg p-4 flex items-center">
              <div class="bg-indigo-100 rounded-full p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p class="text-gray-500 text-sm">Total examens</p>
                <p class="text-2xl font-bold text-gray-800">{{ exams.length }}</p>
              </div>
            </div>
            <div class="bg-green-50 rounded-lg p-4 flex items-center">
              <div class="bg-green-100 rounded-full p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-gray-500 text-sm">Questions créées</p>
                <p class="text-2xl font-bold text-gray-800">{{ getTotalQuestions() }}</p>
              </div>
            </div>
            <div class="bg-purple-50 rounded-lg p-4 flex items-center">
              <div class="bg-purple-100 rounded-full p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-gray-500 text-sm">Durée moyenne</p>
                <p class="text-2xl font-bold text-gray-800">{{ getAverageDuration() }} min</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading spinner -->
        <div *ngIf="loading" class="flex justify-center items-center h-64">
          <div class="relative">
            <div class="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600"></div>
            <div class="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
              <span class="text-indigo-600 text-sm font-medium">Chargement</span>
            </div>
          </div>
        </div>

        <!-- Error message -->
        <div *ngIf="error" class="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md mb-6 flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p class="font-bold">Erreur</p>
            <p>{{ error }}</p>
          </div>
        </div>

        <!-- Empty state -->
        <div *ngIf="!loading && !error && exams.length === 0" 
             class="bg-white rounded-xl shadow-md p-8 text-center max-w-lg mx-auto">
          <div class="bg-indigo-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">Aucun examen trouvé</h2>
          <p class="text-gray-600 mb-6">Vous n'avez pas encore créé d'examen. Commencez par créer votre premier examen.</p>
          <button routerLink="/professor/exams/new" 
                  class="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-indigo-700 transition duration-200 flex items-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Créer votre premier examen
          </button>
        </div>

        <!-- Exams list -->
        <div *ngIf="!loading && !error && exams.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let exam of exams" class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
            <!-- En-tête de la carte avec badge de statut -->
            <div class="p-5 border-b border-gray-100 flex justify-between items-start">
              <div>
                <h2 class="text-xl font-bold text-gray-800 mb-1 line-clamp-1">{{ exam.name }}</h2>
                <div class="flex items-center text-sm text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>ID: {{ exam.id }}</span>
                </div>
              </div>
              <span *ngIf="getExamStatus(exam) === 'active'" class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Actif
              </span>
              <span *ngIf="getExamStatus(exam) === 'taken'" class="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Passé
              </span>
              <span *ngIf="getExamStatus(exam) === 'scheduled'" class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Planifié
              </span>
              <span *ngIf="getExamStatus(exam) === 'completed'" class="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Terminé
              </span>
              <span *ngIf="getExamStatus(exam) === 'draft'" class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Brouillon
              </span>
            </div>
            
            <!-- Corps de la carte -->
            <div class="p-5 flex-grow">
              <p class="text-gray-600 mb-4 text-sm line-clamp-2">{{ exam.description || 'Aucune description' }}</p>
              
              <!-- Statistiques de l'examen -->
              <div class="grid grid-cols-2 gap-3 mb-4">
                <div class="bg-gray-50 rounded-lg p-2 text-center">
                  <p class="text-xs text-gray-500">Questions</p>
                  <p class="font-bold text-gray-800">{{ (exam.questions || []).length }}</p>
                </div>
                <div class="bg-gray-50 rounded-lg p-2 text-center">
                  <p class="text-xs text-gray-500">Durée</p>
                  <p class="font-bold text-gray-800">{{ formatDuration(exam.duration) }}</p>
                </div>
              </div>
              
              <!-- Code d'accès -->
              <div class="mb-4">
                <p class="text-xs text-gray-500 mb-1">Code d'accès:</p>
                <div class="flex items-center">
                  <span class="font-mono font-medium bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-md border border-indigo-200 shadow-sm flex-grow text-center">{{ exam.accessCode }}</span>
                  <button 
                    class="ml-2 p-2 bg-indigo-100 rounded-full text-indigo-600 hover:bg-indigo-200 hover:text-indigo-800 transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-300" 
                    (click)="copyAccessCode(exam.accessCode, $event)" 
                    title="Copier le code d'accès"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-12a2 2 0 00-2-2h-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="p-4 bg-gray-50 border-t border-gray-100">
              <div class="flex justify-between">
                <button [routerLink]="['/professor/exams', exam.id, 'view']" 
                        class="flex items-center justify-center text-blue-600 hover:text-blue-800 transition duration-200 px-3 py-1 rounded-lg hover:bg-blue-50">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Voir
                </button>
                <button [routerLink]="['/professor/exams', exam.id, 'edit']" 
                        class="flex items-center justify-center text-yellow-600 hover:text-yellow-800 transition duration-200 px-3 py-1 rounded-lg hover:bg-yellow-50">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Modifier
                </button>
                <button (click)="confirmDeleteExam(exam)" 
                        class="flex items-center justify-center text-red-600 hover:text-red-800 transition duration-200 px-3 py-1 rounded-lg hover:bg-red-50">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de confirmation de suppression -->
    <div *ngIf="examToDelete" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all">
        <div class="text-center mb-4">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Confirmer la suppression</h3>
          <p class="text-sm text-gray-500">
            Êtes-vous sûr de vouloir supprimer l'examen <span class="font-semibold">{{ examToDelete.name }}</span> ? Cette action est irréversible.  
          </p>
        </div>
        <div class="flex justify-end space-x-3">
          <button (click)="cancelDelete()" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-200">
            Annuler
          </button>
          <button (click)="confirmDelete()" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ExamListComponent implements OnInit, OnDestroy {
  exams: Exam[] = [];
  loading = false;
  error: string | null = null;
  examToDelete: Exam | null = null;
  destroy$ = new Subject<void>();
  examStatistics: any = null; // Statistiques des examens
  examsWithResults: number[] = []; // IDs des examens qui ont des résultats

  constructor(
    private examService: ExamService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadExams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadExams() {
    this.loading = true;
    this.error = null;
    
    // Charger d'abord les statistiques pour savoir quels examens ont des résultats
    this.examService.getProfessorExamStatistics().subscribe({
      next: (stats) => {
        this.examStatistics = stats;
        
        // Récupérer les IDs des examens qui ont des résultats
        if (stats && stats.examAverages) {
          this.examsWithResults = Object.keys(stats.examAverages).map(id => parseInt(id));
        }
        
        // Ensuite, charger les examens
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
      },
      error: (err) => {
        console.error('Erreur lors du chargement des statistiques:', err);
        // Continuer à charger les examens même si les statistiques échouent
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
    });
  }

  copyAccessCode(code: string, event: Event) {
    event.stopPropagation();
    
    // Récupérer le bouton qui a été cliqué
    const button = event.currentTarget as HTMLElement;
    
    // Ajouter une classe pour l'animation de feedback
    button.classList.add('bg-green-200', 'text-green-800');
    
    // Retirer la classe après l'animation
    setTimeout(() => {
      button.classList.remove('bg-green-200', 'text-green-800');
    }, 500);
    
    navigator.clipboard.writeText(code)
      .then(() => {
        this.toastr.success('Code d\'accès copié dans le presse-papiers', 'Succès!', {
          timeOut: 2000,
          positionClass: 'toast-bottom-right',
          progressBar: true,
          closeButton: true
        });
      })
      .catch(err => {
        console.error('Erreur lors de la copie du code d\'accès:', err);
        this.toastr.error('Impossible de copier le code d\'accès', 'Erreur', {
          timeOut: 3000,
          positionClass: 'toast-bottom-right',
          progressBar: true,
          closeButton: true
        });
      });
  }

  /**
   * Affiche la boîte de dialogue de confirmation de suppression
   * @param exam Examen à supprimer
   */
  confirmDeleteExam(exam: Exam) {
    this.examToDelete = exam;
  }
  
  /**
   * Annule la suppression et ferme la boîte de dialogue
   */
  cancelDelete() {
    this.examToDelete = null;
  }
  
  /**
   * Confirme la suppression de l'examen
   */
  confirmDelete() {
    if (this.examToDelete) {
      const examId = this.examToDelete.id;
      this.examToDelete = null;
      
      this.examService.deleteExam(examId).subscribe({
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
  
  /**
   * Calcule le nombre total de questions dans tous les examens
   * @returns Nombre total de questions
   */
  getTotalQuestions(): number {
    return this.exams.reduce((total, exam) => {
      return total + (exam.questions ? exam.questions.length : 0);
    }, 0);
  }
  
  /**
   * Calcule la durée moyenne des examens en minutes
   * @returns Durée moyenne en minutes
   */
  getAverageDuration(): string {
    if (this.exams.length === 0) return '0';
    
    const totalDuration = this.exams.reduce((total, exam) => {
      return total + (exam.duration || 0);
    }, 0);
    
    // Convertir les secondes en minutes avec 1 décimale
    const avgMinutes = (totalDuration / this.exams.length / 60).toFixed(1);
    return avgMinutes;
  }
  
  /**
   * Formate un ID en format lisible (pour compatibilité avec le code précédent)
   * @param id ID à formater
   * @returns ID formaté
   */
  formatId(id?: number): string {
    return id ? `#${id}` : 'ID inconnu';
  }
  
  /**
   * Formate une durée en secondes en format lisible
   * @param seconds Durée en secondes
   * @returns Durée formatée
   */
  formatDuration(seconds?: number): string {
    if (!seconds) return '0 min';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes === 0) {
      return `${remainingSeconds} sec`;
    } else if (remainingSeconds === 0) {
      return `${minutes} min`;
    } else {

      return `${minutes} min ${remainingSeconds} sec`;
    }
  }
  
  /**
   * Méthode de suppression directe (pour compatibilité)
   * @param id ID de l'examen à supprimer
   */
  deleteExam(id: number) {
    // Trouver l'examen correspondant à l'ID
    const exam = this.exams.find(e => e.id === id);
    if (exam) {
      this.confirmDeleteExam(exam);
    }
  }



  /**
   * Détermine le statut d'un examen en fonction de ses caractéristiques
   * @param exam L'examen à évaluer
   * @returns Le statut de l'examen: 'active', 'scheduled', 'completed', 'taken' ou 'draft'
   */
  getExamStatus(exam: Exam): string {
    // Si l'examen a déjà été passé par au moins un étudiant (vérification via les statistiques)
    if (exam.id && this.examsWithResults.includes(exam.id)) {
      return 'taken';
    }
    
    const now = new Date();
    const startTime = exam.startTime ? new Date(exam.startTime) : null;
    const endTime = exam.endTime ? new Date(exam.endTime) : null;
    
    // Si l'examen a une date de fin et qu'elle est passée
    if (endTime && now > endTime) {
      return 'completed';
    }
    
    // Si l'examen a une date de début et qu'elle n'est pas encore arrivée
    if (startTime && now < startTime) {
      return 'scheduled';
    }
    
    // Si l'examen n'a pas de questions ou a un code d'accès vide, considérer comme brouillon
    if (!exam.questions || exam.questions.length === 0 || !exam.accessCode) {
      return 'draft';
    }
    
    // Si on est entre la date de début et la date de fin (ou si les dates ne sont pas définies)
    // l'examen est actif
    return 'active';
  }
}