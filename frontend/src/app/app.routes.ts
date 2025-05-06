import { Routes } from '@angular/router';
import { AuthGuard } from './auth/guards/auth.guard';
import { RoleGuard } from './auth/guards/role.guard';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ExamListComponent } from './professor/exam-list/exam-list.component';
import { ExamFormComponent } from './professor/exam-form/exam-form.component';
import { ProfessorDashboardComponent } from './professor/professor-dashboard/professor-dashboard.component';
import { StudentDashboardComponent } from './student/student-dashboard/student-dashboard.component';
import { StudentExamListComponent } from './student/student-exam-list/student-exam-list.component';
import { ExamTakeComponent } from './exam/exam-take/exam-take.component';
import { ExamViewComponent } from './professor/exam-view/exam-view.component';
import { HomeComponent } from './components/home/home.component';
import { DemoComponent } from './demo/demo.component';
import { ExamCalendarComponent } from './exam/exam-calendar/exam-calendar.component';import { ExamNotificationsComponent } from './exam/exam-notifications/exam-notifications.component';
import { ExamFeaturesComponent } from './exam/exam-features/exam-features.component';
import { ExamResultComponent } from './exam/exam-result/exam-result.component';

export const routes: Routes = [
  { 
    path: '', 
    component: HomeComponent
  },
  { 
    path: 'login', 
    component: LoginComponent 
  },
  { 
    path: 'register', 
    component: RegisterComponent 
  },
  { 
    path: 'demo', 
    component: DemoComponent 
  },
  
  // Routes professeur
  { 
    path: 'professor',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'PROFESSOR' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: ProfessorDashboardComponent },
      { path: 'exams', component: ExamListComponent },
      { path: 'exams/new', component: ExamFormComponent },
      { path: 'exams/:id/view', component: ExamViewComponent },
      { path: 'exams/:id/edit', component: ExamFormComponent }
    ]
  },
  
  // Routes étudiant
  { 
    path: 'student',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'STUDENT' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: StudentDashboardComponent },
      { path: 'exams', component: StudentExamListComponent },
      { path: 'exams/calendar', component: ExamCalendarComponent },
      { path: 'exams/:id/take', component: ExamTakeComponent },
      { path: 'exams/notifications', component: ExamNotificationsComponent },
      { path: 'exams/features', component: ExamFeaturesComponent },
      { path: 'exams/:id/results', component: ExamResultComponent }
    ]
  },
  
  // Route par défaut
  { 
    path: '**', 
    redirectTo: '' 
  }
];
