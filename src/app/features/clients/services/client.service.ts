import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Client, ClientFilters } from '../../../core/models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly apiUrl = 'api/clients';
  private clientsSubject = new BehaviorSubject<Client[]>([]);
  public clients$ = this.clientsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl).pipe(
      tap(clients => this.clientsSubject.next(clients))
    );
  }

  getClient(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`);
  }

  createClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Observable<Client> {
    const newClient = {
      ...client,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return this.http.post<Client>(this.apiUrl, newClient).pipe(
      tap(() => this.refreshClients())
    );
  }

  updateClient(client: Client): Observable<Client> {
    const updatedClient = {
      ...client,
      updatedAt: new Date()
    };
    return this.http.put<Client>(`${this.apiUrl}/${client.id}`, updatedClient).pipe(
      tap(() => this.refreshClients())
    );
  }

  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.refreshClients())
    );
  }

  filterClients(clients: Client[], filters: ClientFilters): Client[] {
    return clients.filter(client => {
      if (filters.company && client.company.toLowerCase() !== filters.company.toLowerCase()) {
        return false;
      }
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        return (
          client.clientId.toLowerCase().includes(searchTerm) ||
          client.name.toLowerCase().includes(searchTerm) ||
          client.email.toLowerCase().includes(searchTerm) ||
          client.company.toLowerCase().includes(searchTerm) ||
          client.contactDetails.toLowerCase().includes(searchTerm)
        );
      }
      return true;
    });
  }

  private refreshClients(): void {
    this.getClients().subscribe();
  }
}