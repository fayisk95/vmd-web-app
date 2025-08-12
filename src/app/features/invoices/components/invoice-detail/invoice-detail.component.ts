import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { Invoice, PaymentStatus } from '../../../../core/models/invoice.model';
import { InvoiceService } from '../../services/invoice.service';
import { EmailInvoiceDialogComponent } from '../email-invoice-dialog/email-invoice-dialog.component';

@Component({
  selector: 'app-invoice-detail',
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.scss']
})
export class InvoiceDetailComponent implements OnInit, OnDestroy {
  PaymentStatus = PaymentStatus
  invoice: Invoice | null = null;
  loading = true;
  actionLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadInvoice(+id);
    } else {
      this.router.navigate(['/invoices']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadInvoice(id: number): void {
    this.loading = true;
    this.invoiceService.getInvoice(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (invoice) => {
          this.invoice = invoice;
        },
        error: (error) => {
          console.error('Error loading invoice:', error);
          this.snackBar.open('Error loading invoice', 'Close', { duration: 5000 });
          this.router.navigate(['/invoices']);
        }
      });
  }

  onEdit(): void {
    if (this.invoice) {
      this.router.navigate(['/invoices/edit', this.invoice.id]);
    }
  }

  onBack(): void {
    this.router.navigate(['/invoices']);
  }

  onDownloadPDF(): void {
    if (!this.invoice) return;

    this.actionLoading = true;
    this.invoiceService.downloadPDF(this.invoice.id, this.invoice.invoiceNumber)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.actionLoading = false)
      )
      .subscribe({
        next: () => {
          this.snackBar.open('PDF downloaded successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error downloading PDF:', error);
          this.snackBar.open('Error downloading PDF', 'Close', { duration: 5000 });
        }
      });
  }

  onSendEmail(): void {
    if (!this.invoice) return;

    const dialogRef = this.dialog.open(EmailInvoiceDialogComponent, {
      width: '500px',
      data: {
        invoice: this.invoice,
        defaultEmail: this.invoice.clientEmail
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.invoice) {
        this.sendInvoiceEmail(result);
      }
    });
  }

  onUpdatePaymentStatus(status: PaymentStatus): void {
    if (!this.invoice) return;

    this.actionLoading = true;
    this.invoiceService.updatePaymentStatus(this.invoice.id, status)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.actionLoading = false)
      )
      .subscribe({
        next: (updatedInvoice) => {
          this.invoice = updatedInvoice;
          this.snackBar.open('Payment status updated successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error updating payment status:', error);
          this.snackBar.open('Error updating payment status', 'Close', { duration: 5000 });
        }
      });
  }

  private sendInvoiceEmail(emailData: any): void {
    if (!this.invoice) return;

    this.actionLoading = true;
    this.invoiceService.sendInvoiceEmail({
      invoiceId: this.invoice.id,
      recipientEmail: emailData.email,
      subject: emailData.subject,
      message: emailData.message
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.actionLoading = false)
      )
      .subscribe({
        next: (response) => {
          this.snackBar.open(response.message, 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error sending email:', error);
          this.snackBar.open('Error sending email', 'Close', { duration: 5000 });
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

  isOverdue(): boolean {
    if (!this.invoice || this.invoice.paymentStatus === PaymentStatus.PAID) return false;
    return new Date(this.invoice.dueDate) < new Date();
  }

  getDaysOverdue(): number {
    if (!this.invoice || !this.isOverdue()) return 0;
    const today = new Date();
    const dueDate = new Date(this.invoice.dueDate);
    const diffTime = today.getTime() - dueDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
