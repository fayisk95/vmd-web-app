import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Trip } from '../../core/models/trip.model';
import { TripService } from './services/trip.service';

@Component({
  selector: 'app-trips',
  templateUrl: './trips.component.html',
  styleUrls: ['./trips.component.scss']
})
export class TripsComponent implements OnInit {
  trips$: Observable<Trip[]>;

  constructor(
    private tripService: TripService,
    private router: Router
  ) {
    this.trips$ = this.tripService.trips$;
  }

  ngOnInit(): void {
    this.tripService.getTrips().subscribe();
  }

  onAddTrip(): void {
    this.router.navigate(['/trips/new']);
  }
}