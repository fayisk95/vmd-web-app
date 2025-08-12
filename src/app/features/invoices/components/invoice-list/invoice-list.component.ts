import { Component, Input, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { Invoice, PaymentStatus, InvoiceFilters } from '../../../../core/models/invoice.model';
import { InvoiceService } from '../../services/invoice.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmailInvoiceDialogComponent } from '../email-invoice-dialog/email-invoice-dialog.component';

@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.scss']
})
export class InvoiceListComponent implements OnInit, OnDestroy {
  @Input() invoices: Invoice[] | null = [];
  PaymentStatus = PaymentStatus;

  displayedColumns: string[] = ['invoiceNumber', 'clientName', 'issueDate', 'dueDate', 'totalAmount', 'paymentStatus', 'actions'];
  dataSource = new MatTableDataSource<Invoice>();
  filterForm: FormGroup;
  loading = false;

  paymentStatuses = Object.values(PaymentStatus);

  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private invoiceService: InvoiceService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.filterForm = this.createFilterForm();
  }

  ngOnInit(): void {
    this.setupFilters();
    this.updateDataSource();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnChanges(): void {
    this.updateDataSource();
  }

  private createFilterForm(): FormGroup {
    return this.fb.group({
      searchTerm: [''],
      paymentStatus: [''],
      dateFrom: [''],
      dateTo: ['']
    });
  }

  private setupFilters(): void {
    this.filterForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.applyFilters();
      });
  }

  private updateDataSource(): void {
    if (this.invoices) {
      this.dataSource.data = this.invoices;
      this.applyFilters();
    }
  }

  private applyFilters(): void {
    if (!this.invoices) return;

    const filters: InvoiceFilters = this.filterForm.value;
    const filteredInvoices = this.invoiceService.filterInvoices(this.invoices, filters);
    this.dataSource.data = filteredInvoices;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearFilters(): void {
    this.filterForm.reset();
  }

  onView(invoice: Invoice): void {
    this.router.navigate(['/invoices', invoice.id]);
  }

  onEdit(invoice: Invoice): void {
    this.router.navigate(['/invoices/edit', invoice.id]);
  }

  onDelete(invoice: Invoice): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Invoice',
        message: `Are you sure you want to delete invoice ${invoice.invoiceNumber}? This action cannot be undone.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteInvoice(invoice);
      }
    });
  }

  onDownloadPDF(invoice: Invoice): void {
    this.loading = true;
    this.invoiceService.downloadPDF(invoice.id, invoice.invoiceNumber)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('PDF downloaded successfully', 'Close', { duration: 3000 });
          this.loading = false;
        },
        error: (error) => {
          console.error('Error downloading PDF:', error);
          this.snackBar.open('Error downloading PDF', 'Close', { duration: 5000 });
          this.loading = false;
        }
      });
  }

  onSendEmail(invoice: Invoice): void {
    const dialogRef = this.dialog.open(EmailInvoiceDialogComponent, {
      width: '500px',
      data: {
        invoice: invoice,
        defaultEmail: invoice.clientEmail
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.sendInvoiceEmail(invoice, result);
      }
    });
  }

  onUpdatePaymentStatus(invoice: Invoice, status: PaymentStatus): void {
    this.loading = true;
    this.invoiceService.updatePaymentStatus(invoice.id, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Payment status updated successfully', 'Close', { duration: 3000 });
          this.loading = false;
        },
        error: (error) => {
          console.error('Error updating payment status:', error);
          this.snackBar.open('Error updating payment status', 'Close', { duration: 5000 });
          this.loading = false;
        }
      });
  }

  private deleteInvoice(invoice: Invoice): void {
    this.loading = true;
    this.invoiceService.deleteInvoice(invoice.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Invoice deleted successfully', 'Close', { duration: 3000 });
          this.loading = false;
        },
        error: (error) => {
          console.error('Error deleting invoice:', error);
          this.snackBar.open('Error deleting invoice', 'Close', { duration: 5000 });
          this.loading = false;
        }
      });
  }

  private sendInvoiceEmail(invoice: Invoice, emailData: any): void {
    this.loading = true;
    this.invoiceService.sendInvoiceEmail({
      invoiceId: invoice.id,
      recipientEmail: emailData.email,
      subject: emailData.subject,
      message: emailData.message
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.snackBar.open(response.message, 'Close', { duration: 3000 });
          this.loading = false;
        },
        error: (error) => {
          console.error('Error sending email:', error);
          this.snackBar.open('Error sending email', 'Close', { duration: 5000 });
          this.loading = false;
        }
      });
  }

  getStatusColor(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.PENDING:
        return '#ff9800';
      case PaymentStatus.PAID:
        return '#4caf50';
      case PaymentStatus.OVERDUE:
        return '#f44336';
      case PaymentStatus.CANCELLED:
        return '#9e9e9e';
      default:
        return '#666';
    }
  }

  isOverdue(invoice: Invoice): boolean {
    if (invoice.paymentStatus === PaymentStatus.PAID) return false;
    return new Date(invoice.dueDate) < new Date();
  }
}
