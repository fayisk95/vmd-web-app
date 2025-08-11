import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { Trip, TripStatus } from '../../../../core/models/trip.model';
import { TripService } from '../../services/trip.service';

@Component({
  selector: 'app-trip-detail',
  templateUrl: './trip-detail.component.html',
  styleUrls: ['./trip-detail.component.scss']
})
export class TripDetailComponent implements OnInit, OnDestroy {
  trip: Trip | null = null;
  loading = true;
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tripService: TripService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTrip(+id);
    } else {
      this.router.navigate(['/trips']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTrip(id: number): void {
    this.loading = true;
    this.tripService.getTrip(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (trip) => {
          this.trip = trip;
        },
        error: (error) => {
          console.error('Error loading trip:', error);
          this.router.navigate(['/trips']);
        }
      });
  }

  onEdit(): void {
    if (this.trip) {
      this.router.navigate(['/trips/edit', this.trip.id]);
    }
  }

  onBack(): void {
    this.router.navigate(['/trips']);
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

  calculateDuration(): string {
    if (!this.trip?.dropDateTime) return 'Open-ended';
    
    const pickup = new Date(this.trip.pickupDateTime);
    const drop = new Date(this.trip.dropDateTime);
    const diffMs = drop.getTime() - pickup.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  }
}