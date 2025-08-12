import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { VehicleCategory, VehicleType } from 'src/app/core/models/vehicle.model';
// import { VehicleType, VehicleCategory } from '../../core/models/vehicle.model';

export interface ReportFilters {
  startDate: Date;
  endDate: Date;
  vehicleId?: string;
  clientId?: string;
  vehicleType?: VehicleType;
  vehicleCategory?: VehicleCategory;
}

export interface MonthlyRevenueData {
  month: string;
  revenue: number;
  trips: number;
  avgTripValue: number;
}

export interface TripCountData {
  name: string;
  count: number;
  revenue: number;
  percentage: number;
}

export interface VehicleUtilizationData {
  vehicleId: string;
  registrationNo: string;
  type: VehicleType;
  category: VehicleCategory;
  totalTrips: number;
  totalRevenue: number;
  utilizationRate: number;
  availableDays: number;
  activeDays: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private filtersSubject = new BehaviorSubject<ReportFilters | null>(null);
  public filters$ = this.filtersSubject.asObservable();

  constructor() { }

  updateFilters(filters: ReportFilters): void {
    this.filtersSubject.next(filters);
  }

  getMonthlyRevenueReport(filters?: ReportFilters): Observable<MonthlyRevenueData[]> {
    return of(null).pipe(
      delay(800),
      map(() => this.generateMonthlyRevenueData())
    );
  }

  getTripCountByVehicle(filters?: ReportFilters): Observable<TripCountData[]> {
    return of(null).pipe(
      delay(600),
      map(() => this.generateTripCountByVehicleData())
    );
  }

  getTripCountByClient(filters?: ReportFilters): Observable<TripCountData[]> {
    return of(null).pipe(
      delay(600),
      map(() => this.generateTripCountByClientData())
    );
  }

  getVehicleUtilizationReport(filters?: ReportFilters): Observable<VehicleUtilizationData[]> {
    return of(null).pipe(
      delay(700),
      map(() => this.generateVehicleUtilizationData())
    );
  }

  getRevenueChartData(): Observable<any> {
    return of({
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: 'Revenue',
        data: [18000, 22000, 19000, 25000, 28000, 32000, 35000, 31000, 29000, 33000, 36000, 38000],
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        fill: true,
        tension: 0.4
      }]
    }).pipe(delay(300));
  }

  getTripCountChartData(): Observable<any> {
    return of({
      labels: ['BUS-001', 'BUS-002', 'CAR-001', 'CAR-002', 'VAN-001'],
      datasets: [{
        data: [45, 38, 62, 28, 35],
        backgroundColor: ['#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2'],
        borderWidth: 0
      }]
    }).pipe(delay(300));
  }

  getUtilizationChartData(): Observable<any> {
    return of({
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Utilization Rate (%)',
        data: [75, 82, 68, 85, 79, 88],
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        fill: true,
        tension: 0.4
      }]
    }).pipe(delay(300));
  }

  exportReport(reportType: string, format: 'pdf' | 'excel', filters: ReportFilters): Observable<void> {
    return of(null).pipe(
      delay(2000),
      map(() => {
        // Simulate file download
        const filename = `${reportType}-report-${new Date().toISOString().split('T')[0]}.${format}`;
        console.log(`Exporting ${filename}...`);

        // In a real app, this would trigger actual file download
        const link = document.createElement('a');
        link.download = filename;
        link.href = '#'; // Would be actual file URL
        // document.body.appendChild(link);
        // link.click();
        // document.body.removeChild(link);
      })
    );
  }

  private generateMonthlyRevenueData(): MonthlyRevenueData[] {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const baseRevenue = 15000;

    return months.map((month, index) => {
      const revenue = baseRevenue + (Math.random() * 10000) + (index * 1000);
      const trips = Math.floor(revenue / 150) + Math.floor(Math.random() * 20);

      return {
        month,
        revenue: Math.round(revenue),
        trips,
        avgTripValue: Math.round(revenue / trips)
      };
    });
  }

  private generateTripCountByVehicleData(): TripCountData[] {
    const vehicles = [
      { name: 'BUS-001 (ABC-1234)', baseCount: 45 },
      { name: 'BUS-002 (DEF-9012)', baseCount: 38 },
      { name: 'CAR-001 (XYZ-5678)', baseCount: 62 },
      { name: 'CAR-002 (GHI-3456)', baseCount: 28 },
      { name: 'VAN-001 (PQR-2222)', baseCount: 35 },
      { name: 'VAN-002 (STU-3333)', baseCount: 41 }
    ];

    const totalTrips = vehicles.reduce((sum, v) => sum + v.baseCount, 0);

    return vehicles.map(vehicle => {
      const count = vehicle.baseCount + Math.floor(Math.random() * 10);
      const revenue = count * (120 + Math.random() * 80);

      return {
        name: vehicle.name,
        count,
        revenue: Math.round(revenue),
        percentage: Math.round((count / totalTrips) * 100)
      };
    });
  }

  private generateTripCountByClientData(): TripCountData[] {
    const clients = [
      { name: 'Tech Solutions Inc.', baseCount: 28 },
      { name: 'Marketing Pro LLC', baseCount: 35 },
      { name: 'Global Enterprises', baseCount: 42 },
      { name: 'Creative Studio', baseCount: 19 },
      { name: 'Wilson & Associates', baseCount: 31 },
      { name: 'Innovation Corp', baseCount: 25 }
    ];

    const totalTrips = clients.reduce((sum, c) => sum + c.baseCount, 0);

    return clients.map(client => {
      const count = client.baseCount + Math.floor(Math.random() * 15);
      const revenue = count * (180 + Math.random() * 120);

      return {
        name: client.name,
        count,
        revenue: Math.round(revenue),
        percentage: Math.round((count / totalTrips) * 100)
      };
    });
  }

  private generateVehicleUtilizationData(): VehicleUtilizationData[] {
    const vehicles = [
      { vehicleId: 'BUS-001', registrationNo: 'ABC-1234', type: VehicleType.BUS, category: VehicleCategory.STANDARD },
      { vehicleId: 'BUS-002', registrationNo: 'DEF-9012', type: VehicleType.BUS, category: VehicleCategory.LUXURY },
      { vehicleId: 'CAR-001', registrationNo: 'XYZ-5678', type: VehicleType.CAR, category: VehicleCategory.PREMIUM },
      { vehicleId: 'CAR-002', registrationNo: 'GHI-3456', type: VehicleType.CAR, category: VehicleCategory.ECONOMY },
      { vehicleId: 'VAN-001', registrationNo: 'PQR-2222', type: VehicleType.BUS, category: VehicleCategory.STANDARD },
      { vehicleId: 'VAN-002', registrationNo: 'STU-3333', type: VehicleType.BUS, category: VehicleCategory.PREMIUM }
    ];

    return vehicles.map(vehicle => {
      const totalTrips = 25 + Math.floor(Math.random() * 40);
      const totalRevenue = totalTrips * (150 + Math.random() * 100);
      const availableDays = 30;
      const activeDays = Math.floor(totalTrips * 0.8) + Math.floor(Math.random() * 10);
      const utilizationRate = Math.round((activeDays / availableDays) * 100);

      return {
        vehicleId: vehicle.vehicleId,
        registrationNo: vehicle.registrationNo,
        type: vehicle.type,
        category: vehicle.category,
        totalTrips,
        totalRevenue: Math.round(totalRevenue),
        utilizationRate,
        availableDays,
        activeDays
      };
    });
  }
}
