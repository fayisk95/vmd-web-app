import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, forkJoin } from 'rxjs';
import { map, tap, delay, switchMap } from 'rxjs/operators';
import { Invoice, InvoiceFilters, InvoiceCreateRequest, EmailInvoiceRequest, InvoiceItem, PaymentStatus } from '../../../core/models/invoice.model';
import { Trip } from '../../../core/models/trip.model';
import { Client } from '../../../core/models/client.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private readonly apiUrl = 'api/invoices';
  private invoicesSubject = new BehaviorSubject<Invoice[]>([]);
  public invoices$ = this.invoicesSubject.asObservable();

  constructor(private http: HttpClient) {}

  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.apiUrl).pipe(
      tap(invoices => this.invoicesSubject.next(invoices))
    );
  }

  getInvoice(id: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`);
  }

  createInvoice(request: InvoiceCreateRequest): Observable<Invoice> {
    return this.fetchTripDetails(request.tripIds).pipe(
      switchMap(trips => {
        const client = this.getClientFromTrips(trips);
        const invoiceItems = this.createInvoiceItems(trips);
        
        const subtotal = invoiceItems.reduce((sum, item) => sum + item.amount, 0);
        const taxAmount = subtotal * (request.taxRate / 100);
        const totalAmount = subtotal + taxAmount;

        const newInvoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'> = {
          invoiceNumber: this.generateInvoiceNumber(),
          tripIds: request.tripIds,
          clientId: request.clientId,
          clientName: client.name,
          clientEmail: client.email,
          issueDate: new Date(),
          dueDate: request.dueDate,
          subtotal,
          taxRate: request.taxRate,
          taxAmount,
          totalAmount,
          paymentStatus: PaymentStatus.PENDING,
          notes: request.notes,
        };

        return this.http.post<Invoice>(this.apiUrl, {
          ...newInvoice,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }),
      tap(() => this.refreshInvoices())
    );
  }

  updateInvoice(invoice: Invoice): Observable<Invoice> {
    const updatedInvoice = {
      ...invoice,
      updatedAt: new Date()
    };
    return this.http.put<Invoice>(`${this.apiUrl}/${invoice.id}`, updatedInvoice).pipe(
      tap(() => this.refreshInvoices())
    );
  }

  deleteInvoice(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.refreshInvoices())
    );
  }

  updatePaymentStatus(invoiceId: number, status: PaymentStatus): Observable<Invoice> {
    return this.getInvoice(invoiceId).pipe(
      switchMap(invoice => {
        const updatedInvoice = {
          ...invoice,
          paymentStatus: status,
          paymentDate: status === PaymentStatus.PAID ? new Date() : undefined,
          updatedAt: new Date()
        };
        return this.updateInvoice(updatedInvoice);
      })
    );
  }

  generatePDF(invoiceId: number): Observable<Blob> {
    // Simulate PDF generation with delay
    return of(null).pipe(
      delay(2000),
      map(() => {
        // Create a mock PDF blob
        const pdfContent = `Mock PDF content for invoice ${invoiceId}`;
        return new Blob([pdfContent], { type: 'application/pdf' });
      })
    );
  }

  downloadPDF(invoiceId: number, invoiceNumber: string): Observable<void> {
    return this.generatePDF(invoiceId).pipe(
      map(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-${invoiceNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
    );
  }

  sendInvoiceEmail(request: EmailInvoiceRequest): Observable<{ success: boolean; message: string }> {
    // Simulate email sending with delay
    return of(null).pipe(
      delay(1500),
      map(() => ({
        success: true,
        message: 'Invoice email sent successfully!'
      }))
    );
  }

  filterInvoices(invoices: Invoice[], filters: InvoiceFilters): Invoice[] {
    return invoices.filter(invoice => {
      if (filters.clientId && invoice.clientId !== filters.clientId) {
        return false;
      }
      if (filters.paymentStatus && invoice.paymentStatus !== filters.paymentStatus) {
        return false;
      }
      if (filters.dateFrom) {
        const invoiceDate = new Date(invoice.issueDate);
        const filterDate = new Date(filters.dateFrom);
        if (invoiceDate < filterDate) {
          return false;
        }
      }
      if (filters.dateTo) {
        const invoiceDate = new Date(invoice.issueDate);
        const filterDate = new Date(filters.dateTo);
        if (invoiceDate > filterDate) {
          return false;
        }
      }
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        return (
          invoice.invoiceNumber.toLowerCase().includes(searchTerm) ||
          invoice.clientName.toLowerCase().includes(searchTerm) ||
          invoice.clientEmail.toLowerCase().includes(searchTerm) ||
          invoice.tripIds.some(tripId => tripId.toLowerCase().includes(searchTerm))
        );
      }
      return true;
    });
  }

  private fetchTripDetails(tripIds: string[]): Observable<Trip[]> {
    const tripRequests = tripIds.map(tripId => 
      this.http.get<Trip[]>('api/trips').pipe(
        map(trips => trips.find(trip => trip.tripId === tripId))
      )
    );
    
    return forkJoin(tripRequests).pipe(
      map(trips => trips.filter(trip => trip !== undefined) as Trip[])
    );
  }

  private getClientFromTrips(trips: Trip[]): Client {
    // Mock client data - in real app, this would fetch from client service
    return {
      id: 1,
      clientId: trips[0]?.clientId || 'CLI-001',
      name: 'John Smith',
      email: 'john.smith@example.com',
      company: 'Tech Solutions Inc.',
      contactDetails: '+1 (555) 123-4567',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private createInvoiceItems(trips: Trip[]): InvoiceItem[] {
    return trips.map(trip => ({
      tripId: trip.tripId,
      description: `Transportation Service - ${trip.vehicleId}`,
      pickupLocation: trip.pickupLocation,
      dropLocation: trip.dropLocation,
      pickupDateTime: trip.pickupDateTime,
      dropDateTime: trip.dropDateTime,
      amount: trip.price
    }));
  }

  private generateInvoiceNumber(): string {
    const timestamp = Date.now().toString().slice(-6);
    return `INV-${timestamp}`;
  }

  private refreshInvoices(): void {
    this.getInvoices().subscribe();
  }
}