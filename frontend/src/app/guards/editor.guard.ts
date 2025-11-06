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

@Injectable({
  providedIn: 'root'
})
export class EditorGuard implements CanActivate {
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

    // Check if user has editor role or higher (admin, editor)
    const allowedRoles = [UserRole.ADMIN, UserRole.EDITOR];
    if (allowedRoles.includes(currentUser.role)) {
      return true;
    }

    // Not an editor, redirect to home
    alert('Access denied. Editor privileges required.');
    this.router.navigate(['/']);
    return false;
  }
}
