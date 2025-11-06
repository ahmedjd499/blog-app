import { Injectable } from '@angular/core';
import { 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  UrlTree,
  Router,
  CanActivate
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

/**
 * Generic role guard that checks if user has any of the required roles
 * Usage in routing:
 * { path: 'some-path', component: SomeComponent, canActivate: [RoleGuard], data: { roles: [UserRole.ADMIN, UserRole.EDITOR] } }
 */
@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  // Role hierarchy for permission checking
  private roleHierarchy: { [key: string]: number } = {
    [UserRole.ADMIN]: 4,
    [UserRole.EDITOR]: 3,
    [UserRole.WRITER]: 2,
    [UserRole.READER]: 1
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const currentUser = this.authService.currentUserValue;
    
    if (!currentUser) {
      // Not logged in, redirect to login
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    // Get required roles from route data
    const requiredRoles = route.data['roles'] as UserRole[];
    
    if (!requiredRoles || requiredRoles.length === 0) {
      // No specific roles required, just need to be authenticated
      return true;
    }

    // Check if user has any of the required roles
    if (this.hasAnyRole(currentUser.role, requiredRoles)) {
      return true;
    }

    // Check if minimum role is specified
    const minimumRole = route.data['minimumRole'] as UserRole;
    if (minimumRole && this.hasMinimumRole(currentUser.role, minimumRole)) {
      return true;
    }

    // User doesn't have required role
    alert(`Access denied. Required role: ${requiredRoles.join(' or ')}`);
    this.router.navigate(['/']);
    return false;
  }

  /**
   * Check if user has any of the specified roles
   */
  private hasAnyRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
    return requiredRoles.includes(userRole);
  }

  /**
   * Check if user role meets minimum role requirement (including hierarchy)
   */
  private hasMinimumRole(userRole: UserRole, minimumRole: UserRole): boolean {
    const userLevel = this.roleHierarchy[userRole] || 0;
    const minimumLevel = this.roleHierarchy[minimumRole] || 0;
    return userLevel >= minimumLevel;
  }
}
