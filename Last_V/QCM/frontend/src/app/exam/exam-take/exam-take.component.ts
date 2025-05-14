import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamService } from '../exam.service';
import { Exam, Question, ExamResult, AnswerSubmission } from '../exam.model';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-exam-take',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exam-take.component.html',
  styleUrls: ['./exam-take.component.css']
})
export class ExamTakeComponent implements OnInit, OnDestroy {
  exam: Exam | null = null;
  currentQuestionIndex = 0;
  selectedAnswers: { [key: number]: string } = {};
  loading = false;
  error: string | null = null;
  examCompleted = false;
  examResult: ExamResult | null = null;
  timeLeft = 0;
  isFullscreen = false;
  private timerSubscription?: Subscription;
  
  // Stockage des temps restants pour chaque question
  questionTimers: { [key: number]: number } = {};
  
  // Suivi du temps réel
  examStartTime: Date = new Date();
  unansweredQuestions: number[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examService: ExamService
  ) {}

  ngOnInit(): void {
    const examId = this.route.snapshot.paramMap.get('id');
    if (examId) {
      this.loadExam(parseInt(examId, 10));
    } else {
      this.error = 'ID de l\'examen manquant';
    }
    
    // Mettre à jour la liste des questions sans réponse toutes les 2 secondes
    setInterval(() => this.updateUnansweredQuestions(), 2000);
  }
  
  // Méthode pour mettre à jour la liste des questions sans réponse
  updateUnansweredQuestions(): void {
    if (!this.exam?.questions) return;
    
    this.unansweredQuestions = [];
    this.exam.questions.forEach(question => {
      if (question.id !== undefined && !this.selectedAnswers[question.id]) {
        this.unansweredQuestions.push(question.id);
      }
    });
  }
  
  // Méthode pour naviguer directement vers une question spécifique
  goToQuestion(index: number): void {
    if (this.exam?.questions && index >= 0 && index < this.exam.questions.length) {
      this.currentQuestionIndex = index;
      this.updateCurrentQuestionTime();
    }
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    if (this.isFullscreen) {
      this.exitFullscreen();
    }
  }

  @HostListener('document:fullscreenchange')
  @HostListener('document:webkitfullscreenchange')
  @HostListener('document:mozfullscreenchange')
  @HostListener('document:MSFullscreenChange')
  onFullscreenChange(): void {
    this.isFullscreen = !!document.fullscreenElement;
  }

  toggleFullscreen(): void {
    if (!this.isFullscreen) {
      this.enterFullscreen();
    } else {
      this.exitFullscreen();
    }
  }

  private enterFullscreen(): void {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if ((element as any).webkitRequestFullscreen) {
      (element as any).webkitRequestFullscreen();
    } else if ((element as any).mozRequestFullScreen) {
      (element as any).mozRequestFullScreen();
    } else if ((element as any).msRequestFullscreen) {
      (element as any).msRequestFullscreen();
    }
  }

  private exitFullscreen(): void {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).mozCancelFullScreen) {
      (document as any).mozCancelFullScreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }
  }

  loadExam(examId: number): void {
    console.log(`ExamTakeComponent - Chargement de l'examen ${examId}`);
    this.loading = true;
    this.error = null;
    
    // Enregistrer l'heure exacte de début d'examen
    this.examStartTime = new Date();

    this.examService.getExamForStudent(examId).subscribe({
      next: (exam: Exam) => {
        console.log('ExamTakeComponent - Examen reçu:', exam);
        if (!exam) {
          this.error = 'L\'examen n\'a pas été trouvé';
          console.error('ExamTakeComponent - Examen non trouvé');
          return;
        }

        // Vérifier que chaque question a des réponses
        exam.questions = exam.questions.map((question: Question) => {
          if (!question.answers) {
            question.answers = [];
          }
          return question;
        });

        this.exam = exam;
        
        if (this.exam?.questions?.length === 0) {
          this.error = 'Cet examen ne contient aucune question';
          console.warn('ExamTakeComponent - Examen sans questions');
        } else {
          this.startTimer();
        }
        
        this.loading = false;
      },
      error: (err: Error) => {
        console.error('ExamTakeComponent - Erreur détaillée:', {
          message: err.message,
          stack: err.stack,
          error: err
        });
        this.error = 'Erreur lors du chargement de l\'examen: ' + err.message;
        this.loading = false;
      }
    });
  }

  get currentQuestion(): Question | null {
    if (!this.exam?.questions?.length) {
      return null;
    }
    return this.exam.questions[this.currentQuestionIndex];
  }

  get isLastQuestion(): boolean {
    if (!this.exam?.questions?.length) {
      return false;
    }
    return this.currentQuestionIndex === this.exam.questions.length - 1;
  }

  get isFirstQuestion(): boolean {
    return this.currentQuestionIndex === 0;
  }

  startTimer(): void {
    if (this.exam?.questions) {
      // Initialiser les timers pour chaque question si ce n'est pas déjà fait
      this.exam.questions.forEach(question => {
        if (question.id !== undefined && !(question.id in this.questionTimers)) {
          // Utiliser le timeLimit de la question ou une valeur par défaut (60 secondes)
          this.questionTimers[question.id] = question.timeLimit || 60;
        }
      });
      
      // Mettre à jour le temps restant pour la question actuelle
      this.updateCurrentQuestionTime();
      
      // Démarrer le timer qui décompte le temps pour la question actuelle
      this.timerSubscription = interval(1000).subscribe(() => {
        if (this.currentQuestion && this.currentQuestion.id !== undefined) {
          const questionId = this.currentQuestion.id;
          
          if (this.questionTimers[questionId] > 0) {
            // Décrémenter le temps pour la question actuelle
            this.questionTimers[questionId]--;
            // Mettre à jour le temps affiché
            this.timeLeft = this.questionTimers[questionId];
          } else {
            // Si le temps est écoulé pour cette question, passer à la suivante
            if (!this.isLastQuestion) {
              this.nextQuestion();
            } else {
              this.submitExam();
            }
          }
        }
      });
    }
  }
  
  // Mettre à jour le temps affiché pour la question actuelle
  updateCurrentQuestionTime(): void {
    if (this.currentQuestion && this.currentQuestion.id !== undefined) {
      const questionId = this.currentQuestion.id;
      this.timeLeft = this.questionTimers[questionId];
    }
  }

  nextQuestion(): void {
    if (this.exam?.questions?.length && this.currentQuestionIndex < this.exam.questions.length - 1) {
      this.currentQuestionIndex++;
      // Mettre à jour le temps affiché pour la nouvelle question
      this.updateCurrentQuestionTime();
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      // Mettre à jour le temps affiché pour la nouvelle question
      this.updateCurrentQuestionTime();
    }
  }

  // Drapeau pour éviter les soumissions multiples
  private isSubmitting = false;

  submitExam(): void {
    // Vérifier si l'examen existe et n'est pas déjà en cours de soumission ou complété
    if (!this.exam || this.isSubmitting || this.examCompleted) return;

    // Mettre à jour la liste des questions sans réponse
    this.updateUnansweredQuestions();
    
    // Préparer les détails des questions sans réponse pour l'affichage
    let unansweredQuestionDetails: Question[] = [];
    if (this.exam?.questions && this.unansweredQuestions.length > 0) {
      this.unansweredQuestions.forEach(questionId => {
        const question = this.exam!.questions.find(q => q.id === questionId);
        if (question) {
          unansweredQuestionDetails.push(question);
        }
      });
    }
    
    // Si des questions sont sans réponse, afficher un avertissement
    if (this.unansweredQuestions.length > 0) {
      // Construire un message d'avertissement
      let message = `Vous n'avez pas répondu à ${this.unansweredQuestions.length} question(s):\n\n`;
      
      unansweredQuestionDetails.forEach((question, index) => {
        message += `${index + 1}. ${question.text}\n`;
      });
      
      message += '\nVoulez-vous vraiment soumettre l\'examen ? Les questions sans réponse seront considérées comme incorrectes.';
      
      // Demander confirmation à l'utilisateur
      if (!confirm(message)) {
        this.isSubmitting = false;
        return;
      }
    }

    // Marquer comme en cours de soumission
    this.isSubmitting = true;

    // Arrêter le timer pour éviter les soumissions multiples
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = undefined;
    }
    
    // Préparer les réponses pour la soumission
    const answers = Object.entries(this.selectedAnswers).map(([questionId, answer]) => {
      const question = this.exam?.questions.find(q => q.id === parseInt(questionId, 10));
      if (!question) return null;

      return {
        questionId: parseInt(questionId, 10),
        answer: answer,
        isCorrect: question.type === 'MULTIPLE_CHOICE' 
          ? question.answers.some(a => a.text === answer && a.isCorrect)
          : false // Le backend déterminera si la réponse est correcte pour les questions à réponse directe
      };
    }).filter(answer => answer !== null) as AnswerSubmission[];

    this.loading = true;
    
    // Calculer la durée réelle de l'examen en millisecondes
    const examDuration = new Date().getTime() - this.examStartTime.getTime();
    
    // Convertir en minutes pour l'affichage
    const examDurationMinutes = Math.ceil(examDuration / 60000); // Arrondi à la minute supérieure
    
    this.examService.submitExam(this.exam.id, answers, examDurationMinutes).subscribe({
      next: (result) => {
        this.examCompleted = true;
        this.examResult = result;
        this.loading = false;
        this.isSubmitting = false;
        
        // Rediriger automatiquement après 30 secondes pour éviter les problèmes de rafraîchissement
        setTimeout(() => {
          if (this.examCompleted) {
            this.router.navigate(['/student/dashboard']);
          }
        }, 30000);
      },
      error: (err) => {
        this.error = 'Erreur lors de la soumission de l\'examen';
        this.loading = false;
        this.isSubmitting = false;
      }
    });
  }

  navigateToDashboard(): void {
    this.router.navigate(['/student/dashboard']);
  }

  getCorrectAnswersCount(): number {
    if (!this.examResult?.answers) return 0;
    return this.examResult.answers.filter(a => a.isCorrect).length;
  }

  getAnswerText(answer: AnswerSubmission): string {
    // If we have a question with this ID in the exam
    if (this.exam && this.exam.questions) {
      const question = this.exam.questions.find(q => q.id === answer.questionId);
      if (question && question.answers) {
        // For multiple choice questions, find the selected answer by ID
        if (question.type === 'MULTIPLE_CHOICE') {
          // Try to parse the answer as a number (it might be an answer ID)
          const answerId = parseInt(answer.answer, 10);
          if (!isNaN(answerId)) {
            const selectedAnswer = question.answers.find(a => a.id === answerId);
            if (selectedAnswer) {
              return selectedAnswer.text; // Return the actual answer text
            }
          }
        }
      }
    }
    // If we couldn't find the answer text, return the original answer
    return answer.answer;
  }
}
