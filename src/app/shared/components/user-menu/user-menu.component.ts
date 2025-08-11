import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { User, UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss']
})
export class UserMenuComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  UserRole = UserRole;
  
  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout(): void {
    this.authService.logout();
  }

  getRoleColor(role: UserRole | undefined): string {
    if (!role) return '#666';
    switch (role) {
      case UserRole.ADMIN:
        return '#f44336';
      case UserRole.MANAGER:
        return '#ff9800';
      case UserRole.DRIVER:
        return '#4caf50';
      default:
        return '#666';
    }
  }

  getRoleIcon(role: UserRole | undefined): string {
    if (!role) return 'person';
    switch (role) {
      case UserRole.ADMIN:
        return 'admin_panel_settings';
      case UserRole.MANAGER:
        return 'supervisor_account';
      case UserRole.DRIVER:
        return 'drive_eta';
      default:
        return 'person';
    }
  }
}