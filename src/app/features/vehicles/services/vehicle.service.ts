import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Vehicle, VehicleFilters } from '../../../core/models/vehicle.model';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private readonly apiUrl = 'api/vehicles';
  private vehiclesSubject = new BehaviorSubject<Vehicle[]>([]);
  public vehicles$ = this.vehiclesSubject.asObservable();

  constructor(private http: HttpClient) {}

  getVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(this.apiUrl).pipe(
      tap(vehicles => this.vehiclesSubject.next(vehicles))
    );
  }

  getVehicle(id: number): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.apiUrl}/${id}`);
  }

  createVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Observable<Vehicle> {
    const newVehicle = {
      ...vehicle,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return this.http.post<Vehicle>(this.apiUrl, newVehicle).pipe(
      tap(() => this.refreshVehicles())
    );
  }

  updateVehicle(vehicle: Vehicle): Observable<Vehicle> {
    const updatedVehicle = {
      ...vehicle,
      updatedAt: new Date()
    };
    return this.http.put<Vehicle>(`${this.apiUrl}/${vehicle.id}`, updatedVehicle).pipe(
      tap(() => this.refreshVehicles())
    );
  }

  deleteVehicle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.refreshVehicles())
    );
  }

  filterVehicles(vehicles: Vehicle[], filters: VehicleFilters): Vehicle[] {
    return vehicles.filter(vehicle => {
      if (filters.category && vehicle.category !== filters.category) {
        return false;
      }
      if (filters.type && vehicle.type !== filters.type) {
        return false;
      }
      if (filters.status && vehicle.status !== filters.status) {
        return false;
      }
      if (filters.minSeats && vehicle.seatCount < filters.minSeats) {
        return false;
      }
      if (filters.maxSeats && vehicle.seatCount > filters.maxSeats) {
        return false;
      }
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        return (
          vehicle.vehicleId.toLowerCase().includes(searchTerm) ||
          vehicle.registrationNo.toLowerCase().includes(searchTerm) ||
          vehicle.type.toLowerCase().includes(searchTerm) ||
          vehicle.category.toLowerCase().includes(searchTerm)
        );
      }
      return true;
    });
  }

  private refreshVehicles(): void {
    this.getVehicles().subscribe();
  }
}