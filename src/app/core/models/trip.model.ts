export interface Trip {
  id: number;
  tripId: string;
  vehicleId: string;
  clientId: string;
  pickupLocation: string;
  dropLocation: string;
  pickupDateTime: Date;
  dropDateTime?: Date;
  price: number;
  status: TripStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum TripStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export interface TripFilters {
  searchTerm?: string;
  vehicleId?: string;
  clientId?: string;
  status?: TripStatus;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface AvailabilityCheck {
  vehicleId: string;
  pickupDateTime: Date;
  dropDateTime?: Date;
}

export interface AvailabilityResult {
  available: boolean;
  conflictingTrips?: Trip[];
  message: string;
}