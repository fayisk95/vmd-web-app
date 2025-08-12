export interface Invoice {
  id: number;
  invoiceNumber: string;
  tripIds: string[];
  clientId: string;
  clientName: string;
  clientEmail: string;
  issueDate: Date;
  dueDate: Date;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum PaymentStatus {
  PENDING = 'Pending',
  PAID = 'Paid',
  OVERDUE = 'Overdue',
  CANCELLED = 'Cancelled'
}

export interface InvoiceItem {
  tripId: string;
  description: string;
  pickupLocation: string;
  dropLocation: string;
  pickupDateTime: Date;
  dropDateTime?: Date;
  amount: number;
}

export interface InvoiceFilters {
  searchTerm?: string;
  clientId?: string;
  paymentStatus?: PaymentStatus;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface InvoiceCreateRequest {
  tripIds: string[];
  clientId: string;
  dueDate: Date;
  taxRate: number;
  notes?: string;
}

export interface EmailInvoiceRequest {
  invoiceId: number;
  recipientEmail?: string;
  subject?: string;
  message?: string;
}