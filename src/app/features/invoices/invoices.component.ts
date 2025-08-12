import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Invoice } from '../../core/models/invoice.model';
import { InvoiceService } from './services/invoice.service';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss']
})
export class InvoicesComponent implements OnInit {
  invoices$: Observable<Invoice[]>;

  constructor(
    private invoiceService: InvoiceService,
    private router: Router
  ) {
    this.invoices$ = this.invoiceService.invoices$;
  }

  ngOnInit(): void {
    this.invoiceService.getInvoices().subscribe();
  }

  onCreateInvoice(): void {
    this.router.navigate(['/invoices/new']);
  }
}