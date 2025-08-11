import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { Client } from '../../../../core/models/client.model';
import { ClientService } from '../../services/client.service';

@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.scss']
})
export class ClientFormComponent implements OnInit, OnDestroy {
  clientForm: FormGroup;
  loading = false;
  isEditMode = false;
  clientId: number | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.clientForm = this.createForm();
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
      clientId: ['', [Validators.required, Validators.pattern(/^[A-Z0-9-]+$/)]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      contactDetails: ['', [Validators.required]],
      company: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      notes: ['']
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.clientId = +id;
      this.loadClient(this.clientId);
    }
  }

  private loadClient(id: number): void {
    this.loading = true;
    this.clientService.getClient(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (client) => {
          this.clientForm.patchValue(client);
        },
        error: (error) => {
          console.error('Error loading client:', error);
          this.snackBar.open('Error loading client', 'Close', { duration: 5000 });
          this.router.navigate(['/clients']);
        }
      });
  }

  onSubmit(): void {
    if (this.clientForm.valid && !this.loading) {
      this.loading = true;
      
      const formValue = this.clientForm.value;
      
      if (this.isEditMode && this.clientId) {
        this.updateClient(formValue);
      } else {
        this.createClient(formValue);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private createClient(clientData: any): void {
    this.clientService.createClient(clientData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Client created successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/clients']);
        },
        error: (error) => {
          console.error('Error creating client:', error);
          this.snackBar.open('Error creating client', 'Close', { duration: 5000 });
        }
      });
  }

  private updateClient(clientData: any): void {
    const updatedClient: Client = {
      ...clientData,
      id: this.clientId!
    };

    this.clientService.updateClient(updatedClient)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Client updated successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/clients']);
        },
        error: (error) => {
          console.error('Error updating client:', error);
          this.snackBar.open('Error updating client', 'Close', { duration: 5000 });
        }
      });
  }

  onCancel(): void {
    this.router.navigate(['/clients']);
  }

  getFieldError(fieldName: string): string {
    const field = this.clientForm.get(fieldName);
    
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['pattern']) {
        return `${this.getFieldLabel(fieldName)} format is invalid`;
      }
    }
    
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      clientId: 'Client ID',
      name: 'Name',
      contactDetails: 'Contact Details',
      company: 'Company',
      email: 'Email',
      notes: 'Notes'
    };
    return labels[fieldName] || fieldName;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.clientForm.controls).forEach(key => {
      const control = this.clientForm.get(key);
      control?.markAsTouched();
    });
  }
}