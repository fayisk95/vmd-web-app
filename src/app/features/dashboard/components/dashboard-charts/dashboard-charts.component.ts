import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { DashboardService } from '../../services/dashboard.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-charts',
  templateUrl: './dashboard-charts.component.html',
  styleUrls: ['./dashboard-charts.component.scss']
})
export class DashboardChartsComponent implements OnInit, OnDestroy {
  @ViewChild('utilizationChart', { static: true }) utilizationChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('revenueChart', { static: true }) revenueChartRef!: ElementRef<HTMLCanvasElement>;

  private utilizationChart: Chart | null = null;
  private revenueChart: Chart | null = null;
  private destroy$ = new Subject<void>();

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.loadCharts();
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

  private loadCharts(): void {
    // Load utilization chart
    this.dashboardService.getVehicleUtilizationChart()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.createUtilizationChart(data);
      });

    // Load revenue chart
    this.dashboardService.getRevenueChart()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.createRevenueChart(data);
      });
  }

  private createUtilizationChart(data: any): void {
    const ctx = this.utilizationChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'doughnut' as ChartType,
      data: data,
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
                const dataArray = context.dataset.data as number[];
                let total = 0;
                dataArray.forEach(num => total += num);

                const label = context.label || '';
                const value = context.parsed;
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    };

    this.utilizationChart = new Chart(ctx, config);
  }

  private createRevenueChart(data: any): void {
    const ctx = this.revenueChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'line' as ChartType,
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context) => {
                return `Revenue: $${context.parsed.y.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Month'
            },
            grid: {
              display: false
            }
          },
          y: {
            display: true,
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
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    };

    this.revenueChart = new Chart(ctx, config);
  }

}
