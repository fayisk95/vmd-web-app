import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, delay } from 'rxjs/operators';
import { Trip, TripFilters, AvailabilityCheck, AvailabilityResult } from '../../../core/models/trip.model';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private readonly apiUrl = 'api/trips';
  private tripsSubject = new BehaviorSubject<Trip[]>([]);
  public trips$ = this.tripsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(this.apiUrl).pipe(
      tap(trips => this.tripsSubject.next(trips))
    );
  }

  getTrip(id: number): Observable<Trip> {
    return this.http.get<Trip>(`${this.apiUrl}/${id}`);
  }

  createTrip(trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>): Observable<Trip> {
    const newTrip = {
      ...trip,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return this.http.post<Trip>(this.apiUrl, newTrip).pipe(
      tap(() => this.refreshTrips())
    );
  }

  updateTrip(trip: Trip): Observable<Trip> {
    const updatedTrip = {
      ...trip,
      updatedAt: new Date()
    };
    return this.http.put<Trip>(`${this.apiUrl}/${trip.id}`, updatedTrip).pipe(
      tap(() => this.refreshTrips())
    );
  }

  deleteTrip(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.refreshTrips())
    );
  }

  checkAvailability(availabilityCheck: AvailabilityCheck): Observable<AvailabilityResult> {
    // Simulate API call with delay
    return of(null).pipe(
      delay(1000),
      map(() => {
        // Get current trips for the vehicle
        const currentTrips = this.tripsSubject.value;
        const vehicleTrips = currentTrips.filter(trip => 
          trip.vehicleId === availabilityCheck.vehicleId &&
          (trip.status === 'Confirmed' || trip.status === 'In Progress')
        );

        // Check for conflicts
        const conflictingTrips = vehicleTrips.filter(trip => {
          const tripStart = new Date(trip.pickupDateTime);
          const tripEnd = trip.dropDateTime ? new Date(trip.dropDateTime) : new Date(tripStart.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours
          const checkStart = new Date(availabilityCheck.pickupDateTime);
          const checkEnd = availabilityCheck.dropDateTime ? 
            new Date(availabilityCheck.dropDateTime) : 
            new Date(checkStart.getTime() + 2 * 60 * 60 * 1000);

          // Check for overlap
          return (checkStart < tripEnd && checkEnd > tripStart);
        });

        const available = conflictingTrips.length === 0;
        
        return {
          available,
          conflictingTrips: available ? undefined : conflictingTrips,
          message: available ? 
            'Vehicle is available for the selected time slot.' : 
            `Vehicle is not available. ${conflictingTrips.length} conflicting trip(s) found.`
        };
      })
    );
  }

  filterTrips(trips: Trip[], filters: TripFilters): Trip[] {
    return trips.filter(trip => {
      if (filters.vehicleId && trip.vehicleId !== filters.vehicleId) {
        return false;
      }
      if (filters.clientId && trip.clientId !== filters.clientId) {
        return false;
      }
      if (filters.status && trip.status !== filters.status) {
        return false;
      }
      if (filters.dateFrom) {
        const tripDate = new Date(trip.pickupDateTime);
        const filterDate = new Date(filters.dateFrom);
        if (tripDate < filterDate) {
          return false;
        }
      }
      if (filters.dateTo) {
        const tripDate = new Date(trip.pickupDateTime);
        const filterDate = new Date(filters.dateTo);
        if (tripDate > filterDate) {
          return false;
        }
      }
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        return (
          trip.tripId.toLowerCase().includes(searchTerm) ||
          trip.vehicleId.toLowerCase().includes(searchTerm) ||
          trip.clientId.toLowerCase().includes(searchTerm) ||
          trip.pickupLocation.toLowerCase().includes(searchTerm) ||
          trip.dropLocation.toLowerCase().includes(searchTerm)
        );
      }
      return true;
    });
  }

  private refreshTrips(): void {
    this.getTrips().subscribe();
  }
}