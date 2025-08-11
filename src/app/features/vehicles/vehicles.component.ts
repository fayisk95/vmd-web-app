import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Vehicle } from '../../core/models/vehicle.model';
import { VehicleService } from './services/vehicle.service';

@Component({
  selector: 'app-vehicles',
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.scss']
})
export class VehiclesComponent implements OnInit {
  vehicles$: Observable<Vehicle[]>;

  constructor(
    private vehicleService: VehicleService,
    private router: Router
  ) {
    this.vehicles$ = this.vehicleService.vehicles$;
  }

  ngOnInit(): void {
    this.vehicleService.getVehicles().subscribe();
  }

  onAddVehicle(): void {
    this.router.navigate(['/vehicles/new']);
  }
}