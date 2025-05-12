import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { ExamListComponent } from './exam-list/exam-list.component';
import { ExamDetailComponent } from './exam-detail/exam-detail.component';
import { ExamFormComponent } from './exam-form/exam-form.component';
import { ExamTakeComponent } from './exam-take/exam-take.component';
import { TeacherGuard } from '../guards/auth.guard';

const routes: Routes = [
  { path: 'exams', component: ExamListComponent, canActivate: [TeacherGuard] },
  { path: 'exams/new', component: ExamFormComponent, canActivate: [TeacherGuard] },
  { path: 'exams/:id', component: ExamDetailComponent, canActivate: [TeacherGuard] },
  { path: 'exams/:id/edit', component: ExamFormComponent, canActivate: [TeacherGuard] },
  { path: 'exams/:id/take', component: ExamTakeComponent, canActivate: [TeacherGuard] }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ExamListComponent,
    ExamDetailComponent,
    ExamFormComponent,
    ExamTakeComponent
  ],
  exports: [RouterModule]
})
export class ExamModule { }
