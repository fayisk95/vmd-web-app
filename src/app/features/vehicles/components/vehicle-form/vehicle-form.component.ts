import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { Vehicle, VehicleType, VehicleCategory, VehicleStatus } from '../../../../core/models/vehicle.model';
import { VehicleService } from '../../services/vehicle.service';

@Component({
  selector: 'app-vehicle-form',
  templateUrl: './vehicle-form.component.html',
  styleUrls: ['./vehicle-form.component.scss']
})
export class VehicleFormComponent implements OnInit, OnDestroy {
  vehicleForm: FormGroup;
  loading = false;
  isEditMode = false;
  vehicleId: number | null = null;
  photoPreview: string | null = null;
  
  vehicleTypes = Object.values(VehicleType);
  vehicleCategories = Object.values(VehicleCategory);
  vehicleStatuses = Object.values(VehicleStatus);
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.vehicleForm = this.createForm();
  }

  ngOnInit(): void {
    this.checkEditMode();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      vehicleId: ['', [Validators.required, Validators.pattern(/^[A-Z0-9-]+$/)]],
      registrationNo: ['', [Validators.required, Validators.pattern(/^[A-Z0-9-]+$/)]],
      type: ['', Validators.required],
      category: ['', Validators.required],
      seatCount: ['', [Validators.required, Validators.min(1), Validators.max(100)]],
      status: [VehicleStatus.AVAILABLE, Validators.required],
      photo: ['']
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.vehicleId = +id;
      this.loadVehicle(this.vehicleId);
    }
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
          this.vehicleForm.patchValue(vehicle);
          this.photoPreview = vehicle.photo || null;
        },
        error: (error) => {
          console.error('Error loading vehicle:', error);
          this.snackBar.open('Error loading vehicle', 'Close', { duration: 5000 });
          this.router.navigate(['/vehicles']);
        }
      });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.snackBar.open('Please select a valid image file', 'Close', { duration: 3000 });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('File size must be less than 5MB', 'Close', { duration: 3000 });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        this.photoPreview = reader.result as string;
        this.vehicleForm.patchValue({ photo: this.photoPreview });
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto(): void {
    this.photoPreview = null;
    this.vehicleForm.patchValue({ photo: '' });
    // Reset file input
    const fileInput = document.getElementById('photo-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onSubmit(): void {
    if (this.vehicleForm.valid && !this.loading) {
      this.loading = true;
      
      const formValue = this.vehicleForm.value;
      
      if (this.isEditMode && this.vehicleId) {
        this.updateVehicle(formValue);
      } else {
        this.createVehicle(formValue);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private createVehicle(vehicleData: any): void {
    this.vehicleService.createVehicle(vehicleData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Vehicle created successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/vehicles']);
        },
        error: (error) => {
          console.error('Error creating vehicle:', error);
          this.snackBar.open('Error creating vehicle', 'Close', { duration: 5000 });
        }
      });
  }

  private updateVehicle(vehicleData: any): void {
    const updatedVehicle: Vehicle = {
      ...vehicleData,
      id: this.vehicleId!
    };

    this.vehicleService.updateVehicle(updatedVehicle)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Vehicle updated successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/vehicles']);
        },
        error: (error) => {
          console.error('Error updating vehicle:', error);
          this.snackBar.open('Error updating vehicle', 'Close', { duration: 5000 });
        }
      });
  }

  onCancel(): void {
    this.router.navigate(['/vehicles']);
  }

  getFieldError(fieldName: string): string {
    const field = this.vehicleForm.get(fieldName);
    
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['pattern']) {
        return `${this.getFieldLabel(fieldName)} format is invalid`;
      }
      if (field.errors['min']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `${this.getFieldLabel(fieldName)} must be at most ${field.errors['max'].max}`;
      }
    }
    
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      vehicleId: 'Vehicle ID',
      registrationNo: 'Registration Number',
      type: 'Vehicle Type',
      category: 'Category',
      seatCount: 'Seat Count',
      status: 'Status'
    };
    return labels[fieldName] || fieldName;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.vehicleForm.controls).forEach(key => {
      const control = this.vehicleForm.get(key);
      control?.markAsTouched();
    });
  }
}