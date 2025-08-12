import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { VehicleCategory, VehicleStatus } from '../../../../core/models/vehicle.model';
import { CalendarDay, VehicleAvailability } from '../../services/dashboard.service';

export interface AvailabilityFilters {
  category?: VehicleCategory;
  minSeats?: number;
  maxSeats?: number;
  status?: VehicleStatus;
}

@Component({
  selector: 'app-vehicle-availability-calendar',
  templateUrl: './vehicle-availability-calendar.component.html',
  styleUrls: ['./vehicle-availability-calendar.component.scss']
})
export class VehicleAvailabilityCalendarComponent implements OnInit, OnDestroy {
  @Input() calendarData: CalendarDay[] = [];
  @Input() loading = false;
  @Output() filtersChange = new EventEmitter<AvailabilityFilters>();
  @Output() dateRangeChange = new EventEmitter<{ start: Date; end: Date }>();

  filterForm: FormGroup;
  currentMonth = new Date();
  selectedDate: Date | null = null;
  selectedDayData: CalendarDay | null = null;
  
  vehicleCategories = Object.values(VehicleCategory);
  vehicleStatuses = Object.values(VehicleStatus);
  
  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder) {
    this.filterForm = this.createFilterForm();
  }

  ngOnInit(): void {
    this.setupFilters();
    this.updateDateRange();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createFilterForm(): FormGroup {
    return this.fb.group({
      category: [''],
      minSeats: [''],
      maxSeats: [''],
      status: ['']
    });
  }

  private setupFilters(): void {
    this.filterForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(filters => {
        this.filtersChange.emit(filters);
      });
  }

  getCalendarWeeks(): CalendarDay[][] {
    if (!this.calendarData.length) return [];

    const weeks: CalendarDay[][] = [];
    let currentWeek: CalendarDay[] = [];

    // Get first day of month and pad with empty days if needed
    const firstDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
    const startOfWeek = firstDay.getDay();

    // Add empty days for the start of the week
    for (let i = 0; i < startOfWeek; i++) {
      currentWeek.push({
        date: new Date(firstDay.getTime() - (startOfWeek - i) * 24 * 60 * 60 * 1000),
        vehicles: [],
        availableCount: 0,
        inUseCount: 0,
        maintenanceCount: 0
      });
    }

    // Add actual calendar days
    this.calendarData.forEach(day => {
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
    });

    // Fill the last week if needed
    while (currentWeek.length < 7) {
      const lastDate = currentWeek[currentWeek.length - 1]?.date || new Date();
      currentWeek.push({
        date: new Date(lastDate.getTime() + 24 * 60 * 60 * 1000),
        vehicles: [],
        availableCount: 0,
        inUseCount: 0,
        maintenanceCount: 0
      });
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  }

  onDayClick(day: CalendarDay): void {
    this.selectedDate = day.date;
    this.selectedDayData = day;
  }

  previousMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.updateDateRange();
  }

  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.updateDateRange();
  }

  private updateDateRange(): void {
    const start = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
    const end = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);
    this.dateRangeChange.emit({ start, end });
  }

  clearFilters(): void {
    this.filterForm.reset();
  }

  getDayStatusClass(day: CalendarDay): string {
    if (!day.vehicles.length) return 'empty-day';
    
    const total = day.vehicles.length;
    const availableRatio = day.availableCount / total;
    
    if (availableRatio >= 0.8) return 'mostly-available';
    if (availableRatio >= 0.5) return 'partially-available';
    return 'mostly-busy';
  }

  getStatusColor(status: VehicleStatus): string {
    switch (status) {
      case VehicleStatus.AVAILABLE:
        return '#4caf50';
      case VehicleStatus.IN_USE:
        return '#ff9800';
      case VehicleStatus.MAINTENANCE:
        return '#f44336';
      case VehicleStatus.OUT_OF_SERVICE:
        return '#9e9e9e';
      default:
        return '#666';
    }
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.currentMonth.getMonth() && 
           date.getFullYear() === this.currentMonth.getFullYear();
  }

  getFilteredVehicles(vehicles: VehicleAvailability[]): VehicleAvailability[] {
    const filters = this.filterForm.value;
    
    return vehicles.filter(vehicle => {
      if (filters.category && vehicle.category !== filters.category) return false;
      if (filters.status && vehicle.status !== filters.status) return false;
      if (filters.minSeats && vehicle.seatCount < filters.minSeats) return false;
      if (filters.maxSeats && vehicle.seatCount > filters.maxSeats) return false;
      return true;
    });
  }
}