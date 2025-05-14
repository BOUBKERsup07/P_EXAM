import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { StudentComponent } from './student.component';
import { ExamAccessComponent } from './exam-access/exam-access.component';
import { ExamTakingComponent } from './exam-taking/exam-taking.component';
import { ExamResultComponent } from './exam-result/exam-result.component';

@NgModule({
  declarations: [
    StudentComponent,
    ExamAccessComponent,
    ExamTakingComponent,
    ExamResultComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      { path: '', component: StudentComponent },
      { path: 'access/:code', component: ExamAccessComponent },
      { path: 'exam/:id', component: ExamTakingComponent },
      { path: 'result/:id', component: ExamResultComponent }
    ])
  ]
})
export class StudentModule { } 