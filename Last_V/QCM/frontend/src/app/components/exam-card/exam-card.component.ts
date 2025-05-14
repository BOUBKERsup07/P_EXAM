import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-exam-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div class="p-6">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">{{ exam.title }}</h3>
          <span class="px-3 py-1 text-sm font-medium rounded-full" 
                [ngClass]="{
                  'bg-green-100 text-green-800': exam.status === 'ACTIVE',
                  'bg-gray-100 text-gray-800': exam.status === 'DRAFT',
                  'bg-red-100 text-red-800': exam.status === 'CLOSED'
                }">
            {{ exam.status }}
          </span>
        </div>
        <p class="mt-2 text-sm text-gray-600">{{ exam.description }}</p>
        <div class="mt-4 flex items-center justify-between">
          <div class="flex items-center text-sm text-gray-500">
            <svg class="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ exam.duration }} minutes
          </div>
          <div class="flex items-center text-sm text-gray-500">
            <svg class="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {{ exam.questions?.length || 0 }} questions
          </div>
        </div>
        <div class="mt-6">
          <a [routerLink]="['/exams', exam.id]" 
             class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            Start Exam
          </a>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ExamCardComponent {
  @Input() exam: any;
} 