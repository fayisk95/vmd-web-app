import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { Client } from '../../../../core/models/client.model';
import { ClientService } from '../../services/client.service';

@Component({
  selector: 'app-client-detail',
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.scss']
})
export class ClientDetailComponent implements OnInit, OnDestroy {
  client: Client | null = null;
  loading = true;
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadClient(+id);
    } else {
      this.router.navigate(['/clients']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadClient(id: number): void {
    this.loading = true;
    this.clientService.getClient(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (client) => {
          this.client = client;
        },
        error: (error) => {
          console.error('Error loading client:', error);
          this.router.navigate(['/clients']);
        }
      });
  }

  onEdit(): void {
    if (this.client) {
      this.router.navigate(['/clients/edit', this.client.id]);
    }
  }

  onBack(): void {
    this.router.navigate(['/clients']);
  }

  sendEmail(): void {
    if (this.client?.email) {
      window.open(`mailto:${this.client.email}`, '_blank');
    }
  }
}