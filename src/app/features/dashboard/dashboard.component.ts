import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { User, UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  dashboardData: any = {};
  loading = true;
  currentUser$: Observable<User | null>;

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.apiService.getById('dashboard', 1).subscribe({
      next: (data) => {
        console.log(data)
        this.dashboardData = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
      }
    });
  }

  getRoleColor(role: UserRole): string {
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
}
