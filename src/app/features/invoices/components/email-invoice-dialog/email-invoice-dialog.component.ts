import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Invoice } from '../../../../core/models/invoice.model';

export interface EmailInvoiceDialogData {
  invoice: Invoice;
  defaultEmail: string;
}

@Component({
  selector: 'app-email-invoice-dialog',
  templateUrl: './email-invoice-dialog.component.html',
  styleUrls: ['./email-invoice-dialog.component.scss']
})
export class EmailInvoiceDialogComponent {
  emailForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EmailInvoiceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EmailInvoiceDialogData
  ) {
    this.emailForm = this.createForm();
  }

  private createForm(): FormGroup {
    const defaultSubject = `Invoice ${this.data.invoice.invoiceNumber} - ${this.data.invoice.clientName}`;
    const defaultMessage = `Dear ${this.data.invoice.clientName},

Please find attached your invoice ${this.data.invoice.invoiceNumber} for the amount of ${this.data.invoice.totalAmount}.

Invoice Details:
- Invoice Number: ${this.data.invoice.invoiceNumber}
- Issue Date: ${new Date(this.data.invoice.issueDate).toLocaleDateString()}
- Due Date: ${new Date(this.data.invoice.dueDate).toLocaleDateString()}
- Total Amount: $${this.data.invoice.totalAmount.toFixed(2)}

Thank you for your business!

Best regards,
VMD System`;

    return this.fb.group({
      email: [this.data.defaultEmail, [Validators.required, Validators.email]],
      subject: [defaultSubject, Validators.required],
      message: [defaultMessage, Validators.required]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSend(): void {
    if (this.emailForm.valid) {
      this.dialogRef.close(this.emailForm.value);
    } else {
      this.markFormGroupTouched();
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.emailForm.get(fieldName);
    
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
    }
    
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      email: 'Email',
      subject: 'Subject',
      message: 'Message'
    };
    return labels[fieldName] || fieldName;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.emailForm.controls).forEach(key => {
      const control = this.emailForm.get(key);
      control?.markAsTouched();
    });
  }
}