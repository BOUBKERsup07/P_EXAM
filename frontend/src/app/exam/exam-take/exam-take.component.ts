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
    if (this.exam?.duration) {
      this.timeLeft = this.exam.duration;
      this.timerSubscription = interval(1000).subscribe(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
        } else {
          this.submitExam();
        }
      });
    }
  }

  nextQuestion(): void {
    if (this.exam?.questions?.length && this.currentQuestionIndex < this.exam.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  submitExam(): void {
    if (!this.exam) return;

    const answers = Object.entries(this.selectedAnswers).map(([questionId, answer]) => {
      const question = this.exam?.questions.find(q => q.id === parseInt(questionId, 10));
      if (!question) return null;
      
      // Pour les questions à choix multiple, trouver le texte de la réponse à partir de l'ID
      let answerText = answer;
      let answerId = null;
      
      if (question.type === 'MULTIPLE_CHOICE') {
        const selectedAnswer = question.answers.find(a => a.id.toString() === answer);
        if (selectedAnswer) {
          answerText = selectedAnswer.text;
          answerId = selectedAnswer.id;
        }
      }

      // Format correspondant à ce qu'attend le service
      return {
        questionId: parseInt(questionId, 10),
        answer: answerText,
        answerId: answerId // Ajout de l'ID de la réponse pour les questions à choix multiple
      };
    }).filter(answer => answer !== null) as { questionId: number; answer: string; answerId: number | null }[];

    console.log('Soumission des réponses:', answers);
    this.loading = true;
    this.examService.submitExam(this.exam.id, answers).subscribe({
      next: (result) => {
        this.examCompleted = true;
        this.examResult = result;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors de la soumission de l\'examen';
        this.loading = false;
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
}
