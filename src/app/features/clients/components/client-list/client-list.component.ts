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

import { Client, ClientFilters } from '../../../../core/models/client.model';
import { ClientService } from '../../services/client.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss']
})
export class ClientListComponent implements OnInit, OnDestroy {
  @Input() clients: Client[] | null = [];
  
  displayedColumns: string[] = ['clientId', 'name', 'email', 'company', 'contactDetails', 'actions'];
  dataSource = new MatTableDataSource<Client>();
  filterForm: FormGroup;
  loading = false;
  
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private clientService: ClientService,
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
      company: ['']
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
    if (this.clients) {
      this.dataSource.data = this.clients;
      this.applyFilters();
    }
  }

  private applyFilters(): void {
    if (!this.clients) return;

    const filters: ClientFilters = this.filterForm.value;
    const filteredClients = this.clientService.filterClients(this.clients, filters);
    this.dataSource.data = filteredClients;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearFilters(): void {
    this.filterForm.reset();
  }

  onView(client: Client): void {
    this.router.navigate(['/clients', client.id]);
  }

  onEdit(client: Client): void {
    this.router.navigate(['/clients/edit', client.id]);
  }

  onDelete(client: Client): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Client',
        message: `Are you sure you want to delete client ${client.name}? This action cannot be undone.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteClient(client);
      }
    });
  }

  private deleteClient(client: Client): void {
    this.loading = true;
    this.clientService.deleteClient(client.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Client deleted successfully', 'Close', { duration: 3000 });
          this.loading = false;
        },
        error: (error) => {
          console.error('Error deleting client:', error);
          this.snackBar.open('Error deleting client', 'Close', { duration: 5000 });
          this.loading = false;
        }
      });
  }

  getUniqueCompanies(): string[] {
    if (!this.clients) return [];
    const companies = this.clients.map(client => client.company);
    return [...new Set(companies)].filter(company => company).sort();
  }
}