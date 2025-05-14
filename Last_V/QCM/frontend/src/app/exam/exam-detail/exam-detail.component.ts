import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamService } from '../exam.service';
import { Exam, Question } from '../exam.model';

@Component({
  selector: 'app-exam-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './exam-detail.component.html',
  styleUrls: ['./exam-detail.component.css']
})
export class ExamDetailComponent implements OnInit {
  examForm: FormGroup;
  isEditMode = false;
  examId?: number;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private examService: ExamService
  ) {
    this.examForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      questions: this.fb.array([])
    });
  }

  ngOnInit() {
    this.examId = this.route.snapshot.params['id'];
    if (this.examId) {
      this.isEditMode = true;
      this.loadExam(this.examId);
    }
  }

  get questions() {
    return this.examForm.get('questions') as FormArray;
  }

  getChoices(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('choices') as FormArray;
  }

  addQuestion() {
    const questionGroup = this.fb.group({
      text: ['', Validators.required],
      type: ['MULTIPLE_CHOICE', Validators.required],
      duration: [60, Validators.required],
      choices: this.fb.array([
        this.fb.group({
          text: ['', Validators.required],
          isCorrect: [false]
        })
      ])
    });
    this.questions.push(questionGroup);
  }

  removeQuestion(index: number) {
    this.questions.removeAt(index);
  }

  addChoice(questionIndex: number) {
    const choiceGroup = this.fb.group({
      text: ['', Validators.required],
      isCorrect: [false]
    });
    this.getChoices(questionIndex).push(choiceGroup);
  }

  removeChoice(questionIndex: number, choiceIndex: number) {
    this.getChoices(questionIndex).removeAt(choiceIndex);
  }

  loadExam(id: number) {
    this.errorMessage = null;
    this.examService.getExam(id).subscribe({
      next: (exam) => {
        if (!exam) {
          this.errorMessage = 'L\'examen n\'a pas été trouvé';
          return;
        }

        try {
          this.examForm.patchValue({
            name: exam.name,
            description: exam.description
          });

          // Clear existing questions
          while (this.questions.length) {
            this.questions.removeAt(0);
          }

          // Add questions from the exam
          if (exam.questions && Array.isArray(exam.questions)) {
            exam.questions.forEach(question => {
              const questionGroup = this.fb.group({
                text: [question.text, Validators.required],
                type: [question.type, Validators.required],
                duration: [question.timeLimit, Validators.required],
                choices: this.fb.array([])
              });

              if (question.answers && Array.isArray(question.answers)) {
                question.answers.forEach(answer => {
                  const choiceGroup = this.fb.group({
                    text: [answer.text, Validators.required],
                    isCorrect: [answer.isCorrect]
                  });
                  (questionGroup.get('choices') as FormArray).push(choiceGroup);
                });
              }

              this.questions.push(questionGroup);
            });
          }
        } catch (error) {
          console.error('Erreur lors du traitement des données de l\'examen:', error);
          this.errorMessage = 'Erreur lors du traitement des données de l\'examen';
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'examen:', error);
        if (error.status === 403) {
          this.errorMessage = 'Vous n\'avez pas les permissions nécessaires pour accéder à cet examen';
        } else if (error.status === 404) {
          this.errorMessage = 'L\'examen n\'a pas été trouvé';
        } else if (error.status === 401) {
          this.errorMessage = 'Votre session a expiré, veuillez vous reconnecter';
        } else {
          this.errorMessage = 'Une erreur est survenue lors du chargement de l\'examen';
        }
      }
    });
  }

  onSubmit() {
    if (this.examForm.valid) {
      this.errorMessage = null;
      const formValue = this.examForm.value;
      
      try {
        // Validation des données
        if (!formValue.name || !formValue.name.trim()) {
          this.errorMessage = 'Le titre de l\'examen est requis';
          return;
        }

        if (!formValue.questions || !Array.isArray(formValue.questions) || formValue.questions.length === 0) {
          this.errorMessage = 'L\'examen doit contenir au moins une question';
          return;
        }

        // Préparation des données
        const examData: Partial<Exam> = {
          name: formValue.name.trim(),
          description: formValue.description?.trim() || '',
          questions: formValue.questions.map((q: any) => {
            if (!q.text || !q.text.trim()) {
              throw new Error('Le texte de la question est requis');
            }
            if (!q.type) {
              throw new Error('Le type de question est requis');
            }
            if (!q.duration || q.duration < 1) {
              throw new Error('La durée de la question doit être supérieure à 0');
            }

            const question = {
              text: q.text.trim(),
              type: q.type,
              timeLimit: q.duration,
              answers: []
            };

            if (q.choices && Array.isArray(q.choices)) {
              question.answers = q.choices.map((c: any) => {
                if (!c.text || !c.text.trim()) {
                  throw new Error('Le texte de la réponse est requis');
                }
                return {
                  text: c.text.trim(),
                  isCorrect: !!c.isCorrect
                };
              });
            }

            return question;
          })
        };

        console.log('Données de l\'examen à envoyer:', examData);

        if (this.isEditMode && this.examId) {
          this.examService.updateExam(this.examId, examData).subscribe({
            next: () => {
              console.log('Examen mis à jour avec succès');
              this.router.navigate(['/professor/exams']);
            },
            error: (error) => {
              console.error('Erreur lors de la mise à jour de l\'examen:', error);
              if (error.status === 403) {
                this.errorMessage = 'Vous n\'avez pas les permissions nécessaires pour modifier cet examen';
              } else if (error.status === 404) {
                this.errorMessage = 'L\'examen n\'a pas été trouvé';
              } else if (error.status === 401) {
                this.errorMessage = 'Votre session a expiré, veuillez vous reconnecter';
              } else if (error.error && error.error.message) {
                this.errorMessage = error.error.message;
              } else {
                this.errorMessage = 'Une erreur est survenue lors de la mise à jour de l\'examen';
              }
            }
          });
        } else {
          this.examService.createExam(examData).subscribe({
            next: () => {
              console.log('Examen créé avec succès');
              this.router.navigate(['/professor/exams']);
            },
            error: (error) => {
              console.error('Erreur lors de la création de l\'examen:', error);
              if (error.status === 403) {
                this.errorMessage = 'Vous n\'avez pas les permissions nécessaires pour créer un examen';
              } else if (error.status === 401) {
                this.errorMessage = 'Votre session a expiré, veuillez vous reconnecter';
              } else if (error.error && error.error.message) {
                this.errorMessage = error.error.message;
              } else {
                this.errorMessage = 'Une erreur est survenue lors de la création de l\'examen';
              }
            }
          });
        }
      } catch (error) {
        console.error('Erreur lors de la préparation des données:', error);
        this.errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors de la préparation des données de l\'examen';
      }
    }
  }
}