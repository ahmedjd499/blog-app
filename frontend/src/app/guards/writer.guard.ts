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
export class WriterGuard implements CanActivate {
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

    // Check if user has writer role or higher (admin, editor, writer)
    const allowedRoles = [UserRole.ADMIN, UserRole.EDITOR, UserRole.WRITER];
    if (allowedRoles.includes(currentUser.role)) {
      return true;
    }

    // Not a writer, redirect to home
    alert('Access denied. Writer privileges required.');
    this.router.navigate(['/']);
    return false;
  }
}
