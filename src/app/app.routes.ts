import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProfileEditComponent } from './pages/profile-edit/profile-edit.component';
import { SubjectsComponent } from './pages/subjects/subjects.component';
import { QuizzesComponent } from './pages/quizzes/quizzes.component';
import { ResultsComponent } from './pages/results/results.component';
import { MainLayoutComponent } from './shared/layouts/main.layout';
import { authGuard, publicGuard } from './shared/guards/auth.guard';
import { QuestionsComponent } from './pages/questions/questions.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  
  // Public routes
  { path: 'login', component: LoginComponent, canActivate: [publicGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [publicGuard] },
  
  // Protected routes with layout
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'profile/edit', component: ProfileEditComponent },
      { path: 'subjects', component: SubjectsComponent },
      { path: 'quizzes', component: QuizzesComponent },
      { path: 'subjects/:subjectId/questions', component: QuestionsComponent },
      { path: 'results', component: ResultsComponent },
    ]
  }
];