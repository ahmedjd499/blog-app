import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Article, 
  ArticleResponse, 
  ArticlesResponse 
} from '../models/article.model';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private apiUrl = '/api/articles';

  constructor(private http: HttpClient) {}

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

    return this.http.get<ArticlesResponse>(this.apiUrl, { params });
  }

  getArticleById(id: string): Observable<ArticleResponse> {
    return this.http.get<ArticleResponse>(`${this.apiUrl}/${id}`);
  }

  createArticle(formData: FormData): Observable<ArticleResponse> {
    return this.http.post<ArticleResponse>(this.apiUrl, formData);
  }

  updateArticle(id: string, formData: FormData): Observable<ArticleResponse> {
    return this.http.put<ArticleResponse>(`${this.apiUrl}/${id}`, formData);
  }

  deleteArticle(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getImageUrl(imagePath: string): string {
    return `/uploads/${imagePath}`;
  }
}
