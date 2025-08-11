import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientsComponent } from './clients.component';
import { ClientFormComponent } from './components/client-form/client-form.component';
import { ClientDetailComponent } from './components/client-detail/client-detail.component';

const routes: Routes = [
  {
    path: '',
    component: ClientsComponent
  },
  {
    path: 'new',
    component: ClientFormComponent
  },
  {
    path: 'edit/:id',
    component: ClientFormComponent
  },
  {
    path: ':id',
    component: ClientDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientsRoutingModule { }