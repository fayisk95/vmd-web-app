import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ClientsRoutingModule } from './clients-routing.module';
import { SharedModule } from '../../shared/shared.module';

import { ClientsComponent } from './clients.component';
import { ClientFormComponent } from './components/client-form/client-form.component';
import { ClientListComponent } from './components/client-list/client-list.component';
import { ClientDetailComponent } from './components/client-detail/client-detail.component';

@NgModule({
  declarations: [
    ClientsComponent,
    ClientFormComponent,
    ClientListComponent,
    ClientDetailComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ClientsRoutingModule,
    SharedModule
  ]
})
export class ClientsModule { }