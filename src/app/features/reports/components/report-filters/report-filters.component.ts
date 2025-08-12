import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { VehicleType, VehicleCategory } from '../../../../core/models/vehicle.model';

@Component({
  selector: 'app-report-filters',
  templateUrl: './report-filters.component.html',
  styleUrls: ['./report-filters.component.scss']
})
export class ReportFiltersComponent {
  @Input() filterForm!: FormGroup;

  vehicleTypes = Object.values(VehicleType);
  vehicleCategories = Object.values(VehicleCategory);

  // Mock data for dropdowns
  vehicles = [
    { id: 'BUS-001', name: 'BUS-001 (ABC-1234)' },
    { id: 'BUS-002', name: 'BUS-002 (DEF-9012)' },
    { id: 'CAR-001', name: 'CAR-001 (XYZ-5678)' },
    { id: 'CAR-002', name: 'CAR-002 (GHI-3456)' }
  ];

  clients = [
    { id: 'CLI-001', name: 'Tech Solutions Inc.' },
    { id: 'CLI-002', name: 'Marketing Pro LLC' },
    { id: 'CLI-003', name: 'Global Enterprises' },
    { id: 'CLI-004', name: 'Creative Studio' }
  ];

  clearFilters(): void {
    this.filterForm.reset({
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 6)),
      endDate: new Date(),
      vehicleId: '',
      clientId: '',
      vehicleType: '',
      vehicleCategory: ''
    });
  }
}