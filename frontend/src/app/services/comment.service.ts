import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';
import { 
  Comment, 
  CommentCreateRequest, 
  CommentResponse, 
  CommentsResponse 
} from '../models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService extends BaseService {
  constructor(http: HttpClient) {
    super(http);
  }

  getCommentsByArticle(articleId: string): Observable<CommentsResponse> {
    return this.get<CommentsResponse>(`/comments/article/${articleId}`);
  }

  createComment(data: CommentCreateRequest): Observable<CommentResponse> {
    return this.post<CommentResponse>('/comments', data);
  }

  deleteComment(id: string): Observable<any> {
    return this.delete(`/comments/${id}`);
  }
}
