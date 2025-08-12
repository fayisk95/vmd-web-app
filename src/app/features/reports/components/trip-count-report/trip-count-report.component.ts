import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { ReportService, TripCountData } from '../../services/report.service';

Chart.register(...registerables);

@Component({
  selector: 'app-trip-count-report',
  templateUrl: './trip-count-report.component.html',
  styleUrls: ['./trip-count-report.component.scss']
})
export class TripCountReportComponent implements OnInit, OnDestroy {
  @ViewChild('vehicleChart', { static: true }) vehicleChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('clientChart', { static: true }) clientChartRef!: ElementRef<HTMLCanvasElement>;

  vehicleData: TripCountData[] = [];
  clientData: TripCountData[] = [];
  loading = true;
  selectedView: 'vehicle' | 'client' = 'vehicle';

  private vehicleChart: Chart | null = null;
  private clientChart: Chart | null = null;
  private destroy$ = new Subject<void>();

  constructor(private reportService: ReportService) { }

  ngOnInit(): void {
    this.loadTripCountData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.vehicleChart) {
      this.vehicleChart.destroy();
    }
    if (this.clientChart) {
      this.clientChart.destroy();
    }
  }

  private loadTripCountData(): void {
    this.loading = true;

    // Load both vehicle and client data
    Promise.all([
      this.reportService.getTripCountByVehicle().toPromise(),
      this.reportService.getTripCountByClient().toPromise()
    ]).then(([vehicleData, clientData]) => {
      this.vehicleData = vehicleData || [];
      this.clientData = clientData || [];
      this.createCharts();
      this.loading = false;
    });
  }

  onViewChange(view: 'vehicle' | 'client'): void {
    this.selectedView = view;
  }

  private createCharts(): void {
    this.createVehicleChart();
    this.createClientChart();
  }

  private createVehicleChart(): void {
    const ctx = this.vehicleChartRef?.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'doughnut' as ChartType,
      data: {
        labels: this.vehicleData.map(item => item.name),
        datasets: [{
          data: this.vehicleData.map(item => item.count),
          backgroundColor: [
            '#1976d2',
            '#388e3c',
            '#f57c00',
            '#d32f2f',
            '#7b1fa2',
            '#00796b'
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed;
                const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} trips (${percentage}%)`;
              }
            }
          }
        }
      }
    };

    this.vehicleChart = new Chart(ctx, config);
  }

  private createClientChart(): void {
    const ctx = this.clientChartRef?.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'bar' as ChartType,
      data: {
        labels: this.clientData.map(item => item.name.split(' ')[0]), // Shortened labels
        datasets: [{
          label: 'Trip Count',
          data: this.clientData.map(item => item.count),
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
              title: (context) => {
                const index = context[0].dataIndex;
                return this.clientData[index].name;
              },
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
              text: 'Clients'
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

    this.clientChart = new Chart(ctx, config);
  }

  getCurrentData(): TripCountData[] {
    return this.selectedView === 'vehicle' ? this.vehicleData : this.clientData;
  }

  getTotalTrips(): number {
    return this.getCurrentData().reduce((sum, item) => sum + item.count, 0);
  }

  getTotalRevenue(): number {
    return this.getCurrentData().reduce((sum, item) => sum + item.revenue, 0);
  }
}
