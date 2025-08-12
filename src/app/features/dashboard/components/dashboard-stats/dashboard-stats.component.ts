import { Component, Input } from '@angular/core';
import { DashboardStats } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard-stats',
  templateUrl: './dashboard-stats.component.html',
  styleUrls: ['./dashboard-stats.component.scss']
})
export class DashboardStatsComponent {
  @Input() stats: DashboardStats | null = null;
  @Input() loading = false;

  getAvailabilityIcon(): string {
    if (!this.stats) return 'help';
    
    if (this.stats.availabilityRate >= 80) return 'check_circle';
    if (this.stats.availabilityRate >= 60) return 'warning';
    return 'error';
  }

  getAvailabilityColor(): string {
    if (!this.stats) return '#666';
    
    if (this.stats.availabilityRate >= 80) return '#4caf50';
    if (this.stats.availabilityRate >= 60) return '#ff9800';
    return '#f44336';
  }

  getUtilizationColor(): string {
    if (!this.stats) return '#666';
    
    if (this.stats.utilizationRate >= 70) return '#4caf50';
    if (this.stats.utilizationRate >= 40) return '#ff9800';
    return '#f44336';
  }

  getGrowthIcon(): string {
    if (!this.stats) return 'trending_flat';
    
    if (this.stats.monthlyGrowth > 0) return 'trending_up';
    if (this.stats.monthlyGrowth < 0) return 'trending_down';
    return 'trending_flat';
  }

  getGrowthColor(): string {
    if (!this.stats) return '#666';
    
    if (this.stats.monthlyGrowth > 0) return '#4caf50';
    if (this.stats.monthlyGrowth < 0) return '#f44336';
    return '#666';
  }
}