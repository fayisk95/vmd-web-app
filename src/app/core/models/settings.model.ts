export interface AppSettings {
  id: number;
  currency: Currency;
  defaultTaxRate: number;
  categories: VehicleCategory[];
  seatTypes: SeatType[];
  businessInfo: BusinessInfo;
  createdAt: Date;
  updatedAt: Date;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  decimalPlaces: number;
}

export interface VehicleCategory {
  id: string;
  name: string;
  description: string;
  baseRate: number;
  multiplier: number;
  isActive: boolean;
}

export interface SeatType {
  id: string;
  name: string;
  description: string;
  priceMultiplier: number;
  isActive: boolean;
}

export interface BusinessInfo {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  taxId?: string;
}

export interface SettingsUpdateRequest {
  currency?: Currency;
  defaultTaxRate?: number;
  categories?: VehicleCategory[];
  seatTypes?: SeatType[];
  businessInfo?: BusinessInfo;
}

// Predefined currencies
export const AVAILABLE_CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', decimalPlaces: 2 },
  { code: 'EUR', symbol: '€', name: 'Euro', decimalPlaces: 2 },
  { code: 'GBP', symbol: '£', name: 'British Pound', decimalPlaces: 2 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', decimalPlaces: 2 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', decimalPlaces: 2 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', decimalPlaces: 0 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', decimalPlaces: 2 }
];