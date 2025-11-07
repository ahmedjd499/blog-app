import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';
import { User } from '../models/user.model';

export interface UserResponse {
  success: boolean;
  data: User;
}

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseService {
  constructor(http: HttpClient) {
    super(http);
  }

  getUserById(userId: string): Observable<UserResponse> {
    return this.get<UserResponse>(`/auth/user/${userId}`);
  }
}
