import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { VehicleCategory } from '../../../../core/models/settings.model';
import { SettingsService } from '../../services/settings.service';
import { CategoryFormDialogComponent } from '../category-form-dialog/category-form-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-categories-settings',
  templateUrl: './categories-settings.component.html',
  styleUrls: ['./categories-settings.component.scss']
})
export class CategoriesSettingsComponent implements OnDestroy {
  @Input() categories: VehicleCategory[] = [];
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

  onAddCategory(): void {
    const dialogRef = this.dialog.open(CategoryFormDialogComponent, {
      width: '500px',
      data: { category: null, isEditMode: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createCategory(result);
      }
    });
  }

  onEditCategory(category: VehicleCategory): void {
    const dialogRef = this.dialog.open(CategoryFormDialogComponent, {
      width: '500px',
      data: { category: { ...category }, isEditMode: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateCategory(result);
      }
    });
  }

  onDeleteCategory(category: VehicleCategory): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Category',
        message: `Are you sure you want to delete the category "${category.name}"? This action cannot be undone.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteCategory(category);
      }
    });
  }

  onToggleActive(category: VehicleCategory): void {
    const updatedCategory = {
      ...category,
      isActive: !category.isActive
    };
    this.updateCategory(updatedCategory);
  }

  private createCategory(categoryData: Omit<VehicleCategory, 'id'>): void {
    this.loading = true;
    this.settingsService.addCategory(categoryData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Category created successfully', 'Close', { duration: 3000 });
          this.settingsUpdated.emit();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error creating category:', error);
          this.snackBar.open('Error creating category', 'Close', { duration: 5000 });
          this.loading = false;
        }
      });
  }

  private updateCategory(category: VehicleCategory): void {
    this.loading = true;
    this.settingsService.updateCategory(category)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Category updated successfully', 'Close', { duration: 3000 });
          this.settingsUpdated.emit();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error updating category:', error);
          this.snackBar.open('Error updating category', 'Close', { duration: 5000 });
          this.loading = false;
        }
      });
  }

  private deleteCategory(category: VehicleCategory): void {
    this.loading = true;
    this.settingsService.deleteCategory(category.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Category deleted successfully', 'Close', { duration: 3000 });
          this.settingsUpdated.emit();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error deleting category:', error);
          this.snackBar.open('Error deleting category', 'Close', { duration: 5000 });
          this.loading = false;
        }
      });
  }

  getActiveCategories(): VehicleCategory[] {
    return this.categories.filter(c => c.isActive);
  }

  getInactiveCategories(): VehicleCategory[] {
    return this.categories.filter(c => !c.isActive);
  }
}