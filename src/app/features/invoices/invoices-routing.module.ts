import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvoicesComponent } from './invoices.component';
import { InvoiceFormComponent } from './components/invoice-form/invoice-form.component';
import { InvoiceDetailComponent } from './components/invoice-detail/invoice-detail.component';

const routes: Routes = [
  {
    path: '',
    component: InvoicesComponent
  },
  {
    path: 'new',
    component: InvoiceFormComponent
  },
  {
    path: 'edit/:id',
    component: InvoiceFormComponent
  },
  {
    path: ':id',
    component: InvoiceDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InvoicesRoutingModule { }