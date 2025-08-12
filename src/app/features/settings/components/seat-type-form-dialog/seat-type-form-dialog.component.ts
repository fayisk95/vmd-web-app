import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SeatType } from '../../../../core/models/settings.model';

export interface SeatTypeFormDialogData {
  seatType: SeatType | null;
  isEditMode: boolean;
}

@Component({
  selector: 'app-seat-type-form-dialog',
  templateUrl: './seat-type-form-dialog.component.html',
  styleUrls: ['./seat-type-form-dialog.component.scss']
})
export class SeatTypeFormDialogComponent {
  seatTypeForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<SeatTypeFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SeatTypeFormDialogData
  ) {
    this.seatTypeForm = this.createForm();
    if (this.data.seatType) {
      this.seatTypeForm.patchValue(this.data.seatType);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      priceMultiplier: ['', [Validators.required, Validators.min(0.5), Validators.max(5)]],
      isActive: [true]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.seatTypeForm.valid) {
      const formValue = this.seatTypeForm.value;
      const result = this.data.isEditMode ? 
        { ...this.data.seatType, ...formValue } : 
        formValue;
      this.dialogRef.close(result);
    } else {
      this.markFormGroupTouched();
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.seatTypeForm.get(fieldName);
    
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
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
      name: 'Name',
      description: 'Description',
      priceMultiplier: 'Price Multiplier'
    };
    return labels[fieldName] || fieldName;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.seatTypeForm.controls).forEach(key => {
      const control = this.seatTypeForm.get(key);
      control?.markAsTouched();
    });
  }

  getExamplePrice(basePrice: number = 100): number {
    const multiplier = this.seatTypeForm.get('priceMultiplier')?.value || 1;
    return basePrice * multiplier;
  }
}