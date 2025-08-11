export interface Vehicle {
  id: number;
  vehicleId: string;
  registrationNo: string;
  type: VehicleType;
  category: VehicleCategory;
  seatCount: number;
  status: VehicleStatus;
  photo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum VehicleType {
  BUS = 'Bus',
  CAR = 'Car'
}

export enum VehicleCategory {
  ECONOMY = 'Economy',
  STANDARD = 'Standard',
  PREMIUM = 'Premium',
  LUXURY = 'Luxury'
}

export enum VehicleStatus {
  AVAILABLE = 'Available',
  IN_USE = 'In Use',
  MAINTENANCE = 'Maintenance',
  OUT_OF_SERVICE = 'Out of Service'
}

export interface VehicleFilters {
  category?: VehicleCategory;
  type?: VehicleType;
  status?: VehicleStatus;
  minSeats?: number;
  maxSeats?: number;
  searchTerm?: string;
}