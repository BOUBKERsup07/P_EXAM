import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExamService } from '../exam.service';
import { Exam, ExamResult } from '../exam.model';

@Component({
  selector: 'app-exam-features',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">Fonctionnalités d'Examen</h1>

      <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ error }}
      </div>

      <div *ngIf="loading" class="flex justify-center items-center h-32">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>

      <!-- Export des résultats -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Export des résultats</h2>
        <p class="text-gray-600 mb-4">Exportez vos résultats d'examens dans différents formats.</p>
        
        <div class="flex space-x-4">
          <button (click)="exportResults('pdf')" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Exporter en PDF
          </button>
          <button (click)="exportResults('excel')" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exporter en Excel
          </button>
        </div>
      </div>

      <!-- Modèles d'examens -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Modèles d'examens</h2>
        <p class="text-gray-600 mb-4">Utilisez des templates prédéfinis pour différents types d'examens.</p>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition">
            <h3 class="font-medium mb-2">QCM Standard</h3>
            <p class="text-sm text-gray-500">Questions à choix multiples avec une seule réponse correcte.</p>
            <button (click)="useTemplate('qcm')" class="mt-3 text-indigo-600 hover:text-indigo-800 text-sm font-medium">Utiliser ce modèle</button>
          </div>
          <div class="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition">
            <h3 class="font-medium mb-2">Vrai/Faux</h3>
            <p class="text-sm text-gray-500">Questions avec réponses vrai ou faux uniquement.</p>
            <button (click)="useTemplate('true-false')" class="mt-3 text-indigo-600 hover:text-indigo-800 text-sm font-medium">Utiliser ce modèle</button>
          </div>
          <div class="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition">
            <h3 class="font-medium mb-2">Réponses Courtes</h3>
            <p class="text-sm text-gray-500">Questions nécessitant des réponses textuelles brèves.</p>
            <button (click)="useTemplate('short-answer')" class="mt-3 text-indigo-600 hover:text-indigo-800 text-sm font-medium">Utiliser ce modèle</button>
          </div>
        </div>
      </div>

      <!-- Feedback détaillé -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Feedback détaillé</h2>
        <p class="text-gray-600 mb-4">Consultez les explications pour chaque mauvaise réponse.</p>
        
        <div *ngIf="selectedExam" class="space-y-4">
          <div *ngFor="let answer of selectedExam.answers" class="border rounded-lg p-4" [ngClass]="{'bg-red-50': !answer.isCorrect, 'bg-green-50': answer.isCorrect}">
            <h3 class="font-medium mb-2">{{ answer.questionText }}</h3>
            <p class="text-sm mb-1"><span class="font-medium">Votre réponse:</span> {{ answer.studentAnswer }}</p>
            <p class="text-sm mb-1"><span class="font-medium">Réponse correcte:</span> {{ answer.correctAnswer }}</p>
            <div *ngIf="!answer.isCorrect" class="mt-2 p-3 bg-white rounded border border-red-200">
              <p class="text-sm font-medium text-red-800">Explication:</p>
              <p class="text-sm text-gray-700">{{ answer.explanation || 'La réponse correcte est plus appropriée car elle correspond mieux aux critères de la question.' }}</p>
            </div>
          </div>
        </div>
        
        <div *ngIf="!selectedExam" class="text-center py-4 text-gray-500">
          Sélectionnez un examen pour voir le feedback détaillé.
        </div>
      </div>

      <!-- Historique des examens -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Historique des examens</h2>
        <p class="text-gray-600 mb-4">Suivez votre progression à travers les examens passés.</p>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Examen</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progression</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let exam of completedExams">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ exam.name }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">{{ exam.completionDate | date:'dd/MM/yyyy' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ exam.score }}/100</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="w-full bg-gray-200 rounded-full h-2.5">
                    <div class="bg-indigo-600 h-2.5 rounded-full" [style.width.%]="exam.score"></div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button (click)="viewExamDetails(exam)" class="text-indigo-600 hover:text-indigo-900">Détails</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Détection de fraude -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Détection de fraude</h2>
        <p class="text-gray-600 mb-4">Paramètres de sécurité pour les examens.</p>
        
        <div class="space-y-4">
          <div class="flex items-center">
            <input type="checkbox" id="tab-detection" [(ngModel)]="fraudDetection.tabDetection" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
            <label for="tab-detection" class="ml-2 block text-sm text-gray-900">Détection de changement d'onglet</label>
          </div>
          
          <div class="flex items-center">
            <input type="checkbox" id="face-recognition" [(ngModel)]="fraudDetection.faceRecognition" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
            <label for="face-recognition" class="ml-2 block text-sm text-gray-900">Reconnaissance faciale pendant l'examen</label>
          </div>
          
          <div class="flex items-center">
            <input type="checkbox" id="copy-paste" [(ngModel)]="fraudDetection.copyPaste" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
            <label for="copy-paste" class="ml-2 block text-sm text-gray-900">Détection de copier-coller</label>
          </div>
        </div>
        
        <div class="mt-6">
          <button (click)="saveFraudDetectionSettings()" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Enregistrer les paramètres
          </button>
        </div>
      </div>

      <!-- Mode sombre/clair -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Apparence</h2>
        <p class="text-gray-600 mb-4">Personnalisez l'apparence de l'application.</p>
        
        <div class="flex items-center justify-between max-w-xs">
          <span class="text-sm text-gray-700">Mode clair</span>
          <div class="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
            <input type="checkbox" id="toggle-theme" [(ngModel)]="darkMode" (change)="toggleTheme()" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
            <label for="toggle-theme" class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
          </div>
          <span class="text-sm text-gray-700">Mode sombre</span>
        </div>
      </div>

      <!-- Adaptation aux différents handicaps -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Accessibilité</h2>
        <p class="text-gray-600 mb-4">Options d'adaptation aux différents handicaps.</p>
        
        <div class="space-y-4">
          <div class="flex items-center">
            <input type="checkbox" id="high-contrast" [(ngModel)]="accessibility.highContrast" (change)="updateAccessibility()" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
            <label for="high-contrast" class="ml-2 block text-sm text-gray-900">Mode contraste élevé</label>
          </div>
          
          <div class="flex items-center">
            <input type="checkbox" id="screen-reader" [(ngModel)]="accessibility.screenReader" (change)="updateAccessibility()" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
            <label for="screen-reader" class="ml-2 block text-sm text-gray-900">Compatibilité lecteur d'écran</label>
          </div>
          
          <div class="flex items-center">
            <input type="checkbox" id="text-to-speech" [(ngModel)]="accessibility.textToSpeech" (change)="updateAccessibility()" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
            <label for="text-to-speech" class="ml-2 block text-sm text-gray-900">Synthèse vocale</label>
          </div>
          
          <div class="mt-4">
            <label for="font-size" class="block text-sm font-medium text-gray-700">Taille de police</label>
            <input type="range" id="font-size" [(ngModel)]="accessibility.fontSize" (change)="updateAccessibility()" min="100" max="200" step="10" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
            <div class="flex justify-between text-xs text-gray-500">
              <span>Normal</span>
              <span>Grand</span>
              <span>Très grand</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Questions audio/vidéo -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Questions multimédias</h2>
        <p class="text-gray-600 mb-4">Créez des examens avec des questions audio et vidéo.</p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="border rounded-lg p-4">
            <h3 class="font-medium mb-2">Questions audio</h3>
            <p class="text-sm text-gray-500 mb-4">Ajoutez des questions avec des fichiers audio pour les examens de langues ou de musique.</p>
            <button class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Créer une question audio</button>
          </div>
          
          <div class="border rounded-lg p-4">
            <h3 class="font-medium mb-2">Questions vidéo</h3>
            <p class="text-sm text-gray-500 mb-4">Ajoutez des questions basées sur des vidéos pour une évaluation plus interactive.</p>
            <button class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Créer une question vidéo</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toggle-checkbox:checked {
      right: 0;
      border-color: #4F46E5;
    }
    .toggle-checkbox:checked + .toggle-label {
      background-color: #4F46E5;
    }
  `]
})
export class ExamFeaturesComponent implements OnInit {
  error: string | null = null;
  loading = false;
  completedExams: Exam[] = [];
  selectedExam: ExamResult | null = null;
  darkMode = false;
  
  fraudDetection = {
    tabDetection: true,
    faceRecognition: false,
    copyPaste: true
  };
  
  accessibility = {
    highContrast: false,
    screenReader: false,
    textToSpeech: false,
    fontSize: 100
  };

  constructor(private examService: ExamService) {}

  ngOnInit(): void {
    this.loadCompletedExams();
    this.loadUserPreferences();
  }

  loadCompletedExams(): void {
    this.loading = true;
    this.examService.getCompletedExams().subscribe({
      next: (exams) => {
        this.completedExams = exams;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des examens complétés:', error);
        this.error = 'Erreur lors du chargement des examens';
        this.loading = false;
      }
    });
  }

  loadUserPreferences(): void {
    // Simuler le chargement des préférences utilisateur
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      this.darkMode = savedTheme === 'true';
      this.applyTheme();
    }
    
    const savedAccessibility = localStorage.getItem('accessibility');
    if (savedAccessibility) {
      this.accessibility = JSON.parse(savedAccessibility);
      this.applyAccessibility();
    }
    
    const savedFraudDetection = localStorage.getItem('fraudDetection');
    if (savedFraudDetection) {
      this.fraudDetection = JSON.parse(savedFraudDetection);
    }
  }

  exportResults(format: 'pdf' | 'excel'): void {
    // Simulation d'export
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      alert(`Export en ${format.toUpperCase()} réussi!`);
    }, 1500);
  }

  useTemplate(templateType: string): void {
    // Simulation d'utilisation de template
    alert(`Template ${templateType} sélectionné. Redirection vers l'éditeur d'examen...`);
  }

  viewExamDetails(exam: Exam): void {
    // Simuler le chargement des détails d'un examen
    this.loading = true;
    setTimeout(() => {
      this.selectedExam = {
        id: 1,
        exam: exam,
        student: {
          id: 1,
          email: 'etudiant.test@example.com',
          name: 'Étudiant Test'
        },
        score: exam.score || 0,
        completionDate: exam.completionDate ? exam.completionDate.toString() : new Date().toString(),
        submissionDate: new Date().toString(),
        answers: [
          {
            id: 1,
            questionId: 1,
            questionText: 'Question exemple 1',
            answer: 'Réponse incorrecte',
            studentAnswer: 'Réponse incorrecte',
            correctAnswer: 'Réponse correcte',
            isCorrect: false,
            explanation: 'Cette réponse est incorrecte car elle ne prend pas en compte tous les aspects de la question.'
          },
          {
            id: 2,
            questionId: 2,
            questionText: 'Question exemple 2',
            answer: 'Réponse correcte',
            studentAnswer: 'Réponse correcte',
            correctAnswer: 'Réponse correcte',
            isCorrect: true
          }
        ]
      };
      this.loading = false;
    }, 1000);
  }

  saveFraudDetectionSettings(): void {
    // Sauvegarder les paramètres de détection de fraude
    localStorage.setItem('fraudDetection', JSON.stringify(this.fraudDetection));
    alert('Paramètres de détection de fraude enregistrés!');
  }

  toggleTheme(): void {
    this.darkMode = !this.darkMode;
    localStorage.setItem('darkMode', this.darkMode.toString());
    this.applyTheme();
  }

  applyTheme(): void {
    if (this.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  updateAccessibility(): void {
    localStorage.setItem('accessibility', JSON.stringify(this.accessibility));
    this.applyAccessibility();
  }

  applyAccessibility(): void {
    // Appliquer les paramètres d'accessibilité
    document.documentElement.style.fontSize = `${this.accessibility.fontSize}%`;
    
    if (this.accessibility.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }
}