import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SnackbarService } from 'helper/services/snack-bar/snack-bar.service';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { DashbordService } from '../dashboards.service';

@Component({
    selector: 'cicle-chart',
    standalone: true,
    templateUrl: './template.html',
    styleUrls: ['./style.scss'],
    imports: [NgApexchartsModule, MatIconModule],
})
export class CicleChartComponent implements OnInit {
    @Input() dateForChart_II: string | null = null; // Accept date input
    @ViewChild("chartContainer2", { read: ElementRef }) chartContainer: ElementRef<HTMLDivElement>;

    chartOptions: Partial<ApexOptions> = {};
    public year: string = '';
    public week: string = ''; // Add week as a filter
    private defaultDate: string = '';
    public data: any | undefined;

    constructor(
        private _cdr: ChangeDetectorRef,
        private _snackBarService: SnackbarService,
        private _cashierService: DashbordService // Inject your service here
    ) { }

    ngOnInit(): void {
        this.year = this.dateForChart_II || this.defaultDate;
        this._fetchProductData(this.year, this.week); // Fetch product data on init with both year and week
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['dateForChart_II']) {
            if (!changes['dateForChart_II'].isFirstChange()) {
                this.year = changes['dateForChart_II'].currentValue || this.defaultDate;
                this._fetchProductData(this.year, this.week); // Fetch product data on change
            }
        }
    }

    private _fetchProductData(year?: string, week?: string): void {
        // Pass year and week to the service
        this._cashierService.getProductType(year, week)
            .subscribe({
                next: (response: any) => {
                    if (response && response.labels && response.data) {
                        this._updateChart(response.labels, response.data);
                    }
                },
                error: (err) => {
                    const errorMessage = err.error?.message || 'Error fetching product data';
                    this._snackBarService.openSnackBar(errorMessage, 'Error');
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
            series: data.map(Number), // Use the data from the API
            labels: labels.map((label, index) => `${label} (${data[index]})`), // Format the labels with data
            legend: {
                position: 'bottom',
                horizontalAlign: 'center',
                offsetY: -140,
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                labels: {
                    colors: '#000', // Change legend text color
                }
            },
            colors: ['#FF8F00', '#3D5AFE', '#00C853', '#FFC107'], // Customize the colors as needed
            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        chart: {},
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            ],
            plotOptions: {
                pie: {
                    startAngle: -90,
                    endAngle: 90,
                    expandOnClick: true,
                    donut: {
                        size: '60%',
                        labels: {
                            show: true,
                            total: {
                                show: true,
                                label: 'Total',
                                fontSize: '18px',
                                fontFamily: 'Arial, sans-serif',
                                color: '#373d3f',
                                formatter: () => `${totalSum}` // Display total sum of data
                            }
                        }
                    }
                }
            },
            tooltip: {
                enabled: false,
            },
            dataLabels: {
                enabled: true,
                formatter: function (val, opts) {
                    return opts.w.config.series[opts.seriesIndex]; // Show raw values
                },
                style: {
                    fontSize: '14px',
                    fontFamily: 'Arial, sans-serif',
                    colors: ['#000']
                }
            }
        };

        this._cdr.detectChanges(); // Trigger change detection to update the chart
    }
}
