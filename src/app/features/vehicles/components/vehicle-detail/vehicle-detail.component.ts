import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { Vehicle, VehicleStatus } from '../../../../core/models/vehicle.model';
import { VehicleService } from '../../services/vehicle.service';

@Component({
  selector: 'app-vehicle-detail',
  templateUrl: './vehicle-detail.component.html',
  styleUrls: ['./vehicle-detail.component.scss']
})
export class VehicleDetailComponent implements OnInit, OnDestroy {
  vehicle: Vehicle | null = null;
  loading = true;
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vehicleService: VehicleService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadVehicle(+id);
    } else {
      this.router.navigate(['/vehicles']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadVehicle(id: number): void {
    this.loading = true;
    this.vehicleService.getVehicle(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (vehicle) => {
          this.vehicle = vehicle;
        },
        error: (error) => {
          console.error('Error loading vehicle:', error);
          this.router.navigate(['/vehicles']);
        }
      });
  }

  onEdit(): void {
    if (this.vehicle) {
      this.router.navigate(['/vehicles/edit', this.vehicle.id]);
    }
  }

  onBack(): void {
    this.router.navigate(['/vehicles']);
  }

  getStatusColor(status: VehicleStatus): string {
    switch (status) {
      case VehicleStatus.AVAILABLE:
        return '#4caf50';
      case VehicleStatus.IN_USE:
        return '#ff9800';
      case VehicleStatus.MAINTENANCE:
        return '#f44336';
      case VehicleStatus.OUT_OF_SERVICE:
        return '#9e9e9e';
      default:
        return '#666';
    }
  }

  getTypeIcon(type: string): string {
    return type === 'Bus' ? 'directions_bus' : 'directions_car';
  }
}