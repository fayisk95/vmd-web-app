import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppSettings } from '../../core/models/settings.model';
import { SettingsService } from './services/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  settings: AppSettings | null = null;
  loading = true;
  selectedTab = 0;
  
  private destroy$ = new Subject<void>();

  constructor(
    private settingsService: SettingsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadSettings(): void {
    this.loading = true;
    this.settingsService.getSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (settings) => {
          this.settings = settings;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading settings:', error);
          this.snackBar.open('Error loading settings', 'Close', { duration: 5000 });
          this.loading = false;
        }
      });
  }

  onTabChange(index: number): void {
    this.selectedTab = index;
  }

  onSettingsUpdated(): void {
    this.snackBar.open('Settings updated successfully', 'Close', { duration: 3000 });
    this.loadSettings(); // Refresh settings
  }
}