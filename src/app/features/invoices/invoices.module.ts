import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { InvoicesRoutingModule } from './invoices-routing.module';
import { SharedModule } from '../../shared/shared.module';

import { InvoicesComponent } from './invoices.component';
import { InvoiceFormComponent } from './components/invoice-form/invoice-form.component';
import { InvoiceListComponent } from './components/invoice-list/invoice-list.component';
import { InvoiceDetailComponent } from './components/invoice-detail/invoice-detail.component';
import { InvoicePreviewComponent } from './components/invoice-preview/invoice-preview.component';
import { EmailInvoiceDialogComponent } from './components/email-invoice-dialog/email-invoice-dialog.component';

@NgModule({
  declarations: [
    InvoicesComponent,
    InvoiceFormComponent,
    InvoiceListComponent,
    InvoiceDetailComponent,
    InvoicePreviewComponent,
    EmailInvoiceDialogComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InvoicesRoutingModule,
    SharedModule
  ]
})
export class InvoicesModule { }