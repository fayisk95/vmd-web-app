import { Component, Input, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { Vehicle, VehicleType, VehicleCategory, VehicleStatus, VehicleFilters } from '../../../../core/models/vehicle.model';
import { VehicleService } from '../../services/vehicle.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-vehicle-list',
  templateUrl: './vehicle-list.component.html',
  styleUrls: ['./vehicle-list.component.scss']
})
export class VehicleListComponent implements OnInit, OnDestroy {
  @Input() vehicles: Vehicle[] | null = [];
  
  displayedColumns: string[] = ['photo', 'vehicleId', 'registrationNo', 'type', 'category', 'seatCount', 'status', 'actions'];
  dataSource = new MatTableDataSource<Vehicle>();
  filterForm: FormGroup;
  loading = false;
  
  vehicleTypes = Object.values(VehicleType);
  vehicleCategories = Object.values(VehicleCategory);
  vehicleStatuses = Object.values(VehicleStatus);
  
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private vehicleService: VehicleService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.filterForm = this.createFilterForm();
  }

  ngOnInit(): void {
    this.setupFilters();
    this.updateDataSource();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnChanges(): void {
    this.updateDataSource();
  }

  private createFilterForm(): FormGroup {
    return this.fb.group({
      searchTerm: [''],
      type: [''],
      category: [''],
      status: [''],
      minSeats: [''],
      maxSeats: ['']
    });
  }

  private setupFilters(): void {
    this.filterForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.applyFilters();
      });
  }

  private updateDataSource(): void {
    if (this.vehicles) {
      this.dataSource.data = this.vehicles;
      this.applyFilters();
    }
  }

  private applyFilters(): void {
    if (!this.vehicles) return;

    const filters: VehicleFilters = this.filterForm.value;
    const filteredVehicles = this.vehicleService.filterVehicles(this.vehicles, filters);
    this.dataSource.data = filteredVehicles;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearFilters(): void {
    this.filterForm.reset();
  }

  onView(vehicle: Vehicle): void {
    this.router.navigate(['/vehicles', vehicle.id]);
  }

  onEdit(vehicle: Vehicle): void {
    this.router.navigate(['/vehicles/edit', vehicle.id]);
  }

  onDelete(vehicle: Vehicle): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Vehicle',
        message: `Are you sure you want to delete vehicle ${vehicle.vehicleId}? This action cannot be undone.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteVehicle(vehicle);
      }
    });
  }

  private deleteVehicle(vehicle: Vehicle): void {
    this.loading = true;
    this.vehicleService.deleteVehicle(vehicle.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Vehicle deleted successfully', 'Close', { duration: 3000 });
          this.loading = false;
        },
        error: (error) => {
          console.error('Error deleting vehicle:', error);
          this.snackBar.open('Error deleting vehicle', 'Close', { duration: 5000 });
          this.loading = false;
        }
      });
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

  getTypeIcon(type: VehicleType): string {
    return type === VehicleType.BUS ? 'directions_bus' : 'directions_car';
  }
}