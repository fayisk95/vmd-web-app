import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { SharedModule } from '../../shared/shared.module';
import { DashboardService } from './services/dashboard.service';
import { DashboardStatsComponent } from './components/dashboard-stats/dashboard-stats.component';
import { DashboardChartsComponent } from './components/dashboard-charts/dashboard-charts.component';
import { VehicleAvailabilityCalendarComponent } from './components/vehicle-availability-calendar/vehicle-availability-calendar.component';

@NgModule({
  declarations: [
    DashboardComponent,
    DashboardStatsComponent,
    DashboardChartsComponent,
    VehicleAvailabilityCalendarComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DashboardRoutingModule,
    SharedModule
  ],
  providers: [
    DashboardService
  ]
})
export class DashboardModule { }