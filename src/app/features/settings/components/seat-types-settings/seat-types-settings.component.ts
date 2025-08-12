import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { SeatType } from '../../../../core/models/settings.model';
import { SettingsService } from '../../services/settings.service';
import { SeatTypeFormDialogComponent } from '../seat-type-form-dialog/seat-type-form-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-seat-types-settings',
  templateUrl: './seat-types-settings.component.html',
  styleUrls: ['./seat-types-settings.component.scss']
})
export class SeatTypesSettingsComponent implements OnDestroy {
  @Input() seatTypes: SeatType[] = [];
  @Output() settingsUpdated = new EventEmitter<void>();

  loading = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private settingsService: SettingsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onAddSeatType(): void {
    const dialogRef = this.dialog.open(SeatTypeFormDialogComponent, {
      width: '500px',
      data: { seatType: null, isEditMode: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createSeatType(result);
      }
    });
  }

  onEditSeatType(seatType: SeatType): void {
    const dialogRef = this.dialog.open(SeatTypeFormDialogComponent, {
      width: '500px',
      data: { seatType: { ...seatType }, isEditMode: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateSeatType(result);
      }
    });
  }

  onDeleteSeatType(seatType: SeatType): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Seat Type',
        message: `Are you sure you want to delete the seat type "${seatType.name}"? This action cannot be undone.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteSeatType(seatType);
      }
    });
  }

  onToggleActive(seatType: SeatType): void {
    const updatedSeatType = {
      ...seatType,
      isActive: !seatType.isActive
    };
    this.updateSeatType(updatedSeatType);
  }

  private createSeatType(seatTypeData: Omit<SeatType, 'id'>): void {
    this.loading = true;
    this.settingsService.addSeatType(seatTypeData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Seat type created successfully', 'Close', { duration: 3000 });
          this.settingsUpdated.emit();
        },
        error: (error) => {
          console.error('Error creating seat type:', error);
          this.snackBar.open('Error creating seat type', 'Close', { duration: 5000 });
        }
      });
  }

  private updateSeatType(seatType: SeatType): void {
    this.loading = true;
    this.settingsService.updateSeatType(seatType)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Seat type updated successfully', 'Close', { duration: 3000 });
          this.settingsUpdated.emit();
        },
        error: (error) => {
          console.error('Error updating seat type:', error);
          this.snackBar.open('Error updating seat type', 'Close', { duration: 5000 });
        }
      });
  }

  private deleteSeatType(seatType: SeatType): void {
    this.loading = true;
    this.settingsService.deleteSeatType(seatType.id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Seat type deleted successfully', 'Close', { duration: 3000 });
          this.settingsUpdated.emit();
        },
        error: (error) => {
          console.error('Error deleting seat type:', error);
          this.snackBar.open('Error deleting seat type', 'Close', { duration: 5000 });
        }
      });
  }

  getActiveSeatTypes(): SeatType[] {
    return this.seatTypes.filter(s => s.isActive);
  }

  getInactiveSeatTypes(): SeatType[] {
    return this.seatTypes.filter(s => !s.isActive);
  }
}