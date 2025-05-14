import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ExamService } from '../../exam/exam.service';
import { Exam, Question, Answer } from '../../exam/exam.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-exam-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <!-- Barre de navigation flottante -->  
    <div class="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
      <button (click)="scrollToTop()" class="bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
      <button (click)="scrollToBottom()" class="bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>
      <button (click)="addQuestion()" class="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
    
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">{{ isEditMode ? "Modifier l'examen" : "Créer un nouvel examen" }}</h1>
        <button routerLink="/professor/exams" 
                class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
          Retour
        </button>
      </div>

      <form [formGroup]="examForm" (ngSubmit)="onSubmit()" class="bg-white rounded-lg shadow p-6">
        <!-- Informations de base de l'examen -->
        <div class="mb-6 pb-6 border-b border-gray-200">
          <h2 class="text-xl font-semibold mb-4">Informations générales</h2>
          
          <div class="mb-4">
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Titre de l'examen</label>
            <input type="text" id="name" formControlName="name" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  [class.border-red-500]="examForm.get('name')?.invalid && examForm.get('name')?.touched">
            <div *ngIf="examForm.get('name')?.invalid && examForm.get('name')?.touched" 
                class="text-red-500 text-sm mt-1">
              Le titre de l'examen est requis
            </div>
          </div>

          <div class="mb-4">
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea id="description" formControlName="description" rows="3"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      [class.border-red-500]="examForm.get('description')?.invalid && examForm.get('description')?.touched"></textarea>
            <div *ngIf="examForm.get('description')?.invalid && examForm.get('description')?.touched" 
                class="text-red-500 text-sm mt-1">
              La description est requise
            </div>
          </div>
          
          <!-- Gestion du temps -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Gestion du temps</label>
            
            <div class="flex items-center space-x-4 mb-3">
              <div class="flex items-center">
                <input type="radio" id="timePerQuestion" name="timeOption" [checked]="!useGlobalDuration" 
                       (change)="useGlobalDuration = false"
                       class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300">
                <label for="timePerQuestion" class="ml-2 text-sm text-gray-700">Durée par question</label>
              </div>
              
              <div class="flex items-center">
                <input type="radio" id="globalTime" name="timeOption" [checked]="useGlobalDuration" 
                       (change)="useGlobalDuration = true"
                       class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300">
                <label for="globalTime" class="ml-2 text-sm text-gray-700">Durée globale de l'examen</label>
              </div>
            </div>
            
            <div *ngIf="useGlobalDuration" class="bg-blue-50 p-4 rounded-md">
              <label for="globalDuration" class="block text-sm font-medium text-gray-700 mb-1">Durée totale de l'examen (minutes)</label>
              <input type="number" id="globalDuration" formControlName="globalDuration" min="1" step="0.01"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     [class.border-red-500]="examForm.get('globalDuration')?.invalid && examForm.get('globalDuration')?.touched"
                     (input)="onDurationInput($event)">
              <div *ngIf="examForm.get('globalDuration')?.invalid && examForm.get('globalDuration')?.touched" 
                  class="text-red-500 text-sm mt-1">
                La durée de l'examen doit être d'au moins 1 minute
              </div>
              <p class="text-sm text-gray-600 mt-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                En mode durée globale, les temps limites individuels des questions seront ignorés.
              </p>
            </div>
          </div>
        </div>

        <!-- Menu de navigation des questions -->
        <div class="mb-6" *ngIf="questionsArray.length > 0">
          <h2 class="text-xl font-semibold mb-3">Navigation rapide</h2>
          <div class="flex flex-wrap gap-2 p-3 bg-gray-100 rounded-lg mb-4 max-h-32 overflow-y-auto">
            <button 
              *ngFor="let _ of questionsArray.controls; let i = index"
              type="button" 
              (click)="scrollToQuestion(i)"
              class="px-3 py-1 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 text-sm flex items-center"
            >
              <span>Q{{ i + 1 }}</span>
            </button>
          </div>
        </div>
        
        <!-- Section des questions -->
        <div class="mb-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Questions</h2>
            <div class="flex space-x-2">
              <span class="text-gray-600 mr-2">{{ questionsArray.length }} question(s)</span>
              <button type="button" (click)="addQuestion()" 
                      class="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Ajouter une question
              </button>
            </div>
          </div>

          <div formArrayName="questions">
            <div *ngFor="let questionForm of questionsArray.controls; let i = index" 
                 [formGroupName]="i" 
                 [id]="'question-' + i"
                 class="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50 relative">
              
              <!-- Badge numéroté de la question -->  
              <div class="absolute -top-3 -left-3 bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md">
                {{ i + 1 }}
              </div>
              
              <!-- En-tête de la question avec boutons de navigation -->  
              <div class="flex justify-between items-center mb-3 bg-gray-200 p-2 rounded">
                <h3 class="text-lg font-medium">Question {{ i + 1 }}</h3>
                <div class="flex space-x-2">
                  <!-- Bouton précédent -->  
                  <button *ngIf="i > 0" type="button" (click)="scrollToQuestion(i-1)" 
                          class="text-indigo-600 hover:text-indigo-800 p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <!-- Bouton supprimer -->  
                  <button type="button" (click)="removeQuestion(i)" 
                          class="text-red-600 hover:text-red-800 p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <!-- Bouton suivant -->  
                  <button *ngIf="i < questionsArray.length - 1" type="button" (click)="scrollToQuestion(i+1)" 
                          class="text-indigo-600 hover:text-indigo-800 p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Texte de la question</label>
                <input type="text" formControlName="text" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Image (optionnel)</label>
                <div class="flex items-center space-x-2">
                  <input type="file" 
                         (change)="onFileSelected($event, i)"
                         accept="image/*"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <button type="button" 
                          (click)="uploadImage(i)"
                          [disabled]="!selectedFiles[i]"
                          class="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
                    Télécharger
                  </button>
                  <button *ngIf="questionForm.get('imageUrl')?.value" type="button" 
                          (click)="removeImage(i)"
                          class="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                    Supprimer
                  </button>
                </div>
                <div *ngIf="questionForm.get('imageUrl')?.value" class="mt-2">
                  <img [src]="questionForm.get('imageUrl')?.value" 
                       alt="Image de la question" 
                       class="max-h-32 rounded-md">
                </div>
                <div *ngIf="!questionForm.get('imageUrl')?.value" class="mt-2 text-sm text-gray-500">
                  Vous pouvez continuer sans ajouter d'image.
                </div>
              </div>

              <!-- Temps limite par question (visible uniquement en mode durée par question) -->
              <div class="mb-4" *ngIf="!useGlobalDuration">
                <label class="block text-sm font-medium text-gray-700 mb-1">Temps limite (secondes)</label>
                <input type="number" formControlName="timeLimit" min="10" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
              <!-- Message informatif en mode durée globale -->
              <div class="mb-4" *ngIf="useGlobalDuration">
                <div class="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                  <p class="text-sm text-yellow-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Vous avez choisi le mode durée globale. Le temps sera réparti automatiquement entre les questions.
                  </p>
                </div>
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Type de question</label>
                <select formControlName="type" 
                        (change)="onQuestionTypeChange(i)"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="MULTIPLE_CHOICE">Choix multiple</option>
                  <option value="DIRECT_ANSWER">Réponse directe</option>
                </select>
              </div>

              <!-- Section des réponses (uniquement pour les QCM) -->
              <div *ngIf="questionForm.get('type')?.value === 'MULTIPLE_CHOICE'" class="mt-4 pl-4 border-l-4 border-indigo-200">
                <div class="flex justify-between items-center mb-3">
                  <h4 class="text-md font-medium">Réponses</h4>
                  <button type="button" (click)="addAnswer(i)" 
                          class="bg-indigo-500 text-white px-2 py-1 text-sm rounded hover:bg-indigo-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Ajouter une réponse
                  </button>
                </div>

                <div formArrayName="answers">
                  <div *ngFor="let answerForm of getAnswersArray(i).controls; let j = index" 
                       [formGroupName]="j" 
                       class="mb-3 p-3 bg-white rounded border border-gray-200 flex items-center">
                    
                    <div class="flex-grow mr-3">
                      <input type="text" formControlName="text" placeholder="Texte de la réponse"
                             class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    </div>
                    
                    <div class="flex items-center mr-3">
                      <input type="checkbox" formControlName="isCorrect" id="correct-{{i}}-{{j}}" 
                             class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                      <label for="correct-{{i}}-{{j}}" class="ml-2 text-sm text-gray-700">Correcte</label>
                    </div>
                    
                    <button type="button" (click)="removeAnswer(i, j)" 
                            class="text-red-600 hover:text-red-800">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Section pour les réponses directes -->
              <div *ngIf="questionForm.get('type')?.value === 'DIRECT_ANSWER'" class="mt-4 pl-4 border-l-4 border-indigo-200">
                <h4 class="text-md font-medium mb-3">Réponse correcte</h4>
                
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Réponse exacte</label>
                  <input type="text" formControlName="correctAnswer" 
                         placeholder="Entrez la réponse exacte attendue"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <p class="text-sm text-gray-500 mt-1">Cette réponse sera utilisée pour la correspondance exacte.</p>
                </div>
                
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Mots-clés (optionnel)</label>
                  <input type="text" formControlName="keywords" 
                         placeholder="Entrez des mots-clés séparés par des virgules"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <p class="text-sm text-gray-500 mt-1">Si tous ces mots-clés sont présents dans la réponse de l'étudiant, elle sera considérée comme correcte même si elle ne correspond pas exactement.</p>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="questionsArray.length === 0" class="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p class="text-gray-500">Aucune question ajoutée. Cliquez sur "Ajouter une question" pour commencer.</p>
          </div>
        </div>

        <div class="flex justify-end space-x-4 mt-6">
          <button type="button" routerLink="/professor/exams" 
                  class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
            Annuler
          </button>
          <button type="submit" [disabled]="examForm.invalid" 
                  class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50">
            {{ isEditMode ? 'Modifier' : 'Créer' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: []
})
export class ExamFormComponent implements OnInit {
  examForm: FormGroup;
  isEditMode = false;
  examId: number | null = null;
  selectedFiles: { [key: number]: File | null } = {};

  // Option pour la gestion du temps
  useGlobalDuration = false;
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private examService: ExamService,
    private toastr: ToastrService
  ) {
    this.examForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      globalDuration: [60, [Validators.required, Validators.min(1)]], // Durée globale en minutes
      questions: this.fb.array([])
    });
  }
  
  // Getter pour accéder au FormArray des questions
  get questionsArray() {
    return this.examForm.get('questions') as FormArray;
  }
  
  // Méthode pour obtenir le FormArray des réponses pour une question spécifique
  getAnswersArray(questionIndex: number) {
    return (this.questionsArray.at(questionIndex).get('answers') as FormArray);
  }

  ngOnInit() {
    this.examId = this.route.snapshot.paramMap.get('id') ? +this.route.snapshot.paramMap.get('id')! : null;
    this.isEditMode = !!this.examId;

    if (this.isEditMode) {
      this.loadExam();
    }
  }

  loadExam() {
    if (this.examId) {
      this.examService.getExam(this.examId).subscribe({
        next: (exam) => {
          console.log('Examen chargé:', exam);
          console.log('Durée reçue (secondes):', exam.duration);
          
          // Calculer la somme des durées des questions
          let totalQuestionDuration = 0;
          if (exam.questions && exam.questions.length > 0) {
            totalQuestionDuration = exam.questions.reduce((total, question) => {
              return total + (question.timeLimit || 0);
            }, 0);
          }
          console.log('Durée totale des questions (secondes):', totalQuestionDuration);
          
          // Déterminer le mode de durée à utiliser
          let isGlobalDuration = false;
          
          // PRIORITÉ 1: Utiliser directement le champ useDurationPerQuestion s'il est défini
          // Ce champ est explicitement défini lors de la création/modification de l'examen
          if (exam.useDurationPerQuestion !== undefined) {
            isGlobalDuration = !exam.useDurationPerQuestion;
            console.log('Mode durée déterminé par useDurationPerQuestion:', isGlobalDuration ? 'globale' : 'par question');
          }
          // PRIORITÉ 2: Pour les anciens examens sans le champ useDurationPerQuestion
          else if (exam.duration && exam.duration > 0) {
            // Si la différence est significative (plus de 20 secondes), c'est clairement le mode durée globale
            // (nous ajoutons 30 secondes lors de la création en mode durée globale)
            if (exam.duration - totalQuestionDuration > 20) {
              isGlobalDuration = true;
              console.log('Différence significative détectée, mode durée globale');
            }
            // SUPPRESSION de la détection automatique pour une seule question
            // Nous respectons maintenant le choix explicite de l'utilisateur
            else {
              isGlobalDuration = false;
              console.log('Mode durée par question détecté');
            }
          }
          // PRIORITÉ 3: Par défaut, c'est le mode durée par question
          else {
            isGlobalDuration = false;
            console.log('Mode durée par question par défaut');
          }
          
          // Appliquer le mode de durée détecté
          this.useGlobalDuration = isGlobalDuration;
          
          // Remplir les champs de base
          this.examForm.patchValue({
            name: exam.name,
            description: exam.description
          });
          
          // Déterminer la durée à afficher dans le formulaire
          let durationToUse;
          
          if (this.useGlobalDuration) {
            // En mode durée globale, utiliser la durée globale si elle est définie
            if (exam.duration && exam.duration > 0) {
              durationToUse = exam.duration;
              console.log('Utilisation de la durée globale définie:', durationToUse);
            } else {
              // Sinon, utiliser la somme des durées des questions
              durationToUse = totalQuestionDuration > 0 ? totalQuestionDuration : 60; // Minimum 60 secondes
              console.log('Utilisation de la somme des durées des questions:', durationToUse);
            }
            
            // Convertir la durée de secondes en minutes avec une précision de 2 décimales
            const durationInMinutes = Math.max(1, parseFloat((durationToUse / 60).toFixed(2)));
            console.log('Durée convertie en minutes:', durationInMinutes);
            
            // Mettre à jour le champ de durée globale
            this.examForm.get('globalDuration')?.setValue(durationInMinutes);
          }
          
          // Charger les questions
          if (exam.questions && exam.questions.length > 0) {
            exam.questions.forEach(question => {
              const questionForm = this.createQuestionForm();
              questionForm.patchValue({
                text: question.text,
                imageUrl: question.imageUrl,
                timeLimit: question.timeLimit,
                type: question.type
              });
              
              // Charger les réponses pour les questions à choix multiples
              if (question.type === 'MULTIPLE_CHOICE' && question.answers && question.answers.length > 0) {
                const answersArray = questionForm.get('answers') as FormArray;
                
                // Vider le tableau par défaut
                while (answersArray.length > 0) {
                  answersArray.removeAt(0);
                }
                
                // Ajouter les réponses existantes
                question.answers.forEach(answer => {
                  answersArray.push(this.createAnswerForm(answer.text, answer.isCorrect));
                });
              } else if (question.type === 'DIRECT_ANSWER') {
                // Pour les questions à réponse directe, charger la réponse correcte et les mots-clés
                if (question.answers && question.answers.length > 0) {
                  const correctAnswer = question.answers[0];
                  questionForm.patchValue({
                    correctAnswer: correctAnswer.text,
                    keywords: correctAnswer.keywords || ''
                  });
                }
                
                // Réinitialiser le tableau de réponses pour les questions à réponse directe
                // car elles n'utilisent pas le FormArray des réponses
                const answersArray = questionForm.get('answers') as FormArray;
                while (answersArray.length > 0) {
                  answersArray.removeAt(0);
                }
              }
              
              this.questionsArray.push(questionForm);
            });
          }
        },
        error: (err) => {
          console.error('Erreur lors du chargement de l\'examen:', err);
          this.toastr.error('Une erreur est survenue lors du chargement de l\'examen.');
          this.router.navigate(['/professor/exams']);
        }
      });
    }
  }

  // Méthode pour créer un nouveau FormGroup pour une question
  createQuestionForm() {
    return this.fb.group({
      text: ['', Validators.required],
      imageUrl: [''],
      timeLimit: [60, [Validators.required, Validators.min(10)]],
      type: ['MULTIPLE_CHOICE', Validators.required],
      answers: this.fb.array([this.createAnswerForm('', false), this.createAnswerForm('', true)]),
      correctAnswer: [''],
      keywords: ['']
    });
  }
  
  // Méthode pour créer un nouveau FormGroup pour une réponse
  createAnswerForm(text: string = '', isCorrect: boolean = false) {
    return this.fb.group({
      text: [text, Validators.required],
      isCorrect: [isCorrect]
    });
  }
  
  // Ajouter une nouvelle question
  addQuestion() {
    this.questionsArray.push(this.createQuestionForm());
  }
  
  // Supprimer une question
  removeQuestion(index: number) {
    this.questionsArray.removeAt(index);
  }
  
  // Ajouter une réponse à une question
  addAnswer(questionIndex: number) {
    const answersArray = this.getAnswersArray(questionIndex);
    answersArray.push(this.createAnswerForm());
  }
  
  // Supprimer une réponse
  removeAnswer(questionIndex: number, answerIndex: number) {
    const answersArray = this.getAnswersArray(questionIndex);
    answersArray.removeAt(answerIndex);
  }

  onSubmit() {
    if (this.examForm.valid) {
      // Vérifier que chaque question QCM a au moins une réponse correcte
      let hasError = false;
      
      this.questionsArray.controls.forEach((questionControl, index) => {
        const questionForm = questionControl as FormGroup;
        if (questionForm.get('type')?.value === 'MULTIPLE_CHOICE') {
          const answersArray = questionForm.get('answers') as FormArray;
          
          // Vérifier qu'il y a au moins 2 réponses
          if (answersArray.length < 2) {
            this.toastr.error(`La question ${index + 1} doit avoir au moins 2 réponses.`);
            hasError = true;
            return;
          }
          
          // Vérifier qu'il y a au moins une réponse correcte
          const hasCorrectAnswer = answersArray.controls.some(
            (answerControl) => (answerControl as FormGroup).get('isCorrect')?.value
          );
          
          if (!hasCorrectAnswer) {
            this.toastr.error(`La question ${index + 1} doit avoir au moins une réponse correcte.`);
            hasError = true;
            return;
          }
        } else if (questionForm.get('type')?.value === 'DIRECT_ANSWER') {
          // Vérifier que la réponse correcte est renseignée
          if (!questionForm.get('correctAnswer')?.value) {
            this.toastr.error(`La question ${index + 1} doit avoir une réponse correcte.`);
            hasError = true;
            return;
          }
          
          // S'assurer que le tableau de réponses est vide pour les questions à réponse directe
          const answersArray = questionForm.get('answers') as FormArray;
          while (answersArray.length > 0) {
            answersArray.removeAt(0);
          }
        }
      });
      
      if (hasError) {
        return;
      }
      
      // Récupérer la valeur exacte de la durée globale
      const globalDuration = this.examForm.get('globalDuration')?.value;
      console.log('Durée globale (minutes):', globalDuration);
      
      // Calculer la somme des durées des questions
      let totalQuestionDuration = 0;
      if (this.questionsArray.length > 0) {
        totalQuestionDuration = this.questionsArray.controls.reduce((total, questionControl) => {
          const questionForm = questionControl as FormGroup;
          return total + (questionForm.get('timeLimit')?.value || 0);
        }, 0);
      }
      console.log('Durée totale des questions (secondes):', totalQuestionDuration);
      
      // Déterminer la durée à utiliser en fonction du mode sélectionné
      let durationInSeconds;
      
      if (this.useGlobalDuration) {
        // En mode durée globale, utiliser la valeur saisie par l'utilisateur
        durationInSeconds = Math.round(globalDuration * 60);
        console.log('Mode durée globale, durée convertie (secondes):', durationInSeconds);
        
        // Garantir une durée minimale de 60 secondes (1 minute)
        if (durationInSeconds < 60) {
          durationInSeconds = 60;
          console.log('Durée ajustée au minimum de 60 secondes');
        }
        
        // IMPORTANT: En mode durée globale, ajouter toujours 30 secondes à la durée totale
        // pour s'assurer qu'elle est clairement différente de la somme des durées des questions
        // Cela permettra de distinguer facilement le mode durée globale du mode durée par question
        durationInSeconds += 30;
        console.log('Ajout de 30 secondes à la durée pour distinguer clairement le mode durée globale:', durationInSeconds);
      } else {
        // En mode durée par question, utiliser exactement la somme des durées des questions
        durationInSeconds = totalQuestionDuration;
        console.log('Mode durée par question, utilisation de la somme des durées:', durationInSeconds);
      }
      
      console.log('Durée finale (secondes):', durationInSeconds);
      console.log('Mode de durée:', this.useGlobalDuration ? 'globale' : 'par question');
      
      // Préparer les données de l'examen en respectant le modèle Exam
      const examData: Partial<Exam> = {
        name: this.examForm.value.name,
        description: this.examForm.value.description,
        // Ajouter la durée globale si le mode durée globale est activé
        duration: durationInSeconds, // Durée en secondes
        // Indiquer explicitement le mode de durée utilisé
        useDurationPerQuestion: !this.useGlobalDuration,
        questions: this.questionsArray.controls.map((questionControl, index) => {
          const questionForm = questionControl as FormGroup;
          const questionType = questionForm.get('type')?.value;
          
          // Créer l'objet question de base
          const question: Partial<Question> = {
            text: questionForm.get('text')?.value,
            imageUrl: questionForm.get('imageUrl')?.value || undefined,
            // Si mode durée globale, utiliser une valeur par défaut ou calculer en fonction du nombre de questions
            timeLimit: this.useGlobalDuration 
              ? Math.floor((this.examForm.get('globalDuration')?.value * 60) / this.questionsArray.length) // Répartition égale du temps
              : questionForm.get('timeLimit')?.value,
            type: questionType as 'MULTIPLE_CHOICE' | 'DIRECT_ANSWER',
            answers: []
          };
          
          // Ajouter les réponses selon le type de question
          if (questionType === 'MULTIPLE_CHOICE') {
            // Pour les questions à choix multiple, récupérer toutes les réponses du FormArray
            question.answers = (questionForm.get('answers') as FormArray).controls.map((answerControl) => {
              const answerForm = answerControl as FormGroup;
              return {
                text: answerForm.get('text')?.value,
                isCorrect: answerForm.get('isCorrect')?.value
              } as Partial<Answer>;
            }) as Answer[];
          } else if (questionType === 'DIRECT_ANSWER') {
            // Pour les questions à réponse directe, créer une seule réponse correcte avec les mots-clés
            const correctAnswerText = questionForm.get('correctAnswer')?.value || 'Réponse directe';
            const keywords = questionForm.get('keywords')?.value ? questionForm.get('keywords')?.value.trim() : '';
            
            question.answers = [{
              text: correctAnswerText,
              isCorrect: true,
              keywords: keywords
            }] as Answer[];
          }
          
          return question as Question;
        }) as Question[]
      };
      
      if (this.isEditMode && this.examId) {
        this.examService.updateExam(this.examId, examData).subscribe({
          next: () => {
            this.toastr.success('L\'examen a été modifié avec succès.');
            this.router.navigate(['/professor/exams']);
          },
          error: (err) => {
            console.error('Erreur lors de la modification de l\'examen:', err);
            this.toastr.error('Une erreur est survenue lors de la modification de l\'examen.');
          }
        });
      } else {
        this.examService.createExam(examData).subscribe({
          next: () => {
            this.toastr.success('L\'examen a été créé avec succès.');
            this.router.navigate(['/professor/exams']);
          },
          error: (err) => {
            console.error('Erreur lors de la création de l\'examen:', err);
            this.toastr.error('Une erreur est survenue lors de la création de l\'examen.');
          }
        });
      }
    } else {
      this.toastr.error('Veuillez corriger les erreurs dans le formulaire.');
      this.markFormGroupTouched(this.examForm);
    }
  }
  
  // Marquer tous les champs comme touchés pour afficher les erreurs
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        for (let i = 0; i < control.length; i++) {
          if (control.at(i) instanceof FormGroup) {
            this.markFormGroupTouched(control.at(i) as FormGroup);
          }
        }
      }
    });
  }

  onFileSelected(event: Event, questionIndex: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFiles[questionIndex] = input.files[0];
    }
  }

  uploadImage(questionIndex: number): void {
    const file = this.selectedFiles[questionIndex];
    if (file) {
      this.examService.uploadImage(file).subscribe({
        next: (imageUrl: string) => {
          const questionForm = this.questionsArray.at(questionIndex);
          questionForm.patchValue({ imageUrl });
          this.selectedFiles[questionIndex] = null;
          this.toastr.success('Image téléchargée avec succès');
        },
        error: (err: Error) => {
          console.error('Erreur lors du téléchargement de l\'image:', err);
          this.toastr.error('Une erreur est survenue lors du téléchargement de l\'image');
        }
      });
    }
  }

  removeImage(questionIndex: number): void {
    const questionForm = this.questionsArray.at(questionIndex) as FormGroup;
    questionForm.patchValue({ imageUrl: '' });
    delete this.selectedFiles[questionIndex];
    this.toastr.success('Image supprimée avec succès.');
  }
  
  /**
   * Fait défiler la page vers une question spécifique
   * @param questionIndex Index de la question vers laquelle défiler
   */
  scrollToQuestion(questionIndex: number): void {
    const questionElement = document.getElementById(`question-${questionIndex}`);
    if (questionElement) {
      questionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  
  /**
   * Fait défiler la page vers le haut
   */
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  /**
   * Fait défiler la page vers le bas (bouton de soumission)
   */
  scrollToBottom(): void {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }
  
  /**
   * Gère le changement de type de question
   * @param questionIndex Index de la question dans le tableau
   */
  onQuestionTypeChange(questionIndex: number): void {
    const questionForm = this.questionsArray.at(questionIndex) as FormGroup;
    const questionType = questionForm.get('type')?.value;
    
    if (questionType === 'DIRECT_ANSWER') {
      // Pour les questions à réponse directe, vider le tableau de réponses
      const answersArray = questionForm.get('answers') as FormArray;
      
      // Chercher une réponse correcte dans les réponses existantes
      let correctAnswerText = '';
      if (answersArray && answersArray.length > 0) {
        for (let i = 0; i < answersArray.length; i++) {
          const answer = answersArray.at(i) as FormGroup;
          if (answer.get('isCorrect')?.value) {
            correctAnswerText = answer.get('text')?.value || '';
            break;
          }
        }
      }
      
      // Mettre à jour le champ de réponse correcte
      questionForm.patchValue({
        correctAnswer: correctAnswerText,
        // S'assurer que le champ keywords est initialisé mais sans l'effacer s'il existe déjà
        keywords: questionForm.get('keywords')?.value || ''
      });
      
      // Réinitialiser le tableau de réponses pour les questions à réponse directe
      // car elles n'utilisent pas le FormArray des réponses
      while (answersArray.length > 0) {
        answersArray.removeAt(0);
      }
      
      // Afficher un message pour informer l'utilisateur
      this.toastr.info('Vous avez changé le type de question vers Réponse directe. Assurez-vous de définir les mots-clés si nécessaire.');
      
    } else if (questionType === 'MULTIPLE_CHOICE') {
      // Si on passe à une question à choix multiple, on utilise la réponse correcte comme texte pour une nouvelle réponse
      const correctAnswer = questionForm.get('correctAnswer')?.value || '';
      const keywords = questionForm.get('keywords')?.value || '';
      
      // Sauvegarder les mots-clés dans une variable temporaire pour informer l'utilisateur
      const hadKeywords = keywords.trim().length > 0;
      
      // Réinitialiser le tableau de réponses
      const answersArray = questionForm.get('answers') as FormArray;
      while (answersArray.length > 0) {
        answersArray.removeAt(0);
      }
      
      // Ajouter au moins deux réponses, dont une correcte avec le texte de la réponse directe
      answersArray.push(this.createAnswerForm('', false));
      if (correctAnswer) {
        answersArray.push(this.createAnswerForm(correctAnswer, true));
      } else {
        answersArray.push(this.createAnswerForm('', true));
      }
      
      // Réinitialiser les champs spécifiques à la réponse directe
      questionForm.patchValue({
        correctAnswer: '',
        keywords: ''
      });
      
      // Informer l'utilisateur si des mots-clés ont été perdus
      if (hadKeywords) {
        this.toastr.warning('Les mots-clés de la réponse directe ont été supprimés car vous avez changé vers une question à choix multiple.');
      } else {
        this.toastr.info('Vous avez changé le type de question vers Choix multiple. Les mots-clés ne seront pas utilisés pour ce type de question.');
      }
    }
  }

  /**
   * Gère la saisie de la durée pour s'assurer qu'elle est correctement formatée
   * @param event Événement de saisie
   */
  onDurationInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    // S'assurer que la valeur est un nombre valide
    if (value && !isNaN(parseFloat(value))) {
      // Limiter à 2 décimales pour éviter les problèmes de précision
      const formattedValue = parseFloat(parseFloat(value).toFixed(2));
      
      // Mettre à jour le formulaire avec la valeur formatée
      this.examForm.get('globalDuration')?.setValue(formattedValue, { emitEvent: false });
      
      console.log('Durée saisie (minutes):', formattedValue);
    }
  }
}