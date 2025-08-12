import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ReportsRoutingModule } from './reports-routing.module';
import { SharedModule } from '../../shared/shared.module';

import { ReportsComponent } from './reports.component';
import { MonthlyRevenueReportComponent } from './components/monthly-revenue-report/monthly-revenue-report.component';
import { TripCountReportComponent } from './components/trip-count-report/trip-count-report.component';
import { VehicleUtilizationReportComponent } from './components/vehicle-utilization-report/vehicle-utilization-report.component';
import { ReportFiltersComponent } from './components/report-filters/report-filters.component';
import { ReportExportComponent } from './components/report-export/report-export.component';

@NgModule({
  declarations: [
    ReportsComponent,
    MonthlyRevenueReportComponent,
    TripCountReportComponent,
    VehicleUtilizationReportComponent,
    ReportFiltersComponent,
    ReportExportComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ReportsRoutingModule,
    SharedModule
  ]
})
export class ReportsModule { }