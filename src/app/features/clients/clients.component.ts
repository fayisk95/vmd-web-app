import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Client } from '../../core/models/client.model';
import { ClientService } from './services/client.service';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {
  clients$: Observable<Client[]>;

  constructor(
    private clientService: ClientService,
    private router: Router
  ) {
    this.clients$ = this.clientService.clients$;
  }

  ngOnInit(): void {
    this.clientService.getClients().subscribe();
  }

  onAddClient(): void {
    this.router.navigate(['/clients/new']);
  }
}