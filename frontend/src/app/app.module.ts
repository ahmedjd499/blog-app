import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { LoadingInterceptor } from './interceptors/loading.interceptor';
import { GlobalErrorHandler } from './interceptors/error.handler';
import { ErrorHandler } from '@angular/core';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { ArticleListComponent } from './components/article-list/article-list.component';
import { ArticleCardComponent } from './components/article-card/article-card.component';
import { ArticleDetailComponent } from './components/article-detail/article-detail.component';
import { CommentListComponent } from './components/comment-list/comment-list.component';
import { ArticleFormComponent } from './components/article-form/article-form.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { TimeAgoPipe } from './pipes/time-ago.pipe';
import { SortArticlesPipe } from './pipes/sort-articles.pipe';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    ArticleListComponent,
    ArticleCardComponent,
    ArticleDetailComponent,
    CommentListComponent,
    ArticleFormComponent,
    NavbarComponent,
    UserProfileComponent,
    AdminDashboardComponent,
    ClickOutsideDirective,
    TimeAgoPipe,
    SortArticlesPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    QuillModule.forRoot()
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true
    },
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
