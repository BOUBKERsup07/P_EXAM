import { Component, OnInit } from '@angular/core';
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
export class LoginComponent implements OnInit {
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
  }

  ngOnInit(): void {
    // Si l'utilisateur est déjà connecté, le rediriger
    if (this.authService.isAuthenticated()) {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser?.role) {
        this.redirectBasedOnRole(currentUser.role);
      }
    }
  }

  private redirectBasedOnRole(role: string): void {
    const targetRoute = role === 'PROFESSOR' 
      ? '/professor/dashboard' 
      : '/student/dashboard';
    this.router.navigate([targetRoute]);
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = null;
      
      const { email, password } = this.loginForm.value;
      console.log('Attempting login with:', { email });
      
      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.loading = false;
          console.log('Login successful:', response);
          
          if (response.user?.role) {
            this.redirectBasedOnRole(response.user.role);
          } else {
            this.error = 'Erreur: Rôle utilisateur manquant';
            this.loading = false;
          }
        },
        error: (err) => {
          this.loading = false;
          console.error('Login error:', err);
          
          // Gestion des erreurs spécifiques
          if (err.status === 401) {
            this.error = 'Email ou mot de passe incorrect';
          } else if (err.status === 0) {
            this.error = 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet.';
          } else {
            this.error = err.message || 'Une erreur est survenue lors de la connexion';
          }
        }
      });
    } else {
      // Afficher les erreurs de validation
      if (this.loginForm.get('email')?.errors?.['required']) {
        this.error = 'L\'email est requis';
      } else if (this.loginForm.get('email')?.errors?.['email']) {
        this.error = 'Format d\'email invalide';
      } else if (this.loginForm.get('password')?.errors?.['required']) {
        this.error = 'Le mot de passe est requis';
      } else if (this.loginForm.get('password')?.errors?.['minlength']) {
        this.error = 'Le mot de passe doit contenir au moins 6 caractères';
      }
    }
  }
}
