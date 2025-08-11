import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

// CDK Modules
import { LayoutModule } from '@angular/cdk/layout';

// Custom Components
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { UserMenuComponent } from './components/user-menu/user-menu.component';

// Custom Directives
import { HighlightDirective } from './directives/highlight.directive';

// Custom Pipes
import { TruncatePipe } from './pipes/truncate.pipe';
import { CurrencyFormatPipe } from './pipes/currency-format.pipe';

const MATERIAL_MODULES = [
  MatToolbarModule,
  MatButtonModule,
  MatSidenavModule,
  MatIconModule,
  MatListModule,
  MatCardModule,
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatDialogModule,
  MatSnackBarModule,
  MatProgressSpinnerModule,
  MatChipsModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatCheckboxModule,
  MatMenuModule,
  MatDividerModule,
  LayoutModule
];

const COMPONENTS = [
  LoadingSpinnerComponent,
  ConfirmDialogComponent,
  UserMenuComponent
];

const DIRECTIVES = [
  HighlightDirective
];

const PIPES = [
  TruncatePipe,
  CurrencyFormatPipe
];

@NgModule({
  declarations: [
    ...COMPONENTS,
    ...DIRECTIVES,
    ...PIPES
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ...MATERIAL_MODULES
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ...MATERIAL_MODULES,
    ...COMPONENTS,
    ...DIRECTIVES,
    ...PIPES
  ]
})
export class SharedModule { }