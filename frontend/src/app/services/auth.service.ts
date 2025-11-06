import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { BaseService } from './base.service';
import { HttpClient } from '@angular/common/http';
import { 
  User, 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest 
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(http: HttpClient) {
    super(http);
    const storedUser = this.getUserFromToken();
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.post<AuthResponse>('/auth/register', data)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.setTokens(response.data.accessToken, response.data.refreshToken);
            this.setUser(response.data.user);
            this.currentUserSubject.next(response.data.user);
          }
        })
      );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.post<AuthResponse>('/auth/login', data)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.setTokens(response.data.accessToken, response.data.refreshToken);
            this.setUser(response.data.user);
            this.currentUserSubject.next(response.data.user);
          }
        })
      );
  }

  logout(): Observable<any> {
    return this.post('/auth/logout', {})
      .pipe(
        tap(() => {
          this.clearTokens();
          this.clearUser();
          this.currentUserSubject.next(null);
        })
      );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    return this.post<AuthResponse>('/auth/refresh', { refreshToken })
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.setTokens(response.data.accessToken, response.data.refreshToken);
          }
        })
      );
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  isLoggedIn(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    
    try {
      const decoded: any = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  hasRole(roles: string[]): boolean {
    const user = this.currentUserValue;
    return user ? roles.includes(user.role) : false;
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  private clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  private setUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  private clearUser(): void {
    localStorage.removeItem('currentUser');
  }

  private getUserFromToken(): User | null {
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        this.clearTokens();
        this.clearUser();
        return null;
      }
      
      // Get user from localStorage
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        return JSON.parse(userStr);
      }
      return null;
    } catch {
      this.clearTokens();
      this.clearUser();
      return null;
    }
  }
}
