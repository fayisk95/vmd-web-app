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

import { Trip, TripStatus, TripFilters } from '../../../../core/models/trip.model';
import { TripService } from '../../services/trip.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-trip-list',
  templateUrl: './trip-list.component.html',
  styleUrls: ['./trip-list.component.scss']
})
export class TripListComponent implements OnInit, OnDestroy {
  @Input() trips: Trip[] | null = [];
  
  displayedColumns: string[] = ['tripId', 'vehicleId', 'clientId', 'route', 'pickupDateTime', 'price', 'status', 'actions'];
  dataSource = new MatTableDataSource<Trip>();
  filterForm: FormGroup;
  loading = false;
  
  tripStatuses = Object.values(TripStatus);
  
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private tripService: TripService,
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
      status: [''],
      dateFrom: [''],
      dateTo: ['']
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
    if (this.trips) {
      this.dataSource.data = this.trips;
      this.applyFilters();
    }
  }

  private applyFilters(): void {
    if (!this.trips) return;

    const filters: TripFilters = this.filterForm.value;
    const filteredTrips = this.tripService.filterTrips(this.trips, filters);
    this.dataSource.data = filteredTrips;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearFilters(): void {
    this.filterForm.reset();
  }

  onView(trip: Trip): void {
    this.router.navigate(['/trips', trip.id]);
  }

  onEdit(trip: Trip): void {
    this.router.navigate(['/trips/edit', trip.id]);
  }

  onDelete(trip: Trip): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Trip',
        message: `Are you sure you want to delete trip ${trip.tripId}? This action cannot be undone.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteTrip(trip);
      }
    });
  }

  private deleteTrip(trip: Trip): void {
    this.loading = true;
    this.tripService.deleteTrip(trip.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Trip deleted successfully', 'Close', { duration: 3000 });
          this.loading = false;
        },
        error: (error) => {
          console.error('Error deleting trip:', error);
          this.snackBar.open('Error deleting trip', 'Close', { duration: 5000 });
          this.loading = false;
        }
      });
  }

  getStatusColor(status: TripStatus): string {
    switch (status) {
      case TripStatus.PENDING:
        return '#ff9800';
      case TripStatus.CONFIRMED:
        return '#2196f3';
      case TripStatus.IN_PROGRESS:
        return '#4caf50';
      case TripStatus.COMPLETED:
        return '#8bc34a';
      case TripStatus.CANCELLED:
        return '#f44336';
      default:
        return '#666';
    }
  }

  formatRoute(trip: Trip): string {
    return `${trip.pickupLocation} → ${trip.dropLocation}`;
  }
}