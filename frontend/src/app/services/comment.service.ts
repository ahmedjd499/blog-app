import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Comment, 
  CommentCreateRequest, 
  CommentResponse, 
  CommentsResponse 
} from '../models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = '/api/comments';

  constructor(private http: HttpClient) {}

  getCommentsByArticle(articleId: string): Observable<CommentsResponse> {
    return this.http.get<CommentsResponse>(`${this.apiUrl}/article/${articleId}`);
  }

  createComment(data: CommentCreateRequest): Observable<CommentResponse> {
    return this.http.post<CommentResponse>(this.apiUrl, data);
  }

  deleteComment(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
