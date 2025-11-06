import { TestBed } from '@angular/core/testing';
import { RoleService } from './role.service';
import { AuthService } from './auth.service';
import { UserRole } from '../models/user.model';

describe('RoleService', () => {
  let service: RoleService;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      currentUserValue: null
    });

    TestBed.configureTestingModule({
      providers: [
        RoleService,
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    service = TestBed.inject(RoleService);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isAdmin', () => {
    it('should return true for admin user', () => {
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

      expect(service.isAdmin()).toBe(true);
    });

    it('should return false for non-admin user', () => {
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

      expect(service.isAdmin()).toBe(false);
    });
  });

  describe('hasMinimumRole', () => {
    it('should return true when user has exact minimum role', () => {
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

      expect(service.hasMinimumRole(UserRole.WRITER)).toBe(true);
    });

    it('should return true when user has higher role', () => {
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

      expect(service.hasMinimumRole(UserRole.WRITER)).toBe(true);
    });

    it('should return false when user has lower role', () => {
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

      expect(service.hasMinimumRole(UserRole.WRITER)).toBe(false);
    });
  });

  describe('canEditArticle', () => {
    it('should allow admin to edit any article', () => {
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

      expect(service.canEditArticle('different-user-id')).toBe(true);
    });

    it('should allow writer to edit own article', () => {
      const mockUser = {
        _id: 'user-123',
        username: 'writer',
        email: 'writer@test.com',
        role: UserRole.WRITER,
        createdAt: new Date()
      };
      Object.defineProperty(authService, 'currentUserValue', {
        get: () => mockUser
      });

      expect(service.canEditArticle('user-123')).toBe(true);
    });

    it('should not allow writer to edit others article', () => {
      const mockUser = {
        _id: 'user-123',
        username: 'writer',
        email: 'writer@test.com',
        role: UserRole.WRITER,
        createdAt: new Date()
      };
      Object.defineProperty(authService, 'currentUserValue', {
        get: () => mockUser
      });

      expect(service.canEditArticle('different-user-id')).toBe(false);
    });
  });
});
