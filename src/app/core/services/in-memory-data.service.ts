import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { Vehicle, VehicleType, VehicleCategory, VehicleStatus } from '../models/vehicle.model';
import { Client } from '../models/client.model';
import { Trip, TripStatus } from '../models/trip.model';
import { Invoice, PaymentStatus } from '../models/invoice.model';
import { AppSettings, SeatType, BusinessInfo, Currency } from '../models/settings.model';

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

    const clients: Client[] = [
      {
        id: 1,
        clientId: 'CLI-001',
        name: 'John Smith',
        contactDetails: '+1 (555) 123-4567',
        company: 'Tech Solutions Inc.',
        email: 'john.smith@techsolutions.com',
        notes: 'Preferred client with multiple ongoing projects. Always pays on time.',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 2,
        clientId: 'CLI-002',
        name: 'Sarah Johnson',
        contactDetails: '+1 (555) 987-6543',
        company: 'Marketing Pro LLC',
        email: 'sarah.johnson@marketingpro.com',
        notes: 'Requires detailed reports and regular updates on project progress.',
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-18')
      },
      {
        id: 3,
        clientId: 'CLI-003',
        name: 'Michael Brown',
        contactDetails: '+1 (555) 456-7890',
        company: 'Global Enterprises',
        email: 'michael.brown@globalent.com',
        notes: 'Large corporate client with strict compliance requirements.',
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-20')
      },
      {
        id: 4,
        clientId: 'CLI-004',
        name: 'Emily Davis',
        contactDetails: '+1 (555) 321-0987',
        company: 'Creative Studio',
        email: 'emily.davis@creativestudio.com',
        notes: 'Focus on creative and innovative solutions. Flexible with timelines.',
        createdAt: new Date('2024-01-14'),
        updatedAt: new Date('2024-01-22')
      },
      {
        id: 5,
        clientId: 'CLI-005',
        name: 'Robert Wilson',
        contactDetails: '+1 (555) 654-3210',
        company: 'Wilson & Associates',
        email: 'robert.wilson@wilsonassoc.com',
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date('2024-01-16')
      }
    ];

    const trips: Trip[] = [
      {
        id: 1,
        tripId: 'TRIP-001',
        vehicleId: 'BUS-001',
        clientId: 'CLI-001',
        pickupLocation: '123 Main Street, Downtown',
        dropLocation: '456 Oak Avenue, Uptown',
        pickupDateTime: new Date('2024-02-15T09:00:00'),
        dropDateTime: new Date('2024-02-15T17:00:00'),
        price: 250.00,
        status: TripStatus.CONFIRMED,
        notes: 'Corporate event transportation. VIP service required.',
        createdAt: new Date('2024-02-10T10:30:00'),
        updatedAt: new Date('2024-02-12T14:20:00')
      },
      {
        id: 2,
        tripId: 'TRIP-002',
        vehicleId: 'CAR-001',
        clientId: 'CLI-002',
        pickupLocation: '789 Business Plaza, City Center',
        dropLocation: 'Airport Terminal 1',
        pickupDateTime: new Date('2024-02-16T06:30:00'),
        price: 85.00,
        status: TripStatus.PENDING,
        notes: 'Early morning airport transfer. Client prefers quiet ride.',
        createdAt: new Date('2024-02-11T16:45:00'),
        updatedAt: new Date('2024-02-11T16:45:00')
      },
      {
        id: 3,
        tripId: 'TRIP-003',
        vehicleId: 'BUS-002',
        clientId: 'CLI-003',
        pickupLocation: 'Convention Center, Hall A',
        dropLocation: 'Grand Hotel, Conference Room',
        pickupDateTime: new Date('2024-02-14T08:00:00'),
        dropDateTime: new Date('2024-02-14T18:00:00'),
        price: 450.00,
        status: TripStatus.IN_PROGRESS,
        notes: 'Conference shuttle service. Multiple stops expected.',
        createdAt: new Date('2024-02-08T09:15:00'),
        updatedAt: new Date('2024-02-14T08:05:00')
      },
      {
        id: 4,
        tripId: 'TRIP-004',
        vehicleId: 'CAR-002',
        clientId: 'CLI-004',
        pickupLocation: 'Residential Area, 321 Pine Street',
        dropLocation: 'Shopping Mall, Main Entrance',
        pickupDateTime: new Date('2024-02-13T14:00:00'),
        dropDateTime: new Date('2024-02-13T16:30:00'),
        price: 45.00,
        status: TripStatus.COMPLETED,
        createdAt: new Date('2024-02-12T11:20:00'),
        updatedAt: new Date('2024-02-13T16:35:00')
      },
      {
        id: 5,
        tripId: 'TRIP-005',
        vehicleId: 'BUS-001',
        clientId: 'CLI-005',
        pickupLocation: 'University Campus, Student Center',
        dropLocation: 'Sports Stadium, Gate 3',
        pickupDateTime: new Date('2024-02-20T19:00:00'),
        price: 180.00,
        status: TripStatus.CANCELLED,
        notes: 'Event cancelled due to weather conditions.',
        createdAt: new Date('2024-02-15T13:10:00'),
        updatedAt: new Date('2024-02-18T10:45:00')
      }
    ];

    const invoices: Invoice[] = [
      {
        id: 1,
        invoiceNumber: 'INV-001234',
        tripIds: ['TRIP-001', 'TRIP-002'],
        clientId: 'CLI-001',
        clientName: 'John Smith',
        clientEmail: 'john.smith@techsolutions.com',
        issueDate: new Date('2024-02-01'),
        dueDate: new Date('2024-03-03'),
        subtotal: 335.00,
        taxRate: 10,
        taxAmount: 33.50,
        totalAmount: 368.50,
        paymentStatus: PaymentStatus.PAID,
        paymentDate: new Date('2024-02-28'),
        notes: 'Thank you for your business. Payment received on time.',
        createdAt: new Date('2024-02-01T10:30:00'),
        updatedAt: new Date('2024-02-28T14:20:00')
      },
      {
        id: 2,
        invoiceNumber: 'INV-001235',
        tripIds: ['TRIP-003'],
        clientId: 'CLI-003',
        clientName: 'Michael Brown',
        clientEmail: 'michael.brown@globalent.com',
        issueDate: new Date('2024-02-05'),
        dueDate: new Date('2024-03-07'),
        subtotal: 450.00,
        taxRate: 10,
        taxAmount: 45.00,
        totalAmount: 495.00,
        paymentStatus: PaymentStatus.PENDING,
        notes: 'Corporate transportation services for conference event.',
        createdAt: new Date('2024-02-05T09:15:00'),
        updatedAt: new Date('2024-02-05T09:15:00')
      },
      {
        id: 3,
        invoiceNumber: 'INV-001236',
        tripIds: ['TRIP-004'],
        clientId: 'CLI-004',
        clientName: 'Emily Davis',
        clientEmail: 'emily.davis@creativestudio.com',
        issueDate: new Date('2024-01-20'),
        dueDate: new Date('2024-02-19'),
        subtotal: 45.00,
        taxRate: 8.5,
        taxAmount: 3.83,
        totalAmount: 48.83,
        paymentStatus: PaymentStatus.OVERDUE,
        notes: 'Shopping trip service. Payment overdue.',
        createdAt: new Date('2024-01-20T11:20:00'),
        updatedAt: new Date('2024-02-20T16:35:00')
      },
      {
        id: 4,
        invoiceNumber: 'INV-001237',
        tripIds: ['TRIP-005'],
        clientId: 'CLI-005',
        clientName: 'Robert Wilson',
        clientEmail: 'robert.wilson@wilsonassoc.com',
        issueDate: new Date('2024-02-18'),
        dueDate: new Date('2024-03-20'),
        subtotal: 180.00,
        taxRate: 10,
        taxAmount: 18.00,
        totalAmount: 198.00,
        paymentStatus: PaymentStatus.CANCELLED,
        notes: 'Event cancelled due to weather conditions. Invoice cancelled.',
        createdAt: new Date('2024-02-18T13:10:00'),
        updatedAt: new Date('2024-02-19T10:45:00')
      }
    ];

    const settings: AppSettings = {
      id: 1,
      currency: {
        code: 'USD',
        symbol: '$',
        name: 'US Dollar',
        decimalPlaces: 2
      },
      defaultTaxRate: 10,
      categories: [
        {
          id: 'CAT-001',
          name: 'Economy',
          description: 'Basic transportation with standard amenities',
          baseRate: 50,
          multiplier: 1.0,
          isActive: true
        },
        {
          id: 'CAT-002',
          name: 'Standard',
          description: 'Comfortable transportation with enhanced features',
          baseRate: 50,
          multiplier: 1.5,
          isActive: true
        },
        {
          id: 'CAT-003',
          name: 'Premium',
          description: 'High-end transportation with luxury amenities',
          baseRate: 50,
          multiplier: 2.0,
          isActive: true
        },
        {
          id: 'CAT-004',
          name: 'Luxury',
          description: 'Top-tier transportation with exclusive services',
          baseRate: 50,
          multiplier: 3.0,
          isActive: true
        }
      ],
      seatTypes: [
        {
          id: 'SEAT-001',
          name: 'Standard Seat',
          description: 'Regular passenger seat with basic comfort',
          priceMultiplier: 1.0,
          isActive: true
        },
        {
          id: 'SEAT-002',
          name: 'Premium Seat',
          description: 'Enhanced comfort seat with extra legroom',
          priceMultiplier: 1.3,
          isActive: true
        },
        {
          id: 'SEAT-003',
          name: 'Business Seat',
          description: 'Business class seat with premium amenities',
          priceMultiplier: 1.8,
          isActive: true
        },
        {
          id: 'SEAT-004',
          name: 'VIP Seat',
          description: 'Exclusive VIP seating with luxury features',
          priceMultiplier: 2.5,
          isActive: false
        }
      ],
      businessInfo: {
        companyName: 'VMD Transportation Services',
        address: '123 Business Avenue, Suite 100, City, State 12345',
        phone: '+1 (555) 123-4567',
        email: 'info@vmdtransport.com',
        website: 'https://www.vmdtransport.com',
        taxId: 'TAX-123456789'
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15')
    };

    const dashboard = {
      totalUsers: users.length,
      totalProducts: products.length,
      totalRevenue: 25000,
      monthlyGrowth: 12.5
    };

    return { users, products, vehicles, clients, trips, invoices, dashboard, settings };
  }

  genId(collection: any[]): number {
    return collection.length > 0 ? Math.max(...collection.map(item => item.id)) + 1 : 1;
  }
}
