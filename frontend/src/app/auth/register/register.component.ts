import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../auth.service';

interface RegisterResponse {
  success: boolean;
  message: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      role: ['STUDENT', Validators.required]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true;
      this.error = null;
      
      this.authService.register(this.registerForm.value).subscribe({
        next: (response: RegisterResponse) => {
          this.loading = false;
          if (response.success) {
            // Redirection vers la page de connexion après inscription réussie
            this.router.navigate(['/login']);
          } else {
            this.error = response.message;
          }
        },
        error: (err) => {
          this.loading = false;
          if (err.status === 403) {
            this.error = 'L\'inscription n\'est pas autorisée. Veuillez contacter l\'administrateur.';
          } else if (err.error && err.error.message) {
            this.error = err.error.message;
          } else {
            this.error = 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.';
          }
        }
      });
    }
  }
} 