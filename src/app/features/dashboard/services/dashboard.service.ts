import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, delay } from 'rxjs/operators';
import { Vehicle, VehicleStatus, VehicleCategory } from '../../../core/models/vehicle.model';

export interface DashboardStats {
  totalVehicles: number;
  availableVehicles: number;
  inUseVehicles: number;
  maintenanceVehicles: number;
  availabilityRate: number;
  utilizationRate: number;
  totalRevenue: number;
  monthlyGrowth: number;
}

export interface VehicleAvailability {
  date: Date;
  vehicleId: string;
  status: VehicleStatus;
  category: VehicleCategory;
  seatCount: number;
  registrationNo: string;
  trips?: number;
}

export interface CalendarDay {
  date: Date;
  vehicles: VehicleAvailability[];
  availableCount: number;
  inUseCount: number;
  maintenanceCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private statsSubject = new BehaviorSubject<DashboardStats | null>(null);
  public stats$ = this.statsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<any>('api/dashboard').pipe(
      delay(500),
      map(data => {
        // Mock enhanced dashboard stats
        const stats: DashboardStats = {
          totalVehicles: 25,
          availableVehicles: 18,
          inUseVehicles: 5,
          maintenanceVehicles: 2,
          availabilityRate: 72,
          utilizationRate: 28,
          totalRevenue: data.totalRevenue || 25000,
          monthlyGrowth: data.monthlyGrowth || 12.5
        };
        return stats;
      }),
      tap(stats => this.statsSubject.next(stats))
    );
  }

  getVehicleAvailability(startDate: Date, endDate: Date): Observable<CalendarDay[]> {
    return of(null).pipe(
      delay(800),
      map(() => this.generateMockAvailabilityData(startDate, endDate))
    );
  }

  getVehicleUtilizationChart(): Observable<any> {
    return of({
      labels: ['Available', 'In Use', 'Maintenance', 'Out of Service'],
      datasets: [{
        data: [18, 5, 2, 0],
        backgroundColor: ['#4caf50', '#ff9800', '#f44336', '#9e9e9e'],
        borderWidth: 0
      }]
    }).pipe(delay(300));
  }

  getRevenueChart(): Observable<any> {
    return of({
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Revenue',
        data: [18000, 22000, 19000, 25000, 28000, 32000],
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        fill: true,
        tension: 0.4
      }]
    }).pipe(delay(300));
  }

  private generateMockAvailabilityData(startDate: Date, endDate: Date): CalendarDay[] {
    const days: CalendarDay[] = [];
    const currentDate = new Date(startDate);
    
    // Mock vehicles data
    const mockVehicles = [
      { vehicleId: 'BUS-001', category: VehicleCategory.STANDARD, seatCount: 45, registrationNo: 'ABC-1234' },
      { vehicleId: 'BUS-002', category: VehicleCategory.LUXURY, seatCount: 35, registrationNo: 'DEF-9012' },
      { vehicleId: 'BUS-003', category: VehicleCategory.STANDARD, seatCount: 50, registrationNo: 'JKL-7890' },
      { vehicleId: 'CAR-001', category: VehicleCategory.PREMIUM, seatCount: 5, registrationNo: 'XYZ-5678' },
      { vehicleId: 'CAR-002', category: VehicleCategory.ECONOMY, seatCount: 4, registrationNo: 'GHI-3456' },
      { vehicleId: 'CAR-003', category: VehicleCategory.LUXURY, seatCount: 7, registrationNo: 'MNO-1111' },
      { vehicleId: 'VAN-001', category: VehicleCategory.STANDARD, seatCount: 12, registrationNo: 'PQR-2222' },
      { vehicleId: 'VAN-002', category: VehicleCategory.PREMIUM, seatCount: 15, registrationNo: 'STU-3333' }
    ];

    while (currentDate <= endDate) {
      const dayVehicles: VehicleAvailability[] = mockVehicles.map(vehicle => {
        // Generate random status based on date and vehicle
        const dayOfWeek = currentDate.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const random = Math.random();
        
        let status: VehicleStatus;
        if (isWeekend) {
          // Less activity on weekends
          status = random < 0.8 ? VehicleStatus.AVAILABLE : 
                  random < 0.95 ? VehicleStatus.IN_USE : VehicleStatus.MAINTENANCE;
        } else {
          // More activity on weekdays
          status = random < 0.6 ? VehicleStatus.AVAILABLE : 
                  random < 0.9 ? VehicleStatus.IN_USE : VehicleStatus.MAINTENANCE;
        }

        return {
          date: new Date(currentDate),
          vehicleId: vehicle.vehicleId,
          status,
          category: vehicle.category,
          seatCount: vehicle.seatCount,
          registrationNo: vehicle.registrationNo,
          trips: status === VehicleStatus.IN_USE ? Math.floor(Math.random() * 3) + 1 : 0
        };
      });

      const availableCount = dayVehicles.filter(v => v.status === VehicleStatus.AVAILABLE).length;
      const inUseCount = dayVehicles.filter(v => v.status === VehicleStatus.IN_USE).length;
      const maintenanceCount = dayVehicles.filter(v => v.status === VehicleStatus.MAINTENANCE).length;

      days.push({
        date: new Date(currentDate),
        vehicles: dayVehicles,
        availableCount,
        inUseCount,
        maintenanceCount
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  }
}