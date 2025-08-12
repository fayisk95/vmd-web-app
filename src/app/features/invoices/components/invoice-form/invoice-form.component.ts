import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, Observable } from 'rxjs';
import { takeUntil, finalize, startWith, map } from 'rxjs/operators';

import { Invoice, InvoiceCreateRequest } from '../../../../core/models/invoice.model';
import { Trip, TripStatus } from '../../../../core/models/trip.model';
import { Client } from '../../../../core/models/client.model';
import { InvoiceService } from '../../services/invoice.service';
import { TripService } from '../../../trips/services/trip.service';
import { ClientService } from '../../../clients/services/client.service';

@Component({
  selector: 'app-invoice-form',
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.scss']
})
export class InvoiceFormComponent implements OnInit, OnDestroy {
  invoiceForm: FormGroup;
  loading = false;
  isEditMode = false;
  invoiceId: number | null = null;
  
  trips: Trip[] = [];
  clients: Client[] = [];
  selectedTrips: Trip[] = [];
  
  filteredTrips$!: Observable<Trip[]>;
  filteredClients$!: Observable<Client[]>;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoiceService,
    private tripService: TripService,
    private clientService: ClientService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.invoiceForm = this.createForm();
    this.setupFilteredOptions();
  }

  ngOnInit(): void {
    this.loadData();
    this.checkEditMode();
    this.setupFormSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 30); // 30 days from now

    return this.fb.group({
      tripIds: [[], Validators.required],
      clientId: ['', Validators.required],
      dueDate: [defaultDueDate, Validators.required],
      taxRate: [10, [Validators.required, Validators.min(0), Validators.max(100)]],
      notes: ['']
    });
  }

  private setupFilteredOptions(): void {
    this.filteredTrips$ = this.invoiceForm.get('tripIds')!.valueChanges.pipe(
      startWith([]),
      map(() => this.getAvailableTrips())
    );

    this.filteredClients$ = this.invoiceForm.get('clientId')!.valueChanges.pipe(
      startWith(''),
      map(value => this.filterClients(value))
    );
  }

  private setupFormSubscriptions(): void {
    // Auto-select client when trips are selected
    this.invoiceForm.get('tripIds')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(tripIds => {
        this.updateSelectedTrips(tripIds);
        this.autoSelectClient(tripIds);
      });
  }

  private loadData(): void {
    // Load trips
    this.tripService.getTrips()
      .pipe(takeUntil(this.destroy$))
      .subscribe(trips => {
        this.trips = trips.filter(trip => 
          trip.status === TripStatus.COMPLETED || trip.status === TripStatus.CONFIRMED
        );
      });

    // Load clients
    this.clientService.getClients()
      .pipe(takeUntil(this.destroy$))
      .subscribe(clients => {
        this.clients = clients;
      });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.invoiceId = +id;
      this.loadInvoice(this.invoiceId);
    }
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
          this.invoiceForm.patchValue({
            tripIds: invoice.tripIds,
            clientId: invoice.clientId,
            dueDate: invoice.dueDate,
            taxRate: invoice.taxRate,
            notes: invoice.notes
          });
        },
        error: (error) => {
          console.error('Error loading invoice:', error);
          this.snackBar.open('Error loading invoice', 'Close', { duration: 5000 });
          this.router.navigate(['/invoices']);
        }
      });
  }

  private getAvailableTrips(): Trip[] {
    const selectedTripIds = this.invoiceForm.get('tripIds')?.value || [];
    return this.trips.filter(trip => 
      selectedTripIds.includes(trip.tripId) || 
      !this.isTripInvoiced(trip.tripId)
    );
  }

  private isTripInvoiced(tripId: string): boolean {
    // In a real app, this would check if the trip is already invoiced
    return false;
  }

  private filterClients(value: string): Client[] {
    if (!value) return this.clients;
    const filterValue = value.toLowerCase();
    return this.clients.filter(client => 
      client.clientId.toLowerCase().includes(filterValue) ||
      client.name.toLowerCase().includes(filterValue) ||
      client.company.toLowerCase().includes(filterValue)
    );
  }

  private updateSelectedTrips(tripIds: string[]): void {
    this.selectedTrips = this.trips.filter(trip => tripIds.includes(trip.tripId));
  }

  private autoSelectClient(tripIds: string[]): void {
    if (tripIds.length > 0) {
      const firstTrip = this.trips.find(trip => trip.tripId === tripIds[0]);
      if (firstTrip && !this.invoiceForm.get('clientId')?.value) {
        this.invoiceForm.patchValue({ clientId: firstTrip.clientId });
      }
    }
  }

  onSubmit(): void {
    if (this.invoiceForm.valid && !this.loading) {
      this.loading = true;
      
      const formValue = this.invoiceForm.value;
      const request: InvoiceCreateRequest = {
        tripIds: formValue.tripIds,
        clientId: formValue.clientId,
        dueDate: new Date(formValue.dueDate),
        taxRate: formValue.taxRate,
        notes: formValue.notes
      };
      
      if (this.isEditMode && this.invoiceId) {
        // For edit mode, you would implement update logic here
        this.snackBar.open('Edit mode not implemented yet', 'Close', { duration: 3000 });
        this.loading = false;
      } else {
        this.createInvoice(request);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private createInvoice(request: InvoiceCreateRequest): void {
    this.invoiceService.createInvoice(request)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (invoice) => {
          this.snackBar.open('Invoice created successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/invoices', invoice.id]);
        },
        error: (error) => {
          console.error('Error creating invoice:', error);
          this.snackBar.open('Error creating invoice', 'Close', { duration: 5000 });
        }
      });
  }

  onCancel(): void {
    this.router.navigate(['/invoices']);
  }

  getSubtotal(): number {
    return this.selectedTrips.reduce((sum, trip) => sum + trip.price, 0);
  }

  getTaxAmount(): number {
    const taxRate = this.invoiceForm.get('taxRate')?.value || 0;
    return this.getSubtotal() * (taxRate / 100);
  }

  getTotal(): number {
    return this.getSubtotal() + this.getTaxAmount();
  }

  getFieldError(fieldName: string): string {
    const field = this.invoiceForm.get(fieldName);
    
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['min']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `${this.getFieldLabel(fieldName)} must be at most ${field.errors['max'].max}`;
      }
    }
    
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      tripIds: 'Trips',
      clientId: 'Client',
      dueDate: 'Due Date',
      taxRate: 'Tax Rate',
      notes: 'Notes'
    };
    return labels[fieldName] || fieldName;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.invoiceForm.controls).forEach(key => {
      const control = this.invoiceForm.get(key);
      control?.markAsTouched();
    });
  }

  displayTrip(trip: Trip): string {
    return trip ? `${trip.tripId} - ${trip.pickupLocation} → ${trip.dropLocation}` : '';
  }

  displayClient(client: Client): string {
    return client ? `${client.clientId} - ${client.name}` : '';
  }
}