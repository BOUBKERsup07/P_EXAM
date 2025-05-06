import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamService } from '../../services/exam.service';
import { Exam, Question, Answer } from '../../models/exam.model';

@Component({
  selector: 'app-exam-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="bg-white shadow sm:rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
          {{ isEditMode ? 'Edit Exam' : 'Create New Exam' }}
        </h3>
        <form [formGroup]="examForm" (ngSubmit)="onSubmit()" class="mt-5 space-y-6">
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
            <input type="text" id="title" formControlName="title"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
            <textarea id="description" formControlName="description" rows="3"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
          </div>

          <div formArrayName="questions">
            <div class="flex justify-between items-center mb-4">
              <h4 class="text-lg font-medium text-gray-900">Questions</h4>
              <button type="button" (click)="addQuestion()"
                class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Add Question
              </button>
            </div>

            <div *ngFor="let question of questions.controls; let i = index" [formGroupName]="i"
              class="border rounded-lg p-4 mb-4">
              <div class="flex justify-between items-start mb-4">
                <h5 class="text-md font-medium text-gray-900">Question {{ i + 1 }}</h5>
                <button type="button" (click)="removeQuestion(i)"
                  class="text-red-600 hover:text-red-900">Remove</button>
              </div>

              <div class="space-y-4">
                <div>
                  <label [for]="'text-' + i" class="block text-sm font-medium text-gray-700">Question Text</label>
                  <textarea [id]="'text-' + i" formControlName="text" rows="3"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                </div>

                <div>
                  <label [for]="'type-' + i" class="block text-sm font-medium text-gray-700">Question Type</label>
                  <select [id]="'type-' + i" formControlName="type"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                    <option value="DIRECT_ANSWER">Direct Answer</option>
                  </select>
                </div>

                <div>
                  <label [for]="'timeLimit-' + i" class="block text-sm font-medium text-gray-700">Time Limit (seconds)</label>
                  <input type="number" [id]="'timeLimit-' + i" formControlName="timeLimit"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                </div>

                <div>
                  <label [for]="'difficulty-' + i" class="block text-sm font-medium text-gray-700">Difficulty Level</label>
                  <select [id]="'difficulty-' + i" formControlName="difficultyLevel"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>

                <div>
                  <label [for]="'points-' + i" class="block text-sm font-medium text-gray-700">Points</label>
                  <input type="number" [id]="'points-' + i" formControlName="points"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                </div>

                <div>
                  <label [for]="'explanation-' + i" class="block text-sm font-medium text-gray-700">Explanation</label>
                  <textarea [id]="'explanation-' + i" formControlName="explanation" rows="3"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                </div>

                <div *ngIf="question.get('type')?.value === 'MULTIPLE_CHOICE'" formArrayName="answers">
                  <div class="flex justify-between items-center mb-2">
                    <label class="block text-sm font-medium text-gray-700">Answers</label>
                    <button type="button" (click)="addAnswer(i)"
                      class="text-indigo-600 hover:text-indigo-900">Add Answer</button>
                  </div>
                  <div *ngFor="let answer of getAnswers(i).controls; let j = index" [formGroupName]="j" class="flex items-center space-x-2">
                    <input type="text" formControlName="text"
                      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <input type="checkbox" formControlName="isCorrect" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                    <button type="button" (click)="removeAnswer(i, j)"
                      class="text-red-600 hover:text-red-900">Remove</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end">
            <button type="button" (click)="onCancel()"
              class="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Cancel
            </button>
            <button type="submit"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              {{ isEditMode ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class ExamFormComponent implements OnInit {
  examForm: FormGroup;
  isEditMode = false;
  examId?: number;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private examService: ExamService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.examForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      questions: this.fb.array([])
    });
  }

  ngOnInit() {
    this.examId = this.route.snapshot.params['id'];
    if (this.examId) {
      this.isEditMode = true;
      this.loadExam();
    } else {
      // Générer un code d'accès par défaut pour les nouveaux examens
      this.generateAccessCode();
    }
  }

  get questions() {
    return this.examForm.get('questions') as FormArray;
  }

  getAnswers(index: number): FormArray {
    return this.questions.at(index).get('answers') as FormArray;
  }

  // Générer un code d'accès aléatoire
  generateAccessCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.examForm.get('accessCode')?.setValue(code);
  }

  addQuestion() {
    const questionGroup = this.fb.group({
      text: ['', Validators.required],
      type: ['MULTIPLE_CHOICE', Validators.required],
      timeLimit: [60, [Validators.required, Validators.min(10)]],
      difficultyLevel: ['MEDIUM', Validators.required],
      points: [1, [Validators.required, Validators.min(1)]],
      explanation: [''],
      answers: this.fb.array([
        this.fb.group({
          text: ['', Validators.required],
          isCorrect: [false]
        })
      ])
    });
    this.questions.push(questionGroup);
  }

  removeQuestion(index: number) {
    const question = this.questions.at(index);
    if (question) {
      // Si c'est une question existante (avec un ID), supprimer d'abord les réponses
      if (question.get('id')?.value) {
        const questionId = question.get('id').value;
        this.examService.deleteQuestionAnswers(questionId).subscribe({
          next: () => {
            // Une fois les réponses supprimées, supprimer la question
            this.examService.deleteQuestion(questionId).subscribe({
              next: () => {
                this.questions.removeAt(index);
              },
              error: (error) => {
                console.error('Erreur lors de la suppression de la question', error);
                this.errorMessage = 'Erreur lors de la suppression de la question';
              }
            });
          },
          error: (error) => {
            console.error('Erreur lors de la suppression des réponses', error);
            this.errorMessage = 'Erreur lors de la suppression des réponses';
          }
        });
      } else {
        // Si c'est une nouvelle question (sans ID), simplement la retirer du formulaire
        this.questions.removeAt(index);
      }
    }
  }

  addAnswer(questionIndex: number) {
    const answerGroup = this.fb.group({
      text: ['', Validators.required],
      isCorrect: [false]
    });
    this.getAnswers(questionIndex).push(answerGroup);
  }

  removeAnswer(questionIndex: number, answerIndex: number) {
    this.getAnswers(questionIndex).removeAt(answerIndex);
  }

  loadExam() {
    this.examService.getExam(this.examId).subscribe({
      next: (exam) => {
        this.examForm.patchValue({
          title: exam.name,
          description: exam.description,
          accessCode: exam.accessCode
        });

        // Effacer les questions existantes
        while (this.questions.length) {
          this.questions.removeAt(0);
        }

        // Ajouter les questions de l'examen chargé
        exam.questions.forEach(question => {
          const questionForm = this.fb.group({
            id: [question.id],
            text: [question.text, Validators.required],
            type: [question.type, Validators.required],
            timeLimit: [question.timeLimit, [Validators.required, Validators.min(10)]],
            difficultyLevel: [question.difficultyLevel, Validators.required],
            points: [question.points, [Validators.required, Validators.min(1)]],
            explanation: [question.explanation || ''],
            answers: this.fb.array([])
          });

          // Ajouter les réponses
          if (question.answers) {
            const answersArray = questionForm.get('answers') as FormArray;
            question.answers.forEach(answer => {
              const answerForm = this.fb.group({
                id: [answer.id],
                text: [answer.text, Validators.required],
                isCorrect: [answer.isCorrect]
              });
              answersArray.push(answerForm);
            });
          }

          this.questions.push(questionForm);
        });
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'examen:', error);
        this.errorMessage = 'Erreur lors du chargement de l\'examen';
      }
    });
  }

  onSubmit() {
    if (this.examForm.invalid) {
      return;
    }

    const formValue = this.examForm.value;
    
    // D'abord, créer l'examen
    const examRequest = {
      name: formValue.title,
      description: formValue.description
    };

    if (this.isEditMode) {
      this.examService.updateExam(this.examId, examRequest).subscribe({
        next: (updatedExam) => {
          console.log('Examen mis à jour avec succès', updatedExam);
          // Ensuite, ajouter les questions une par une
          this.addQuestionsToExam(updatedExam.id, formValue.questions);
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour de l\'examen', error);
          this.errorMessage = 'Erreur lors de la mise à jour de l\'examen';
        }
      });
    } else {
      this.examService.createExam(examRequest).subscribe({
        next: (createdExam) => {
          console.log('Examen créé avec succès', createdExam);
          // Ensuite, ajouter les questions une par une
          this.addQuestionsToExam(createdExam.id, formValue.questions);
        },
        error: (error) => {
          console.error('Erreur lors de la création de l\'examen', error);
          this.errorMessage = 'Erreur lors de la création de l\'examen';
        }
      });
    }
  }

  private addQuestionsToExam(examId: number, questions: any[]) {
    questions.forEach((q: any) => {
      const questionRequest = {
        text: q.text,
        type: q.type,
        timeLimit: q.timeLimit || 60,
        difficultyLevel: q.difficultyLevel || 'MEDIUM',
        points: q.points || 1,
        explanation: q.explanation || '',
        answers: q.type === 'MULTIPLE_CHOICE' && q.answers ? 
          q.answers.map((a: any) => ({
            text: a.text,
            isCorrect: a.isCorrect || false
          })) : []
      };

      this.examService.addQuestion(examId, questionRequest).subscribe({
        next: (question) => {
          console.log('Question ajoutée avec succès', question);
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout de la question', error);
          this.errorMessage = 'Erreur lors de l\'ajout d\'une question';
        }
      });
    });

    // Rediriger vers la liste des examens une fois toutes les questions ajoutées
    this.router.navigate(['/professor/exams']);
  }

  // Calculer la durée totale de l'examen en secondes
  calculateTotalDuration(questions: any[]): number {
    if (!questions || questions.length === 0) return 0;
    return questions.reduce((total, q) => total + (q.timeLimit || 60), 0);
  }

  onCancel() {
    this.router.navigate(['/exams']);
  }
}
