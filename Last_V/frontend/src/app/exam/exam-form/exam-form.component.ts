import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamService } from '../../services/exam.service';
import { Exam, Question, Answer } from '../../models/exam.model';

@Component({
  selector: 'app-exam-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './exam-form.component.html',
  styleUrls: ['./exam-form.component.scss']
})
export class ExamFormComponent implements OnInit {
  examForm: FormGroup;
  isEditMode = false;
  examId: number | null = null;
  showCreateButton = false;

  constructor(
    private fb: FormBuilder,
    private examService: ExamService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.examForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      duration: [0, [Validators.required, Validators.min(1)]],
      questions: this.fb.array([], [Validators.required, Validators.minLength(1)])
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.examId = +params['id'];
        this.loadExam(this.examId);
      } else {
        // Ajouter une question par défaut en mode création
        this.addQuestion();
      }
    });
  }

  get questions(): FormArray {
    return this.examForm.get('questions') as FormArray;
  }

  getAnswers(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('answers') as FormArray;
  }

  addQuestion(): void {
    const questionForm = this.fb.group({
      text: ['', [Validators.required, Validators.minLength(5)]],
      type: ['MULTIPLE_CHOICE', Validators.required],
      timeLimit: [60, [Validators.required, Validators.min(1)]],
      answers: this.fb.array([], (control) => {
        const questionGroup = control.parent as FormGroup;
        if (questionGroup?.get('type')?.value === 'MULTIPLE_CHOICE') {
          return control.value.length > 0 ? null : { required: true };
        }
        return null;
      }),
      correctAnswer: ['', Validators.required]
    });

    this.questions.push(questionForm);

    // Ajouter une réponse par défaut pour les questions à choix multiple
    if (questionForm.get('type')?.value === 'MULTIPLE_CHOICE') {
      const questionIndex = this.questions.length - 1;
      this.addAnswer(questionIndex);
    }

    // Gérer les changements de type de question
    questionForm.get('type')?.valueChanges.subscribe(type => {
      const answersArray = questionForm.get('answers') as FormArray;
      
      if (type === 'DIRECT_ANSWER') {
        // Supprimer toutes les réponses existantes
        while (answersArray.length) {
          answersArray.removeAt(0);
        }
      } else if (type === 'MULTIPLE_CHOICE' && answersArray.length === 0) {
        // Ajouter une réponse par défaut si nécessaire
        this.addAnswer(this.questions.length - 1);
      }
      
      this.updateCreateButtonVisibility();
    });

    this.updateCreateButtonVisibility();
  }

  removeQuestion(index: number): void {
    this.questions.removeAt(index);
    this.updateCreateButtonVisibility();
  }

  addAnswer(questionIndex: number): void {
    const answersArray = this.getAnswers(questionIndex);
    const answerForm = this.fb.group({
      text: ['', [Validators.required, Validators.minLength(1)]],
      isCorrect: [false]
    });
    answersArray.push(answerForm);
  }

  removeAnswer(questionIndex: number, answerIndex: number): void {
    const answersArray = this.getAnswers(questionIndex);
    answersArray.removeAt(answerIndex);
  }

  updateCreateButtonVisibility(): void {
    this.showCreateButton = this.questions.controls.some(
      question => question.get('type')?.value === 'DIRECT_ANSWER'
    );
  }

  isQuestionValid(question: FormGroup): boolean {
    if (!question.valid) return false;
    
    const type = question.get('type')?.value;
    const textValid = question.get('text')?.valid;
    const timeLimitValid = question.get('timeLimit')?.valid;
    
    if (!textValid || !timeLimitValid) return false;

    if (type === 'MULTIPLE_CHOICE') {
      const answers = question.get('answers') as FormArray;
      return answers.length > 0 && answers.valid;
    } else {
      const correctAnswer = question.get('correctAnswer');
      return correctAnswer?.valid ?? false;
    }
  }

  areAllQuestionsValid(): boolean {
    return this.questions.length > 0 && 
           this.questions.controls.every(question => 
             this.isQuestionValid(question as FormGroup)
           );
  }

  onSubmit(): void {
    this.markAllAsTouched();
    
    if (this.examForm.valid && this.areAllQuestionsValid()) {
      const examData: Exam = this.prepareExamData();
      console.log('Données de l\'examen à envoyer:', examData);
      
      const operation = this.isEditMode && this.examId
        ? this.examService.updateExam(this.examId, examData)
        : this.examService.createExam(examData);

      operation.subscribe({
        next: (response) => {
          console.log('Réponse du serveur:', response);
          this.router.navigate(['/professor/exams']);
        },
        error: (error) => {
          console.error('Erreur détaillée lors de la création/mise à jour de l\'examen:', error);
          if (error.error) {
            console.error('Message d\'erreur:', error.error);
          }
          // Afficher un message d'erreur à l'utilisateur
          alert('Erreur lors de la création de l\'examen: ' + (error.error?.message || 'Une erreur est survenue'));
        }
      });
    } else {
      console.log('Formulaire invalide:', this.examForm.errors);
      console.log('Valeur du formulaire:', this.examForm.value);
      alert('Veuillez corriger les erreurs dans le formulaire avant de soumettre.');
    }
  }

  private prepareExamData(): Exam {
    const formValue = this.examForm.value;
    const examData = {
      name: formValue.name,
      description: formValue.description || '',
      duration: formValue.duration || 3600,
      questions: formValue.questions.map((q: any) => {
        const questionText = q.text || '';
        let answers: Answer[] = [];

        if (q.type === 'DIRECT_ANSWER') {
          // Pour une question à réponse directe, utiliser la valeur correctAnswer si disponible
          const correctAnswerText = q.correctAnswer || '';
          answers = [{
            text: correctAnswerText.trim() !== '' ? correctAnswerText : questionText,
            isCorrect: true
          }];
        } else {
          // Pour une question à choix multiple, on utilise les réponses fournies
          answers = q.answers.map((a: any) => ({
            text: a.text || '',
            isCorrect: a.isCorrect || false
          }));
        }

        // Vérification que toutes les réponses ont un texte valide
        answers = answers.filter(answer => answer.text && answer.text.trim() !== '');

        // Si aucune réponse valide n'est trouvée pour une question à réponse directe, utiliser le texte de la question
        if (q.type === 'DIRECT_ANSWER' && answers.length === 0) {
          answers = [{
            text: questionText,
            isCorrect: true
          }];
        }

        return {
          text: questionText,
          type: q.type,
          timeLimit: q.timeLimit || 60,
          answers: answers
        };
      })
    };

    console.log('Données préparées pour l\'examen:', examData);
    return examData;
  }

  private markAllAsTouched(): void {
    this.examForm.markAllAsTouched();
    this.questions.controls.forEach(question => {
      question.markAllAsTouched();
      if (question.get('type')?.value === 'MULTIPLE_CHOICE') {
        const answers = question.get('answers') as FormArray;
        answers.controls.forEach(answer => answer.markAllAsTouched());
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/professor/exams']);
  }

  onCreate(): void {
    this.onSubmit();
  }

  private loadExam(id: number): void {
    this.examService.getExam(id).subscribe({
      next: (exam) => {
        this.examForm.patchValue({
          name: exam.name,
          description: exam.description,
          duration: exam.duration
        });

        // Clear existing questions
        while (this.questions.length) {
          this.questions.removeAt(0);
        }

        // Add loaded questions
        exam.questions.forEach(question => {
          const questionForm = this.fb.group({
            text: [question.text, [Validators.required, Validators.minLength(5)]],
            type: [question.type, Validators.required],
            timeLimit: [question.timeLimit, [Validators.required, Validators.min(1)]],
            answers: this.fb.array([]),
            correctAnswer: [
              question.type === 'DIRECT_ANSWER' ? question.answers[0]?.text : '',
              Validators.required
            ]
          });

          if (question.type === 'MULTIPLE_CHOICE') {
            question.answers.forEach(answer => {
              const answerForm = this.fb.group({
                text: [answer.text, [Validators.required, Validators.minLength(1)]],
                isCorrect: [answer.isCorrect]
              });
              (questionForm.get('answers') as FormArray).push(answerForm);
            });
          }

          this.questions.push(questionForm);
        });
        
        this.updateCreateButtonVisibility();
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'examen:', error);
        this.router.navigate(['/professor/exams']);
      }
    });
  }
}