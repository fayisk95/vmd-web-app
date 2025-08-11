import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service';
import { UserRole } from '../../../../core/models/user.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  loading = false;
  hidePassword = true;
  
  private destroy$ = new Subject<void>();

  // Demo credentials for easy testing
  demoCredentials = [
    { email: 'admin@example.com', password: 'admin123', role: UserRole.ADMIN },
    { email: 'manager@example.com', password: 'manager123', role: UserRole.MANAGER },
    { email: 'driver@example.com', password: 'driver123', role: UserRole.DRIVER }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.loading) {
      this.loading = true;
      
      const credentials = this.loginForm.value;
      
      this.authService.login(credentials)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.loading = false)
        )
        .subscribe({
          next: (response) => {
            this.snackBar.open(
              `Welcome back, ${response.user.name}!`, 
              'Close', 
              { duration: 3000 }
            );
            
            // Redirect to stored URL or dashboard
            const redirectUrl = localStorage.getItem('redirectUrl') || '/dashboard';
            localStorage.removeItem('redirectUrl');
            this.router.navigate([redirectUrl]);
          },
          error: (error) => {
            this.snackBar.open(
              error.message || 'Login failed. Please try again.', 
              'Close', 
              { duration: 5000 }
            );
          }
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  fillDemoCredentials(credentials: { email: string; password: string; role: UserRole }): void {
    this.loginForm.patchValue({
      email: credentials.email,
      password: credentials.password
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    
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
    }
    
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      email: 'Email',
      password: 'Password'
    };
    return labels[fieldName] || fieldName;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}