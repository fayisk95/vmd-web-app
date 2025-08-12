import { Component, Input } from '@angular/core';
import { Invoice } from '../../../../core/models/invoice.model';

@Component({
  selector: 'app-invoice-preview',
  templateUrl: './invoice-preview.component.html',
  styleUrls: ['./invoice-preview.component.scss']
})
export class InvoicePreviewComponent {
  @Input() invoice: Invoice | null = null;

  getCurrentDate(): Date {
    return new Date();
  }
}