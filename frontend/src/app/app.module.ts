import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { ArticleListComponent } from './components/article-list/article-list.component';
import { ArticleCardComponent } from './components/article-card/article-card.component';
import { ArticleDetailComponent } from './components/article-detail/article-detail.component';
import { CommentListComponent } from './components/comment-list/comment-list.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    ArticleListComponent,
    ArticleCardComponent,
    ArticleDetailComponent,
    CommentListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
