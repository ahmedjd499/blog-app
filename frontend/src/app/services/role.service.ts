import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { UserRole } from '../models/user.model';

/**
 * Service to help with role-based UI logic in components and templates
 * This complements the route guards for conditional rendering
 */
@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private roleHierarchy: { [key: string]: number } = {
    [UserRole.ADMIN]: 4,
    [UserRole.EDITOR]: 3,
    [UserRole.WRITER]: 2,
    [UserRole.READER]: 1
  };

  constructor(private authService: AuthService) {}

  /**
   * Check if current user is an admin
   */
  isAdmin(): boolean {
    return this.hasRole(UserRole.ADMIN);
  }

  /**
   * Check if current user is an editor or higher
   */
  isEditor(): boolean {
    return this.hasMinimumRole(UserRole.EDITOR);
  }

  /**
   * Check if current user is a writer or higher
   */
  isWriter(): boolean {
    return this.hasMinimumRole(UserRole.WRITER);
  }

  /**
   * Check if current user is a reader (any authenticated user)
   */
  isReader(): boolean {
    return this.hasMinimumRole(UserRole.READER);
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: UserRole): boolean {
    const currentUser = this.authService.currentUserValue;
    return currentUser?.role === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: UserRole[]): boolean {
    const currentUser = this.authService.currentUserValue;
    return currentUser ? roles.includes(currentUser.role) : false;
  }

  /**
   * Check if user has minimum role level (including higher roles)
   * Example: hasMinimumRole(UserRole.WRITER) returns true for WRITER, EDITOR, and ADMIN
   */
  hasMinimumRole(minimumRole: UserRole): boolean {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return false;

    const userLevel = this.roleHierarchy[currentUser.role] || 0;
    const minimumLevel = this.roleHierarchy[minimumRole] || 0;
    return userLevel >= minimumLevel;
  }

  /**
   * Get current user's role
   */
  getCurrentRole(): UserRole | null {
    return this.authService.currentUserValue?.role || null;
  }

  /**
   * Get role display name
   */
  getRoleDisplayName(role: UserRole): string {
    const displayNames: { [key in UserRole]: string } = {
      [UserRole.ADMIN]: 'Administrator',
      [UserRole.EDITOR]: 'Editor',
      [UserRole.WRITER]: 'Writer',
      [UserRole.READER]: 'Reader'
    };
    return displayNames[role] || role;
  }

  /**
   * Check if current user can edit a specific article
   * Writers can only edit their own articles, Editors and Admins can edit any
   */
  canEditArticle(articleAuthorId: string): boolean {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return false;

    // Admins and Editors can edit any article
    if (this.hasAnyRole([UserRole.ADMIN, UserRole.EDITOR])) {
      return true;
    }

    // Writers can only edit their own articles
    if (this.hasRole(UserRole.WRITER)) {
      return currentUser._id === articleAuthorId;
    }

    return false;
  }

  /**
   * Check if current user can delete a specific article
   * Only Admins and the article author can delete
   */
  canDeleteArticle(articleAuthorId: string): boolean {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return false;

    // Admins can delete any article
    if (this.isAdmin()) {
      return true;
    }

    // Authors can delete their own articles
    return currentUser._id === articleAuthorId;
  }

  /**
   * Check if current user can moderate comments
   */
  canModerateComments(): boolean {
    return this.hasMinimumRole(UserRole.EDITOR);
  }

  /**
   * Check if current user can manage users
   */
  canManageUsers(): boolean {
    return this.isAdmin();
  }

  /**
   * Check if current user can publish articles
   * (Writers create drafts, Editors can publish)
   */
  canPublishArticles(): boolean {
    return this.hasMinimumRole(UserRole.EDITOR);
  }
}
