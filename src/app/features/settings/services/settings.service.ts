import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, delay, switchMap } from 'rxjs/operators';
import { 
  AppSettings, 
  SettingsUpdateRequest, 
  VehicleCategory, 
  SeatType, 
  Currency,
  AVAILABLE_CURRENCIES 
} from '../../../core/models/settings.model';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly apiUrl = 'api/settings';
  private settingsSubject = new BehaviorSubject<AppSettings | null>(null);
  public settings$ = this.settingsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getSettings(): Observable<AppSettings> {
    return this.http.get<AppSettings>(`${this.apiUrl}/1`).pipe(
      tap(settings => this.settingsSubject.next(settings))
    );
  }

  updateSettings(updates: SettingsUpdateRequest): Observable<AppSettings> {
    const currentSettings = this.settingsSubject.value;
    if (!currentSettings) {
      return this.getSettings().pipe(
        switchMap(settings => {
          const updatedSettings: AppSettings = {
            ...settings,
            ...updates,
            updatedAt: new Date()
          };
          return this.http.put<AppSettings>(`${this.apiUrl}/1`, updatedSettings);
        }),
        tap(settings => this.settingsSubject.next(settings))
      );
    }

    const updatedSettings: AppSettings = {
      ...currentSettings,
      ...updates,
      updatedAt: new Date()
    };

    return this.http.put<AppSettings>(`${this.apiUrl}/1`, updatedSettings).pipe(
      tap(settings => this.settingsSubject.next(settings))
    );
  }

  // Category management
  addCategory(category: Omit<VehicleCategory, 'id'>): Observable<VehicleCategory> {
    const newCategory: VehicleCategory = {
      ...category,
      id: this.generateId('CAT')
    };

    return this.updateCategories([...this.getCurrentCategories(), newCategory]).pipe(
      map(() => newCategory)
    );
  }

  updateCategory(category: VehicleCategory): Observable<VehicleCategory> {
    const categories = this.getCurrentCategories();
    const index = categories.findIndex(c => c.id === category.id);
    
    if (index === -1) {
      throw new Error('Category not found');
    }

    categories[index] = category;
    return this.updateCategories(categories).pipe(
      map(() => category)
    );
  }

  deleteCategory(categoryId: string): Observable<void> {
    const categories = this.getCurrentCategories().filter(c => c.id !== categoryId);
    return this.updateCategories(categories).pipe(
      map(() => void 0)
    );
  }

  // Seat type management
  addSeatType(seatType: Omit<SeatType, 'id'>): Observable<SeatType> {
    const newSeatType: SeatType = {
      ...seatType,
      id: this.generateId('SEAT')
    };

    return this.updateSeatTypes([...this.getCurrentSeatTypes(), newSeatType]).pipe(
      map(() => newSeatType)
    );
  }

  updateSeatType(seatType: SeatType): Observable<SeatType> {
    const seatTypes = this.getCurrentSeatTypes();
    const index = seatTypes.findIndex(s => s.id === seatType.id);
    
    if (index === -1) {
      throw new Error('Seat type not found');
    }

    seatTypes[index] = seatType;
    return this.updateSeatTypes(seatTypes).pipe(
      map(() => seatType)
    );
  }

  deleteSeatType(seatTypeId: string): Observable<void> {
    const seatTypes = this.getCurrentSeatTypes().filter(s => s.id !== seatTypeId);
    return this.updateSeatTypes(seatTypes).pipe(
      map(() => void 0)
    );
  }

  // Utility methods
  getAvailableCurrencies(): Observable<Currency[]> {
    return of(AVAILABLE_CURRENCIES).pipe(delay(200));
  }

  validateTaxRate(rate: number): boolean {
    return rate >= 0 && rate <= 100;
  }

  validateCategoryMultiplier(multiplier: number): boolean {
    return multiplier >= 0.1 && multiplier <= 10;
  }

  validateSeatTypeMultiplier(multiplier: number): boolean {
    return multiplier >= 0.5 && multiplier <= 5;
  }

  private updateCategories(categories: VehicleCategory[]): Observable<AppSettings> {
    return this.updateSettings({ categories });
  }

  private updateSeatTypes(seatTypes: SeatType[]): Observable<AppSettings> {
    return this.updateSettings({ seatTypes });
  }

  private getCurrentCategories(): VehicleCategory[] {
    return this.settingsSubject.value?.categories || [];
  }

  private getCurrentSeatTypes(): SeatType[] {
    return this.settingsSubject.value?.seatTypes || [];
  }

  private generateId(prefix: string): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}${random}`;
  }
}