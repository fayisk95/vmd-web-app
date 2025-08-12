import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize, startWith } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AppSettings, Currency, AVAILABLE_CURRENCIES } from '../../../../core/models/settings.model';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-general-settings',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.scss']
})
export class GeneralSettingsComponent implements OnInit, OnDestroy {
  @Input() settings!: AppSettings;
  @Output() settingsUpdated = new EventEmitter<void>();

  generalForm: FormGroup;
  loading = false;
  availableCurrencies = AVAILABLE_CURRENCIES;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private snackBar: MatSnackBar
  ) {
    this.generalForm = this.createForm();
  }

  ngOnInit(): void {
    this.initializeForm();
    this.setupCurrencyPreview();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      currency: ['', Validators.required],
      defaultTaxRate: ['', [
        Validators.required,
        Validators.min(0),
        Validators.max(100),
        Validators.pattern(/^\d+(\.\d{1,2})?$/)
      ]]
    });
  }

  private initializeForm(): void {
    if (this.settings) {
      this.generalForm.patchValue({
        currency: this.settings.currency.code,
        defaultTaxRate: this.settings.defaultTaxRate
      });
    }
  }

  private setupCurrencyPreview(): void {
    this.generalForm.get('currency')?.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        startWith(this.generalForm.get('currency')?.value)
      )
      .subscribe(() => {
        // Trigger change detection for currency preview
      });
  }

  onSubmit(): void {
    if (this.generalForm.valid && !this.loading) {
      this.loading = true;

      const formValue = this.generalForm.value;
      const selectedCurrency = this.availableCurrencies.find(c => c.code === formValue.currency);

      if (!selectedCurrency) {
        this.snackBar.open('Invalid currency selected', 'Close', { duration: 3000 });
        this.loading = false;
        return;
      }

      const updates = {
        currency: selectedCurrency,
        defaultTaxRate: parseFloat(formValue.defaultTaxRate)
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
            console.error('Error updating settings:', error);
            this.snackBar.open('Error updating settings', 'Close', { duration: 5000 });
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
    const field = this.generalForm.get(fieldName);

    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['min']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `${this.getFieldLabel(fieldName)} must be at most ${field.errors['max'].max}`;
      }
      if (field.errors['pattern']) {
        return `${this.getFieldLabel(fieldName)} format is invalid`;
      }
    }

    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      currency: 'Currency',
      defaultTaxRate: 'Default Tax Rate'
    };
    return labels[fieldName] || fieldName;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.generalForm.controls).forEach(key => {
      const control = this.generalForm.get(key);
      control?.markAsTouched();
    });
  }

  displayCurrency(currencyCode: string): string {
    const currency = this.availableCurrencies.find(c => c.code === currencyCode);
    return currency ? `${currency.symbol} ${currency.name} (${currency.code})` : currencyCode;
  }

  get selectedCurrencySymbol(): string {
    const code = this.generalForm.get('currency')?.value;
    return this.availableCurrencies.find(c => c.code === code)?.symbol ?? '';
  }
}
