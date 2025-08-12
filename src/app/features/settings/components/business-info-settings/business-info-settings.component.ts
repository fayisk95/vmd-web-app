import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

import { BusinessInfo } from '../../../../core/models/settings.model';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-business-info-settings',
  templateUrl: './business-info-settings.component.html',
  styleUrls: ['./business-info-settings.component.scss']
})
export class BusinessInfoSettingsComponent implements OnInit, OnDestroy {
  @Input() businessInfo!: BusinessInfo;
  @Output() settingsUpdated = new EventEmitter<void>();

  businessForm: FormGroup;
  loading = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private snackBar: MatSnackBar
  ) {
    this.businessForm = this.createForm();
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      companyName: ['', [Validators.required, Validators.minLength(2)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      phone: ['', [Validators.required, Validators.pattern(/^[\+]?[0-9\s\-\(\)]{10,20}$/)]],
      email: ['', [Validators.required, Validators.email]],
      website: ['', [Validators.pattern(/^https?:\/\/.+\..+/)]],
      taxId: ['']
    });
  }

  private initializeForm(): void {
    if (this.businessInfo) {
      this.businessForm.patchValue(this.businessInfo);
    }
  }

  onSubmit(): void {
    if (this.businessForm.valid && !this.loading) {
      this.loading = true;
      
      const updates = {
        businessInfo: this.businessForm.value
      };

      this.settingsService.updateSettings(updates)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.loading = false)
        )
        .subscribe({
          next: () => {
            this.settingsUpdated.emit();
          },
          error: (error) => {
            console.error('Error updating business info:', error);
            this.snackBar.open('Error updating business information', 'Close', { duration: 5000 });
          }
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  onReset(): void {
    this.initializeForm();
  }

  getFieldError(fieldName: string): string {
    const field = this.businessForm.get(fieldName);
    
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['pattern']) {
        if (fieldName === 'phone') {
          return 'Please enter a valid phone number with country code';
        }
        if (fieldName === 'website') {
          return 'Please enter a valid website URL starting with http:// or https://';
        }
        return `${this.getFieldLabel(fieldName)} format is invalid`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      companyName: 'Company Name',
      address: 'Address',
      phone: 'Phone',
      email: 'Email',
      website: 'Website',
      taxId: 'Tax ID'
    };
    return labels[fieldName] || fieldName;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.businessForm.controls).forEach(key => {
      const control = this.businessForm.get(key);
      control?.markAsTouched();
    });
  }
}