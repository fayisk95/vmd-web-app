import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { ReportService, VehicleUtilizationData } from '../../services/report.service';

Chart.register(...registerables);

@Component({
  selector: 'app-vehicle-utilization-report',
  templateUrl: './vehicle-utilization-report.component.html',
  styleUrls: ['./vehicle-utilization-report.component.scss']
})
export class VehicleUtilizationReportComponent implements OnInit, OnDestroy {
  @ViewChild('utilizationChart', { static: true }) utilizationChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('revenueChart', { static: true }) revenueChartRef!: ElementRef<HTMLCanvasElement>;

  utilizationData: VehicleUtilizationData[] = [];
  loading = true;

  private utilizationChart: Chart | null = null;
  private revenueChart: Chart | null = null;
  private destroy$ = new Subject<void>();

  // Summary statistics
  avgUtilizationRate = 0;
  totalRevenue = 0;
  totalTrips = 0;
  activeVehicles = 0;

  constructor(private reportService: ReportService) { }

  ngOnInit(): void {
    this.loadUtilizationData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.utilizationChart) {
      this.utilizationChart.destroy();
    }
    if (this.revenueChart) {
      this.revenueChart.destroy();
    }
  }

  private loadUtilizationData(): void {
    this.loading = true;

    this.reportService.getVehicleUtilizationReport()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.utilizationData = data;
        this.calculateSummaryStats();
        this.createCharts();
        this.loading = false;
      });
  }

  private calculateSummaryStats(): void {
    this.avgUtilizationRate = Math.round(
      this.utilizationData.reduce((sum, item) => sum + item.utilizationRate, 0) / this.utilizationData.length
    );
    this.totalRevenue = this.utilizationData.reduce((sum, item) => sum + item.totalRevenue, 0);
    this.totalTrips = this.utilizationData.reduce((sum, item) => sum + item.totalTrips, 0);
    this.activeVehicles = this.utilizationData.filter(item => item.utilizationRate > 0).length;
  }

  private createCharts(): void {
    this.createUtilizationChart();
    this.createRevenueChart();
  }

  private createUtilizationChart(): void {
    const ctx = this.utilizationChartRef?.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'bar' as ChartType,
      data: {
        labels: this.utilizationData.map(item => item.vehicleId),
        datasets: [{
          label: 'Utilization Rate (%)',
          data: this.utilizationData.map(item => item.utilizationRate),
          backgroundColor: this.utilizationData.map(item => this.getUtilizationColor(item.utilizationRate)),
          borderColor: this.utilizationData.map(item => this.getUtilizationColor(item.utilizationRate, 0.8)),
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
                const index = context.dataIndex;
                const vehicle = this.utilizationData[index];
                return [
                  `Utilization: ${context.parsed.y}%`,
                  `Active Days: ${vehicle.activeDays}/${vehicle.availableDays}`,
                  `Total Trips: ${vehicle.totalTrips}`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Vehicle ID'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Utilization Rate (%)'
            },
            beginAtZero: true,
            max: 100
          }
        }
      }
    };

    this.utilizationChart = new Chart(ctx, config);
  }

  private createRevenueChart(): void {
    const ctx = this.revenueChartRef?.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'bar' as ChartType,
      data: {
        labels: this.utilizationData.map(item => item.vehicleId),
        datasets: [{
          label: 'Revenue',
          data: this.utilizationData.map(item => item.totalRevenue),
          backgroundColor: '#1976d2',
          borderColor: '#1565c0',
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
                return `Revenue: $${context.parsed.y.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Vehicle ID'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Revenue ($)'
            },
            beginAtZero: true,
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

  private getUtilizationColor(rate: number, opacity: number = 0.8): string {
    if (rate >= 80) return `rgba(76, 175, 80, ${opacity})`;
    if (rate >= 60) return `rgba(255, 152, 0, ${opacity})`;
    if (rate >= 40) return `rgba(255, 193, 7, ${opacity})`;
    return `rgba(244, 67, 54, ${opacity})`;
  }

  getUtilizationStatus(rate: number): string {
    if (rate >= 80) return 'Excellent';
    if (rate >= 60) return 'Good';
    if (rate >= 40) return 'Fair';
    return 'Poor';
  }

  getUtilizationStatusColor(rate: number): string {
    if (rate >= 80) return '#4caf50';
    if (rate >= 60) return '#ff9800';
    if (rate >= 40) return '#ffc107';
    return '#f44336';
  }
}
