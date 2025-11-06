import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { WriterGuard } from './writer.guard';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

describe('WriterGuard', () => {
  let guard: WriterGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      currentUserValue: null
    });
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        WriterGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(WriterGuard);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access for admin user', () => {
    const mockUser = {
      _id: '1',
      username: 'admin',
      email: 'admin@test.com',
      role: UserRole.ADMIN,
      createdAt: new Date()
    };
    Object.defineProperty(authService, 'currentUserValue', {
      get: () => mockUser
    });

    const result = guard.canActivate({} as any, {} as any);
    expect(result).toBe(true);
  });

  it('should allow access for editor user', () => {
    const mockUser = {
      _id: '2',
      username: 'editor',
      email: 'editor@test.com',
      role: UserRole.EDITOR,
      createdAt: new Date()
    };
    Object.defineProperty(authService, 'currentUserValue', {
      get: () => mockUser
    });

    const result = guard.canActivate({} as any, {} as any);
    expect(result).toBe(true);
  });

  it('should allow access for writer user', () => {
    const mockUser = {
      _id: '3',
      username: 'writer',
      email: 'writer@test.com',
      role: UserRole.WRITER,
      createdAt: new Date()
    };
    Object.defineProperty(authService, 'currentUserValue', {
      get: () => mockUser
    });

    const result = guard.canActivate({} as any, {} as any);
    expect(result).toBe(true);
  });

  it('should deny access for reader user', () => {
    const mockUser = {
      _id: '4',
      username: 'reader',
      email: 'reader@test.com',
      role: UserRole.READER,
      createdAt: new Date()
    };
    Object.defineProperty(authService, 'currentUserValue', {
      get: () => mockUser
    });

    spyOn(window, 'alert');
    const result = guard.canActivate({} as any, {} as any);
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should redirect to login if user is not authenticated', () => {
    Object.defineProperty(authService, 'currentUserValue', {
      get: () => null
    });

    const state = { url: '/writer-page' } as any;
    const result = guard.canActivate({} as any, state);
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/writer-page' } });
  });
});
