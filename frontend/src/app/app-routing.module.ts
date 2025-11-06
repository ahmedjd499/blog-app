import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ArticleListComponent } from './components/article-list/article-list.component';
import { ArticleDetailComponent } from './components/article-detail/article-detail.component';
import { ArticleFormComponent } from './components/article-form/article-form.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { EditorGuard } from './guards/editor.guard';
import { WriterGuard } from './guards/writer.guard';
import { RoleGuard } from './guards/role.guard';
import { UserRole } from './models/user.model';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'articles', component: ArticleListComponent },
  // Only writers and above can create articles
  { 
    path: 'articles/create', 
    component: ArticleFormComponent, 
    canActivate: [WriterGuard] 
  },
  // Only writers and above can edit articles (additional permission checks in component)
  { 
    path: 'articles/edit/:id', 
    component: ArticleFormComponent, 
    canActivate: [WriterGuard] 
  },
  { path: 'articles/:id', component: ArticleDetailComponent },
  // Authenticated users can view their own profile
  { path: 'profile', component: UserProfileComponent, canActivate: [AuthGuard] },
  // Anyone can view other profiles
  { path: 'profile/:id', component: UserProfileComponent },
  // Admin dashboard - only admins
  { 
    path: 'admin', 
    component: AdminDashboardComponent, 
    canActivate: [AdminGuard] 
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
