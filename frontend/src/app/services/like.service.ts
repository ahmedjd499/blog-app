import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';
import { 
  Like,
  LikeCreateRequest, 
  LikeResponse, 
  LikesResponse,
  LikeCheckResponse,
  UserLikesResponse
} from '../models/like.model';

@Injectable({
  providedIn: 'root'
})
export class LikeService extends BaseService {
  constructor(http: HttpClient) {
    super(http);
  }

  toggleLike(data: LikeCreateRequest): Observable<LikeResponse> {
    return this.post<LikeResponse>('/likes', data);
  }

  getLikesByArticle(articleId: string): Observable<LikesResponse> {
    return this.get<LikesResponse>(`/likes/article/${articleId}`);
  }

  checkUserLike(articleId: string): Observable<LikeCheckResponse> {
    return this.get<LikeCheckResponse>(`/likes/article/${articleId}/check`);
  }

  getLikesByUser(userId: string): Observable<UserLikesResponse> {
    return this.get<UserLikesResponse>(`/likes/user/${userId}`);
  }
}
