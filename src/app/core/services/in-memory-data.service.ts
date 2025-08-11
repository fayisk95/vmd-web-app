import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { Vehicle, VehicleType, VehicleCategory, VehicleStatus } from '../models/vehicle.model';

@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const users = [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
      { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Manager' }
    ];

    const products = [
      { id: 1, name: 'Laptop', price: 999.99, category: 'Electronics', stock: 25 },
      { id: 2, name: 'Smartphone', price: 699.99, category: 'Electronics', stock: 50 },
      { id: 3, name: 'Desk Chair', price: 199.99, category: 'Furniture', stock: 10 },
      { id: 4, name: 'Coffee Maker', price: 89.99, category: 'Appliances', stock: 15 }
    ];

    const vehicles: Vehicle[] = [
      {
        id: 1,
        vehicleId: 'BUS-001',
        registrationNo: 'ABC-1234',
        type: VehicleType.BUS,
        category: VehicleCategory.STANDARD,
        seatCount: 45,
        status: VehicleStatus.AVAILABLE,
        photo: 'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 2,
        vehicleId: 'CAR-001',
        registrationNo: 'XYZ-5678',
        type: VehicleType.CAR,
        category: VehicleCategory.PREMIUM,
        seatCount: 5,
        status: VehicleStatus.IN_USE,
        photo: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-20')
      },
      {
        id: 3,
        vehicleId: 'BUS-002',
        registrationNo: 'DEF-9012',
        type: VehicleType.BUS,
        category: VehicleCategory.LUXURY,
        seatCount: 35,
        status: VehicleStatus.MAINTENANCE,
        photo: 'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-18')
      },
      {
        id: 4,
        vehicleId: 'CAR-002',
        registrationNo: 'GHI-3456',
        type: VehicleType.CAR,
        category: VehicleCategory.ECONOMY,
        seatCount: 4,
        status: VehicleStatus.AVAILABLE,
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-12')
      },
      {
        id: 5,
        vehicleId: 'BUS-003',
        registrationNo: 'JKL-7890',
        type: VehicleType.BUS,
        category: VehicleCategory.STANDARD,
        seatCount: 50,
        status: VehicleStatus.OUT_OF_SERVICE,
        photo: 'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-22')
      }
    ];

    const dashboard = {
      totalUsers: users.length,
      totalProducts: products.length,
      totalRevenue: 25000,
      monthlyGrowth: 12.5
    };

    return { users, products, vehicles, dashboard };
  }

  genId(collection: any[]): number {
    return collection.length > 0 ? Math.max(...collection.map(item => item.id)) + 1 : 1;
  }
}