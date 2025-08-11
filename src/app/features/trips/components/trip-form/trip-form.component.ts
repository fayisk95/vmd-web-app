import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, Observable } from 'rxjs';
import { takeUntil, finalize, startWith, map } from 'rxjs/operators';

import { Trip, TripStatus, AvailabilityCheck } from '../../../../core/models/trip.model';
import { Vehicle } from '../../../../core/models/vehicle.model';
import { Client } from '../../../../core/models/client.model';
import { TripService } from '../../services/trip.service';
import { VehicleService } from '../../../vehicles/services/vehicle.service';
import { ClientService } from '../../../clients/services/client.service';

@Component({
  selector: 'app-trip-form',
  templateUrl: './trip-form.component.html',
  styleUrls: ['./trip-form.component.scss']
})
export class TripFormComponent implements OnInit, OnDestroy {
  tripForm: FormGroup;
  loading = false;
  isEditMode = false;
  tripId: number | null = null;
  
  vehicles: Vehicle[] = [];
  clients: Client[] = [];
  tripStatuses = Object.values(TripStatus);
  
  filteredVehicles$!: Observable<Vehicle[]>;
  filteredClients$!: Observable<Client[]>;
  
  availabilityChecking = false;
  availabilityResult: any = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private tripService: TripService,
    private vehicleService: VehicleService,
    private clientService: ClientService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.tripForm = this.createForm();
    this.setupFilteredOptions();
  }

  ngOnInit(): void {
    this.loadData();
    this.checkEditMode();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private formatDateTimeLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  private createForm(): FormGroup {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    
    return this.fb.group({
      tripId: ['', [Validators.required, Validators.pattern(/^[A-Z0-9-]+$/)]],
      vehicleId: ['', Validators.required],
      clientId: ['', Validators.required],
      pickupLocation: ['', [Validators.required, Validators.minLength(3)]],
      dropLocation: ['', [Validators.required, Validators.minLength(3)]],
      pickupDateTime: [this.formatDateTimeLocal(tomorrow), Validators.required],
      dropDateTime: [''],
      price: ['', [Validators.required, Validators.min(0)]],
      status: [TripStatus.PENDING, Validators.required],
      notes: ['']
    });
  }

  private setupFilteredOptions(): void {
    this.filteredVehicles$ = this.tripForm.get('vehicleId')!.valueChanges.pipe(
      startWith(''),
      map(value => this.filterVehicles(value))
    );

    this.filteredClients$ = this.tripForm.get('clientId')!.valueChanges.pipe(
      startWith(''),
      map(value => this.filterClients(value))
    );
  }

  private filterVehicles(value: string): Vehicle[] {
    if (!value) return this.vehicles;
    const filterValue = value.toLowerCase();
    return this.vehicles.filter(vehicle => 
      vehicle.vehicleId.toLowerCase().includes(filterValue) ||
      vehicle.registrationNo.toLowerCase().includes(filterValue)
    );
  }

  private filterClients(value: string): Client[] {
    if (!value) return this.clients;
    const filterValue = value.toLowerCase();
    return this.clients.filter(client => 
      client.clientId.toLowerCase().includes(filterValue) ||
      client.name.toLowerCase().includes(filterValue)
    );
  }

  private loadData(): void {
    // Load vehicles
    this.vehicleService.getVehicles()
      .pipe(takeUntil(this.destroy$))
      .subscribe(vehicles => {
        this.vehicles = vehicles.filter(v => v.status === 'Available');
      });

    // Load clients
    this.clientService.getClients()
      .pipe(takeUntil(this.destroy$))
      .subscribe(clients => {
        this.clients = clients;
      });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.tripId = +id;
      this.loadTrip(this.tripId);
    }
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
          this.tripForm.patchValue({
            ...trip,
            pickupDateTime: this.formatDateTimeLocal(new Date(trip.pickupDateTime)),
            dropDateTime: trip.dropDateTime ? this.formatDateTimeLocal(new Date(trip.dropDateTime)) : ''
          });
        },
        error: (error) => {
          console.error('Error loading trip:', error);
          this.snackBar.open('Error loading trip', 'Close', { duration: 5000 });
          this.router.navigate(['/trips']);
        }
      });
  }

  onCheckAvailability(): void {
    const vehicleId = this.tripForm.get('vehicleId')?.value;
    const pickupDateTimeValue = this.tripForm.get('pickupDateTime')?.value;
    const dropDateTimeValue = this.tripForm.get('dropDateTime')?.value;
    
    // Convert datetime-local strings to Date objects
    const pickupDateTime = pickupDateTimeValue ? new Date(pickupDateTimeValue) : null;
    const dropDateTime = dropDateTimeValue ? new Date(dropDateTimeValue) : null;

    if (!vehicleId || !pickupDateTime) {
      this.snackBar.open('Please select vehicle and pickup date/time', 'Close', { duration: 3000 });
      return;
    }

    const availabilityCheck: AvailabilityCheck = {
      vehicleId,
      pickupDateTime,
      dropDateTime: dropDateTime || undefined
    };

    this.availabilityChecking = true;
    this.tripService.checkAvailability(availabilityCheck)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.availabilityChecking = false)
      )
      .subscribe({
        next: (result) => {
          this.availabilityResult = result;
          if (result.available) {
            this.snackBar.open('Vehicle is available!', 'Close', { duration: 3000 });
          } else {
            this.snackBar.open('Vehicle is not available for selected time', 'Close', { duration: 5000 });
          }
        },
        error: (error) => {
          console.error('Error checking availability:', error);
          this.snackBar.open('Error checking availability', 'Close', { duration: 5000 });
        }
      });
  }

  onSubmit(): void {
    if (this.tripForm.valid && !this.loading) {
      // Check availability before booking (for new trips)
      if (!this.isEditMode) {
        this.onCheckAvailability();
        // Wait for availability check result
        setTimeout(() => {
          if (this.availabilityResult?.available) {
            this.saveTrip();
          } else {
            this.snackBar.open('Cannot book trip - vehicle not available', 'Close', { duration: 5000 });
          }
        }, 1100);
      } else {
        this.saveTrip();
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private saveTrip(): void {
    this.loading = true;
    const formValue = { ...this.tripForm.value };
    
    // Convert datetime-local strings back to Date objects
    if (formValue.pickupDateTime) {
      formValue.pickupDateTime = new Date(formValue.pickupDateTime).toISOString();
    }
    if (formValue.dropDateTime) {
      formValue.dropDateTime = new Date(formValue.dropDateTime).toISOString();
    }
    
    if (this.isEditMode && this.tripId) {
      this.updateTrip(formValue);
    } else {
      this.createTrip(formValue);
    }
  }

  private createTrip(tripData: any): void {
    this.tripService.createTrip(tripData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Trip booked successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/trips']);
        },
        error: (error) => {
          console.error('Error creating trip:', error);
          this.snackBar.open('Error booking trip', 'Close', { duration: 5000 });
        }
      });
  }

  private updateTrip(tripData: any): void {
    const updatedTrip: Trip = {
      ...tripData,
      id: this.tripId!
    };

    this.tripService.updateTrip(updatedTrip)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Trip updated successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/trips']);
        },
        error: (error) => {
          console.error('Error updating trip:', error);
          this.snackBar.open('Error updating trip', 'Close', { duration: 5000 });
        }
      });
  }

  onCancel(): void {
    this.router.navigate(['/trips']);
  }

  getFieldError(fieldName: string): string {
    const field = this.tripForm.get(fieldName);
    
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['pattern']) {
        return `${this.getFieldLabel(fieldName)} format is invalid`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['min']) {
        return `${this.getFieldLabel(fieldName)} must be greater than or equal to ${field.errors['min'].min}`;
      }
    }
    
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      tripId: 'Trip ID',
      vehicleId: 'Vehicle ID',
      clientId: 'Client ID',
      pickupLocation: 'Pickup Location',
      dropLocation: 'Drop Location',
      pickupDateTime: 'Pickup Date/Time',
      dropDateTime: 'Drop Date/Time',
      price: 'Price',
      status: 'Status'
    };
    return labels[fieldName] || fieldName;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.tripForm.controls).forEach(key => {
      const control = this.tripForm.get(key);
      control?.markAsTouched();
    });
  }

  displayVehicle(vehicle: Vehicle): string {
    return vehicle ? `${vehicle.vehicleId} - ${vehicle.registrationNo}` : '';
  }

  displayClient(client: Client): string {
    return client ? `${client.clientId} - ${client.name}` : '';
  }
}