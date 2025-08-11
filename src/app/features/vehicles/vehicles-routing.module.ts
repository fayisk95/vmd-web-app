import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VehiclesComponent } from './vehicles.component';
import { VehicleFormComponent } from './components/vehicle-form/vehicle-form.component';
import { VehicleDetailComponent } from './components/vehicle-detail/vehicle-detail.component';

const routes: Routes = [
  {
    path: '',
    component: VehiclesComponent
  },
  {
    path: 'new',
    component: VehicleFormComponent
  },
  {
    path: 'edit/:id',
    component: VehicleFormComponent
  },
  {
    path: ':id',
    component: VehicleDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehiclesRoutingModule { }