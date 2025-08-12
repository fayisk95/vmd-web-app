import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SettingsRoutingModule } from './settings-routing.module';
import { SharedModule } from '../../shared/shared.module';

import { SettingsComponent } from './settings.component';
import { GeneralSettingsComponent } from './components/general-settings/general-settings.component';
import { CategoriesSettingsComponent } from './components/categories-settings/categories-settings.component';
import { SeatTypesSettingsComponent } from './components/seat-types-settings/seat-types-settings.component';
import { BusinessInfoSettingsComponent } from './components/business-info-settings/business-info-settings.component';
import { CategoryFormDialogComponent } from './components/category-form-dialog/category-form-dialog.component';
import { SeatTypeFormDialogComponent } from './components/seat-type-form-dialog/seat-type-form-dialog.component';

@NgModule({
  declarations: [
    SettingsComponent,
    GeneralSettingsComponent,
    CategoriesSettingsComponent,
    SeatTypesSettingsComponent,
    BusinessInfoSettingsComponent,
    CategoryFormDialogComponent,
    SeatTypeFormDialogComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SettingsRoutingModule,
    SharedModule
  ]
})
export class SettingsModule { }