import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { RoleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      currentUserValue: null
    });
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        RoleGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(RoleGuard);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access when user has required role', () => {
    const mockUser = {
      _id: '1',
      username: 'editor',
      email: 'editor@test.com',
      role: UserRole.EDITOR,
      createdAt: new Date()
    };
    Object.defineProperty(authService, 'currentUserValue', {
      get: () => mockUser
    });

    const route = {
      data: { roles: [UserRole.EDITOR, UserRole.ADMIN] }
    } as any;

    const result = guard.canActivate(route, {} as any);
    expect(result).toBe(true);
  });

  it('should allow access with minimum role when user role is higher', () => {
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

    const route = {
      data: { minimumRole: UserRole.WRITER }
    } as any;

    const result = guard.canActivate(route, {} as any);
    expect(result).toBe(true);
  });

  it('should deny access when user does not have required role', () => {
    const mockUser = {
      _id: '1',
      username: 'reader',
      email: 'reader@test.com',
      role: UserRole.READER,
      createdAt: new Date()
    };
    Object.defineProperty(authService, 'currentUserValue', {
      get: () => mockUser
    });

    const route = {
      data: { roles: [UserRole.ADMIN, UserRole.EDITOR] }
    } as any;

    spyOn(window, 'alert');
    const result = guard.canActivate(route, {} as any);
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should allow access when no roles specified (authenticated only)', () => {
    const mockUser = {
      _id: '1',
      username: 'reader',
      email: 'reader@test.com',
      role: UserRole.READER,
      createdAt: new Date()
    };
    Object.defineProperty(authService, 'currentUserValue', {
      get: () => mockUser
    });

    const route = { data: {} } as any;
    const result = guard.canActivate(route, {} as any);
    expect(result).toBe(true);
  });

  it('should redirect to login if user is not authenticated', () => {
    Object.defineProperty(authService, 'currentUserValue', {
      get: () => null
    });

    const route = { data: { roles: [UserRole.ADMIN] } } as any;
    const state = { url: '/protected-page' } as any;
    const result = guard.canActivate(route, state);
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/protected-page' } });
  });

  it('should properly check role hierarchy', () => {
    const mockUser = {
      _id: '1',
      username: 'writer',
      email: 'writer@test.com',
      role: UserRole.WRITER,
      createdAt: new Date()
    };
    Object.defineProperty(authService, 'currentUserValue', {
      get: () => mockUser
    });

    const route = {
      data: { minimumRole: UserRole.READER }
    } as any;

    const result = guard.canActivate(route, {} as any);
    expect(result).toBe(true);
  });
});
