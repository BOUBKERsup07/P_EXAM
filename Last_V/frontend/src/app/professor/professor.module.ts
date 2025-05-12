import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ProfessorComponent } from './professor.component';
import { ExamListComponent } from './exam-list/exam-list.component';
import { ExamFormComponent } from './exam-form/exam-form.component';
import { QuestionFormComponent } from './question-form/question-form.component';

@NgModule({
  declarations: [
    ProfessorComponent,
    ExamListComponent,
    ExamFormComponent,
    QuestionFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      { path: '', component: ProfessorComponent },
      { path: 'exams', component: ExamListComponent },
      { path: 'exams/new', component: ExamFormComponent },
      { path: 'exams/:id', component: ExamFormComponent }
    ])
  ]
})
export class ProfessorModule { } 