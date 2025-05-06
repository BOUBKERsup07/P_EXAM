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
        </div>

        <!-- Section des questions -->
        <div class="mb-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Questions</h2>
            <button type="button" (click)="addQuestion()" 
                    class="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Ajouter une question
            </button>
          </div>

          <div formArrayName="questions">
            <div *ngFor="let questionForm of questionsArray.controls; let i = index" 
                 [formGroupName]="i" 
                 class="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              
              <div class="flex justify-between items-center mb-3">
                <h3 class="text-lg font-medium">Question {{ i + 1 }}</h3>
                <button type="button" (click)="removeQuestion(i)" 
                        class="text-red-600 hover:text-red-800">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
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
                </div>
                <div *ngIf="questionForm.get('imageUrl')?.value" class="mt-2">
                  <img [src]="questionForm.get('imageUrl')?.value" 
                       alt="Image de la question" 
                       class="max-h-32 rounded-md">
                </div>
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Temps limite (secondes)</label>
                <input type="number" formControlName="timeLimit" min="10" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Type de question</label>
                <select formControlName="type" 
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
          this.examForm.patchValue({
            name: exam.name,
            description: exam.description
          });
          
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
      answers: this.fb.array([this.createAnswerForm('', false), this.createAnswerForm('', true)])
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
      let valid = true;
      const formValue = this.examForm.value;
      
      formValue.questions.forEach((question: any, index: number) => {
        if (question.type === 'MULTIPLE_CHOICE') {
          const hasCorrectAnswer = question.answers.some((answer: any) => answer.isCorrect);
          if (!hasCorrectAnswer) {
            valid = false;
            this.toastr.error(`La question ${index + 1} doit avoir au moins une réponse correcte.`);
          }
        }
      });
      
      if (!valid) return;
      
      const examData = {
        name: formValue.name,
        description: formValue.description,
        questions: formValue.questions.map((q: any) => ({
          text: q.text,
          imageUrl: q.imageUrl,
          timeLimit: q.timeLimit,
          type: q.type,
          answers: q.type === 'MULTIPLE_CHOICE' ? q.answers.map((a: any) => ({
            text: a.text,
            isCorrect: a.isCorrect
          })) : [{
            text: q.correctAnswer,
            isCorrect: true
          }]
        }))
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
}