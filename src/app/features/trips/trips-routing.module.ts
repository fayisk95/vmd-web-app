import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TripsComponent } from './trips.component';
import { TripFormComponent } from './components/trip-form/trip-form.component';
import { TripDetailComponent } from './components/trip-detail/trip-detail.component';

const routes: Routes = [
  {
    path: '',
    component: TripsComponent
  },
  {
    path: 'new',
    component: TripFormComponent
  },
  {
    path: 'edit/:id',
    component: TripFormComponent
  },
  {
    path: ':id',
    component: TripDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TripsRoutingModule { }