import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { TripsRoutingModule } from './trips-routing.module';
import { SharedModule } from '../../shared/shared.module';

import { TripsComponent } from './trips.component';
import { TripFormComponent } from './components/trip-form/trip-form.component';
import { TripListComponent } from './components/trip-list/trip-list.component';
import { TripDetailComponent } from './components/trip-detail/trip-detail.component';
import { AvailabilityCheckComponent } from './components/availability-check/availability-check.component';

@NgModule({
  declarations: [
    TripsComponent,
    TripFormComponent,
    TripListComponent,
    TripDetailComponent,
    AvailabilityCheckComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TripsRoutingModule,
    SharedModule
  ]
})
export class TripsModule { }