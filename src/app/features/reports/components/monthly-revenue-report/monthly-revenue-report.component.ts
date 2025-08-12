import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { ReportService, MonthlyRevenueData } from '../../services/report.service';

Chart.register(...registerables);

@Component({
  selector: 'app-monthly-revenue-report',
  templateUrl: './monthly-revenue-report.component.html',
  styleUrls: ['./monthly-revenue-report.component.scss']
})
export class MonthlyRevenueReportComponent implements OnInit, OnDestroy {
  @ViewChild('revenueChart', { static: true }) revenueChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('tripsChart', { static: true }) tripsChartRef!: ElementRef<HTMLCanvasElement>;

  revenueData: MonthlyRevenueData[] = [];
  loading = true;

  private revenueChart: Chart | null = null;
  private tripsChart: Chart | null = null;
  private destroy$ = new Subject<void>();

  // Summary statistics
  totalRevenue = 0;
  totalTrips = 0;
  avgMonthlyRevenue = 0;
  avgTripValue = 0;

  constructor(private reportService: ReportService) { }

  ngOnInit(): void {
    this.loadRevenueData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.revenueChart) {
      this.revenueChart.destroy();
    }
    if (this.tripsChart) {
      this.tripsChart.destroy();
    }
  }

  private loadRevenueData(): void {
    this.loading = true;

    this.reportService.getMonthlyRevenueReport()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.revenueData = data;
        this.calculateSummaryStats();
        this.createCharts();
        this.loading = false;
      });
  }

  private calculateSummaryStats(): void {
    this.totalRevenue = this.revenueData.reduce((sum, item) => sum + item.revenue, 0);
    this.totalTrips = this.revenueData.reduce((sum, item) => sum + item.trips, 0);
    this.avgMonthlyRevenue = this.totalRevenue / this.revenueData.length;
    this.avgTripValue = this.totalRevenue / this.totalTrips;
  }

  private createCharts(): void {
    this.createRevenueChart();
    this.createTripsChart();
  }

  private createRevenueChart(): void {
    const ctx = this.revenueChartRef?.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'line' as ChartType,
      data: {
        labels: this.revenueData.map(item => item.month),
        datasets: [{
          label: 'Monthly Revenue',
          data: this.revenueData.map(item => item.revenue),
          borderColor: '#1976d2',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#1976d2',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `Revenue: $${context.parsed.y.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Month'
            },
            grid: {
              display: false
            }
          },
          y: {
            title: {
              display: true,
              text: 'Revenue ($)'
            },
            ticks: {
              callback: function (value) {
                return '$' + (value as number).toLocaleString();
              }
            }
          }
        }
      }
    };

    this.revenueChart = new Chart(ctx, config);
  }

  private createTripsChart(): void {
    const ctx = this.tripsChartRef?.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'bar' as ChartType,
      data: {
        labels: this.revenueData.map(item => item.month),
        datasets: [{
          label: 'Number of Trips',
          data: this.revenueData.map(item => item.trips),
          backgroundColor: '#4caf50',
          borderColor: '#388e3c',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `Trips: ${context.parsed.y}`;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Month'
            },
            grid: {
              display: false
            }
          },
          y: {
            title: {
              display: true,
              text: 'Number of Trips'
            },
            beginAtZero: true
          }
        }
      }
    };

    this.tripsChart = new Chart(ctx, config);
  }
}
