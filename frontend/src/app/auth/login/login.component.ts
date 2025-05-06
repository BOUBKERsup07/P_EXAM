import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Si l'utilisateur est déjà connecté, le rediriger
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const targetRoute = currentUser.role === 'PROFESSOR' 
        ? '/professor/dashboard' 
        : '/student/dashboard';
      this.router.navigate([targetRoute]);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = null;
      
      const { email, password } = this.loginForm.value;
      
      this.authService.login(email, password).subscribe({
        next: async (response) => {
          console.log('Connexion réussie, réponse complète:', response);
          console.log('User role:', response.user?.role);
          
          if (!response.user || !response.user.role) {
            console.error('Erreur: Rôle utilisateur manquant dans la réponse');
            this.error = 'Erreur: Informations utilisateur incomplètes';
            this.loading = false;
            return;
          }

          // Attendre un peu pour s'assurer que le token est bien stocké
          await new Promise(resolve => setTimeout(resolve, 100));

          const targetRoute = response.user.role === 'PROFESSOR' 
            ? '/professor/dashboard' 
            : '/student/dashboard';
          
          console.log('Redirection vers:', targetRoute);
          
          try {
            // Forcer un rechargement de la page après la navigation
            window.location.href = targetRoute;
          } catch (error) {
            console.error('Erreur de navigation:', error);
            this.error = 'Erreur lors de la redirection';
            this.loading = false;
          }
        },
        error: (err) => {
          console.error('Erreur de connexion:', err);
          this.loading = false;
          this.error = err.message || 'Une erreur est survenue lors de la connexion';
        }
      });
    }
  }
}
