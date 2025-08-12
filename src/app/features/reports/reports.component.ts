import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ReportService, ReportFilters } from './services/report.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit, OnDestroy {
  filterForm: FormGroup;
  selectedTab = 0;
  loading = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService
  ) {
    this.filterForm = this.createFilterForm();
  }

  ngOnInit(): void {
    this.setupFilters();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createFilterForm(): FormGroup {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6); // Default to last 6 months

    return this.fb.group({
      startDate: [startDate],
      endDate: [endDate],
      vehicleId: [''],
      clientId: [''],
      vehicleType: [''],
      vehicleCategory: ['']
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
        this.reportService.updateFilters(filters);
      });
  }

  onTabChange(index: number): void {
    this.selectedTab = index;
  }

  onExportReport(format: 'pdf' | 'excel'): void {
    this.loading = true;
    const filters = this.filterForm.value;
    
    this.reportService.exportReport(this.getReportType(), format, filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loading = false;
        },
        error: (error) => {
          console.error('Export failed:', error);
          this.loading = false;
        }
      });
  }

  private getReportType(): string {
    switch (this.selectedTab) {
      case 0: return 'monthly-revenue';
      case 1: return 'trip-count';
      case 2: return 'vehicle-utilization';
      default: return 'monthly-revenue';
    }
  }
}