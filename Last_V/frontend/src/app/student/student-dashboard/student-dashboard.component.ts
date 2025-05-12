import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExamService } from '../../exam/exam.service';
import { Exam } from '../../exam/exam.model';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header with welcome message -->
      <header class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-6 shadow-md">
        <div class="container mx-auto px-4">
          <h1 class="text-3xl font-bold">Tableau de bord de l'étudiant</h1>
          <p class="mt-2 opacity-80">Bienvenue dans votre espace personnel</p>
        </div>
      </header>

      <!-- Main content -->
      <div class="container mx-auto px-4 py-8">
        <!-- Stats overview -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow-sm p-6 border-l-4 border-indigo-500">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p class="text-sm text-gray-500 uppercase">Examens complétés</p>
                <p class="text-xl font-semibold">{{ recentResults.length || 0 }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-sm text-gray-500 uppercase">Score moyen</p>
                <p class="text-xl font-semibold">{{ getAverageScore() }}%</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-sm text-gray-500 uppercase">Dernier examen</p>
                <p class="text-xl font-semibold">{{ getLastExamDate() }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Main content grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Access exam card -->
          <div class="bg-white rounded-lg shadow-sm overflow-hidden">
            <div class="bg-indigo-600 px-6 py-4 text-white">
              <h2 class="text-xl font-semibold">Accéder à un examen</h2>
            </div>
            <div class="p-6">
              <p class="text-gray-600 mb-4">Entrez le code d'accès fourni par votre professeur pour commencer un nouvel examen.</p>
              <form (ngSubmit)="submitExamCode()" class="space-y-4">
                <div>
                  <label for="examCode" class="block text-sm font-medium text-gray-700 mb-1">Code d'accès</label>
                  <input
                    id="examCode"
                    type="text"
                    [(ngModel)]="examCode"
                    (ngModelChange)="onExamCodeChange()"
                    name="examCode"
                    class="border border-gray-300 p-2 rounded-md w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Entrez le code à 8 caractères"
                    required
                    minlength="8"
                  />
                  <div *ngIf="isCheckingCode" class="mt-1 text-sm text-gray-500">
                    <span class="inline-block animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-indigo-600 mr-1"></span>
                    Vérification du code...
                  </div>
                </div>
                <button 
                  type="submit" 
                  class="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition flex items-center justify-center"
                  [disabled]="!examCode"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                  Commencer l'examen
                </button>
              </form>
              <div *ngIf="errorMessage" class="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                <div class="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {{ errorMessage }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Results section -->
          <div class="lg:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
            <div class="bg-indigo-600 px-6 py-4 text-white flex justify-between items-center">
              <h2 class="text-xl font-semibold">Mes résultats</h2>
              <span class="bg-indigo-500 text-xs rounded-full px-3 py-1">{{ recentResults.length }} examen(s)</span>
            </div>
            
            <!-- Loading state -->
            <div *ngIf="resultsLoading" class="p-8 text-center">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mb-2"></div>
              <p class="text-gray-500">Chargement des résultats...</p>
            </div>
            
            <!-- Results list -->
            <div *ngIf="!resultsLoading && recentResults.length > 0" class="divide-y divide-gray-200">
              <div *ngFor="let result of recentResults" class="p-6 hover:bg-gray-50 transition">
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="font-medium text-lg text-gray-900">{{ result.examName }}</h3>
                    <p class="text-sm text-gray-500 mt-1">
                      <span class="inline-flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {{ result.formattedDate || (result.submissionDate | date:'dd/MM/yyyy HH:mm') }}
                      </span>
                    </p>
                  </div>
                  <div class="flex items-center">
                    <div class="text-center mr-4">
                      <div class="relative inline-flex items-center justify-center w-16 h-16">
                        <svg class="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                          <circle class="text-gray-200" stroke-width="10" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50"/>
                          <circle 
                            [ngClass]="{'text-green-500': result.score >= 60, 'text-yellow-500': result.score >= 40 && result.score < 60, 'text-red-500': result.score < 40}"
                            stroke-width="10" 
                            stroke="currentColor" 
                            fill="transparent" 
                            r="40" 
                            cx="50" 
                            cy="50"
                            [attr.stroke-dasharray]="251.2"
                            [attr.stroke-dashoffset]="251.2 - (251.2 * result.score / 100)"/>
                        </svg>
                        <span class="absolute text-sm font-semibold">{{ result.score }}%</span>
                      </div>
                    </div>
                    <a [routerLink]="['/student/exams', result.examId, 'result']" 
                       class="inline-flex items-center px-3 py-1.5 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 transition text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Détails
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- No results state -->
            <div *ngIf="!resultsLoading && recentResults.length === 0" class="p-8 text-center">
              <div class="inline-block p-3 rounded-full bg-gray-100 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-1">Aucun résultat disponible</h3>
              <p class="text-gray-500 max-w-md mx-auto">Vous n'avez pas encore passé d'examen. Utilisez le code d'accès fourni par votre professeur pour commencer.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class StudentDashboardComponent {
  examCode: string = '';
  errorMessage: string = '';
  recentResults: any[] = [];
  resultsLoading = false;
  isCheckingCode = false;
  codeCheckTimeout: any = null;

  constructor(private examService: ExamService, private router: Router) {
    this.loadRecentResults();
  }
  
  getAverageScore(): number {
    if (!this.recentResults || this.recentResults.length === 0) {
      return 0;
    }
    const totalScore = this.recentResults.reduce((sum, result) => sum + result.score, 0);
    return Math.round(totalScore / this.recentResults.length);
  }
  
  getLastExamDate(): string {
    if (!this.recentResults || this.recentResults.length === 0) {
      return 'Aucun';
    }
    
    // Sort results by date (newest first) and get the first one
    const sortedResults = [...this.recentResults].sort((a, b) => {
      const dateA = a.submissionDate ? new Date(a.submissionDate) : new Date(0);
      const dateB = b.submissionDate ? new Date(b.submissionDate) : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
    
    const lastResult = sortedResults[0];
    if (lastResult.formattedDate) {
      return lastResult.formattedDate.split(' ')[0]; // Return just the date part
    } else if (lastResult.submissionDate) {
      const date = new Date(lastResult.submissionDate);
      return date.toLocaleDateString();
    }
    
    return 'Aucun';
  }

  onExamCodeChange(): void {
    // Clear any previous timeout
    if (this.codeCheckTimeout) {
      clearTimeout(this.codeCheckTimeout);
    }
    
    // Clear any previous error message
    this.errorMessage = '';
    
    // If the code is empty, don't do anything
    if (!this.examCode || this.examCode.length < 6) {
      return;
    }
    
    // Set a timeout to check the code after the user stops typing
    this.codeCheckTimeout = setTimeout(() => {
      this.isCheckingCode = true;
      
      this.examService.checkExamAccessCode(this.examCode).subscribe({
        next: (response: any) => {
          this.isCheckingCode = false;
          
          if (!response.canAccess) {
            this.errorMessage = response.message;
          }
        },
        error: (error) => {
          this.isCheckingCode = false;
          console.error('Error checking exam code:', error);
        }
      });
    }, 500); // 500ms delay
  }

  submitExamCode(): void {
    if (!this.examCode) return;
    
    if (this.errorMessage) {
      // If there's an error message, don't proceed
      return;
    }
    
    this.errorMessage = '';
    
    this.examService.getExamByAccessCode(this.examCode)
      .pipe(
        catchError(error => {
          console.error('Error accessing exam:', error);
          this.errorMessage = this.getErrorMessage(error.status);
          return of(null);
        })
      )
      .subscribe({
        next: (exam: Exam | null) => {
          if (exam?.id) {
            this.router.navigate(['/student/exams', exam.id, 'take']);
          } else if (exam === null) {
            // Géré par catchError
          } else {
            this.errorMessage = 'Code invalide ou examen introuvable.';
          }
        }
      });
  }

  private getErrorMessage(status: number): string {
    switch (status) {
      case 403:
        return 'Accès refusé à cet examen.';
      case 404:
        return 'Aucun examen trouvé avec ce code.';
      case 0:
        return 'Impossible de se connecter au serveur.';
      default:
        return 'Une erreur est survenue. Veuillez réessayer.';
    }
  }

  loadRecentResults(): void {
    this.resultsLoading = true;
    this.examService.getStudentResults().subscribe({
      next: (results) => {
        this.recentResults = results;
        this.resultsLoading = false;
      },
      error: (error) => {
        console.error('Error loading results:', error);
        this.resultsLoading = false;
      }
    });
  }
}