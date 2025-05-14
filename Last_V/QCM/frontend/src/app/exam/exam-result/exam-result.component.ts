import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ExamService } from '../exam.service';
import { ExamResult } from '../exam-result.model';

@Component({
  selector: 'app-exam-result',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Résultats de l'examen</h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">Détails de votre performance</p>
        </div>
        <div class="border-t border-gray-200 px-4 py-5 sm:px-6" *ngIf="result">
          <dl class="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div class="sm:col-span-1">
              <dt class="text-sm font-medium text-gray-500">Score</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ result.score }}%</dd>
            </div>
            <div class="sm:col-span-1">
              <dt class="text-sm font-medium text-gray-500">Temps passé</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ result.formattedTimeSpent || (result.timeSpent + ' minutes') }}</dd>
            </div>
            
            <!-- Questions sans réponse -->
            <div class="sm:col-span-2" *ngIf="unansweredQuestions && unansweredQuestions.length > 0">
              <dt class="text-sm font-medium text-gray-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                Questions sans réponse ({{ unansweredQuestions.length }})
              </dt>
              <dd class="mt-1 text-sm text-gray-900">
                <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm text-yellow-700">
                        Vous n'avez pas répondu à toutes les questions. Les questions sans réponse sont considérées comme incorrectes.
                      </p>
                    </div>
                  </div>
                </div>
                <ul class="divide-y divide-gray-200 bg-red-50 rounded-md">
                  <li *ngFor="let question of unansweredQuestions" class="py-4 px-4">
                    <div class="flex space-x-3">
                      <div class="flex-1 space-y-1">
                        <div class="flex items-center justify-between">
                          <h3 class="text-sm font-medium">{{ question.text }}</h3>
                          <p class="text-sm text-red-600 font-semibold">Sans réponse</p>
                        </div>
                        <p class="text-sm text-gray-700">Réponse correcte: {{ question.correctAnswer }}</p>
                        <p class="text-sm text-gray-700" *ngIf="question.type === 'DIRECT_ANSWER' && question.keywords">
                          Mots-clés acceptés: {{ question.keywords }}
                        </p>
                      </div>
                    </div>
                  </li>
                </ul>
              </dd>
            </div>
            
            <div class="sm:col-span-2">
              <dt class="text-sm font-medium text-gray-500">Détails des réponses</dt>
              <dd class="mt-1 text-sm text-gray-900">
                <ul class="divide-y divide-gray-200">
                  <li *ngFor="let answer of result.answers" class="py-4">
                    <div class="flex space-x-3">
                      <div class="flex-1 space-y-1">
                        <div class="flex items-center justify-between">
                          <h3 class="text-sm font-medium">{{ answer.questionText || 'Question ' + answer.questionId }}</h3>
                          <p class="text-sm text-gray-500" [ngClass]="{'text-green-600': answer.isCorrect, 'text-red-600': !answer.isCorrect}">
                            {{ answer.isCorrect ? 'Correct' : 'Incorrect' }}
                          </p>
                        </div>
                        <p class="text-sm text-gray-500">Votre réponse: {{ answer.studentAnswer }}</p>
                        <p class="text-sm text-gray-500" *ngIf="!answer.isCorrect || answer.questionType === 'DIRECT_ANSWER'">
                          Réponse correcte: {{ answer.correctAnswer }}
                        </p>
                        <p class="text-sm text-gray-500" *ngIf="answer.questionType === 'DIRECT_ANSWER'">
                          <span *ngIf="answer.keywords && answer.keywords.trim().length > 0">
                            Mots-clés acceptés: {{ answer.keywords }}
                          </span>
                          <span *ngIf="!answer.keywords || answer.keywords.trim().length === 0">
                            Aucun mot-clé défini. Seule la correspondance exacte sera acceptée.
                          </span>
                        </p>
                      </div>
                    </div>
                  </li>
                </ul>
              </dd>
            </div>
          </dl>
        </div>
        <div class="px-4 py-5 sm:px-6">
          <button (click)="goBack()" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
            Retour à la liste des examens
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ExamResultComponent implements OnInit {
  result: ExamResult | null = null;
  loading = true;
  unansweredQuestions: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private examService: ExamService
  ) {}

  ngOnInit() {
    const examId = this.route.snapshot.paramMap.get('id');
    if (examId) {
      this.loadExamResult(parseInt(examId, 10));
    }
  }

  loadExamResult(examId: number) {
    this.loading = true;
    this.examService.getExamResult(examId).subscribe({
      next: (result: any) => {
        console.log('Résultat de l\'examen:', result);
        // Convert the API response to match our ExamResult interface
        this.result = {
          examId: result.examId || 0,
          score: result.score || 0,
          timeSpent: result.timeSpent || 0,
          timeSpentSeconds: result.timeSpentSeconds || 0,
          formattedTimeSpent: result.formattedTimeSpent || '',
          answers: (result.answers || []).map((answer: any) => ({
            questionId: answer.questionId,
            questionText: answer.questionText || '',
            studentAnswer: answer.studentAnswer || '',
            correctAnswer: answer.correctAnswer || '',
            isCorrect: answer.isCorrect || false,
            keywords: answer.keywords || '',
            questionType: answer.questionType || ''
          }))
        };
        
        // Récupérer les questions sans réponse
        this.unansweredQuestions = result.unansweredQuestions || [];
        console.log('Questions sans réponse:', this.unansweredQuestions);
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des résultats:', error);
        this.loading = false;
      }
    });
  }

  goBack() {
    window.history.back();
  }
} 