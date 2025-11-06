import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';
import { 
  Article, 
  ArticleResponse, 
  ArticlesResponse 
} from '../models/article.model';

@Injectable({
  providedIn: 'root'
})
export class ArticleService extends BaseService {
  constructor(http: HttpClient) {
    super(http);
  }

  getArticles(page: number = 1, limit: number = 10, search?: string, tag?: string): Observable<ArticlesResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (search) {
      params = params.set('search', search);
    }
    if (tag) {
      params = params.set('tag', tag);
    }

    return this.get<ArticlesResponse>('/articles', params);
  }

  getArticleById(id: string): Observable<ArticleResponse> {
    return this.get<ArticleResponse>(`/articles/${id}`);
  }

  createArticle(formData: FormData): Observable<ArticleResponse> {
    return this.post<ArticleResponse>('/articles', formData);
  }

  updateArticle(id: string, formData: FormData): Observable<ArticleResponse> {
    return this.put<ArticleResponse>(`/articles/${id}`, formData);
  }

  deleteArticle(id: string): Observable<any> {
    return this.delete(`/articles/${id}`);
  }
}
