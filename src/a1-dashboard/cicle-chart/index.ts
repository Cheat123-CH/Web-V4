import { NgIf } from '@angular/common';
import {
    ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SnackbarService } from 'helper/services/snack-bar/snack-bar.service';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { DashbordService } from '../service';
import { Zone, ZoneStatisticsResponse, ZoneStatisticsV2 } from '../interface';

@Component({
    selector: 'cicle-chart',
    standalone: true,
    templateUrl: './template.html',
    styleUrls: ['./style.scss'],
    imports: [NgApexchartsModule, MatIconModule, NgIf],
})

export class CicleChartComponent implements OnInit, OnChanges {
    @Input() selectedDate: { thisWeek: string; thisMonth: string, threeMonthAgo: string, sixMonthAgo: string } | null = null;
    @ViewChild("chartContainer2", { read: ElementRef, static: false }) chartContainer!: ElementRef<HTMLDivElement>;
    @Input() chartView!: boolean; // Receive the state from the parent

    chartOptions: Partial<ApexOptions> = {};

    constructor(
        private _cdr: ChangeDetectorRef,
        private _snackBarService: SnackbarService,
        private _Service: DashbordService
    ) { }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.fetchZoneSale()
    }

    private fetchZoneSale(): void {
        this._Service.getZoneStatisticsv2().subscribe({
            next: (response: ZoneStatisticsV2[]) => { // Now response is directly an array of Zone

                const zoneNames = response.map((zone) => zone.zone.name); // Extract zone names
                const totalPaidAmounts = response.map((zone) => zone.prices.totalPriceUSDUnpaidAmount); 
                
                if (zoneNames.length && totalPaidAmounts.length){
                    this._updateChart(zoneNames, totalPaidAmounts);
                } else {
                    this._snackBarService.openSnackBar('មានបញ្ហា', 'error')
                }
            },
            error: (err) => {
                this._snackBarService.openSnackBar('មានបញ្ហាerrror', 'error')
            }
        });
    }

    private _updateChart(labels: string[], data: number[]): void {
        const totalSum = data.map(Number).reduce((a, b) => a + b, 0);
        this.chartOptions = {
            chart: {
                type: 'donut',
                height: 400,
            },
            series: data.map(Number),
            labels: labels.map((label, index) => `${label} (${data[index]})`),
            legend: {
                position: 'bottom',
                horizontalAlign: 'center',
                offsetY: -140,
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
            },
            colors: [
                '#a3e635', '#16a34a', '#d9f99d', '#86efac',
                '#81D4FA', '#80DEEA', '#A5D6A7', '#80CBC4', '#B39DDB'
            ],
            plotOptions: {
                pie: {
                    startAngle: -90,
                    endAngle: 90,
                    expandOnClick: true,
                    donut: {
                        size: '65%',
                        labels: {
                            show: true,
                            total: {
                                show: true,
                                label: 'Total',
                                formatter: () => `${totalSum}`
                            }
                        }
                    }
                }
            },
            tooltip: {
                enabled: true,
                y: {
                    formatter: (val) => `${val}`,
                }
            },
            dataLabels: {
                enabled: true,
                formatter: function (val, opts) {
                    return opts.w.config.series[opts.seriesIndex];
                },
                style: {
                    fontSize: '14px',
                    fontFamily: 'Arial, sans-serif',
                }
            }
        };

        this._cdr.detectChanges(); // Trigger change detection to update the chart
    }
}
