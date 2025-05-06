import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-[calc(100vh-140px)] flex items-center justify-center py-12">
      <div class="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden">
        <div class="p-6">
          <h2 class="text-2xl font-bold text-center text-gray-800">Welcome to AssessQuest</h2>
          <p class="text-center text-gray-600 mt-2 mb-6">
            Log in to manage your exams
          </p>
          
          <form (submit)="handleSubmit($event)" class="space-y-4">
            <div class="space-y-2">
              <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                type="email"
                placeholder="professor@example.com"
                required
                [(ngModel)]="email"
                name="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div class="space-y-2">
              <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                type="password"
                required
                [(ngModel)]="password"
                name="password"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p class="text-xs text-gray-500 mt-2">
                Demo credentials: prof.smith&#64;example.com / password
              </p>
            </div>
            
            <div *ngIf="errorMessage" class="text-red-500 text-sm">
              {{ errorMessage }}
            </div>
            
            <button 
              type="submit" 
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              [disabled]="isSubmitting"
            >
              {{ isSubmitting ? "Logging in..." : "Log In" }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @use 'tailwindcss/base';
    @use 'tailwindcss/components';
    @use 'tailwindcss/utilities';
  `]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  isSubmitting: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  handleSubmit(e: Event): void {
    e.preventDefault();
    this.isSubmitting = true;
    this.errorMessage = '';
    
    this.authService.loginTeacher(this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/professor/dashboard']);
      },
      error: (error) => {
        console.error("Login failed:", error);
        this.errorMessage = "Invalid email or password";
        this.isSubmitting = false;
      }
    });
  }
}
