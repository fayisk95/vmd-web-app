import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate, CanActivateChild {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkRole(route);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkRole(childRoute);
  }

  private checkRole(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles = route.data['roles'] as UserRole[];
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    if (this.authService.hasAnyRole(requiredRoles)) {
      return true;
    }

    // Redirect to unauthorized page or dashboard
    this.router.navigate(['/dashboard']);
    return false;
  }
}