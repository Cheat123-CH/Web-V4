import { NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { format, getISOWeek } from 'date-fns'; // Import necessary functions for date formatting
import { SnackbarService } from 'helper/services/snack-bar/snack-bar.service';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { DashbordService } from '../dashboards.service';

@Component({
    selector: 'cicle-chart',
    standalone: true,
    templateUrl: './template.html',
    styleUrls: ['./style.scss'],
    imports: [NgApexchartsModule, MatIconModule, NgIf],
})
export class CicleChartComponent implements OnInit, OnChanges {
    @Input() selectedDate: Date | null = null; // Receive selectedDate from the parent component
    @ViewChild("chartContainer2", { read: ElementRef, static: false }) chartContainer!: ElementRef<HTMLDivElement>;

    chartOptions: Partial<ApexOptions> = {};
    public year: string = '';
    public week: string = ''; // Add week as a filter
    public data: any | undefined;

    constructor(
        private _cdr: ChangeDetectorRef,
        private _snackBarService: SnackbarService,
        private _cashierService: DashbordService // Inject your service here
    ) { }

    ngOnInit(): void {
        this.week = getISOWeek(new Date()).toString(); // Default to current week
        this._fetchProductData(this.year, this.week); // Fetch product data on init
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['selectedDate'] && this.selectedDate) {
            // Only update if selectedDate is not null
            this.year = format(this.selectedDate, 'yyyy'); // Extract year from selected date
            this.week = getISOWeek(this.selectedDate).toString(); // Extract ISO week number from selected date
            this._fetchProductData(this.year, this.week); // Fetch product data on change with both year and week
        }
    }

    private _fetchProductData(year?: string, week?: string): void {
        // Pass year and week to the service
        this._cashierService.getProductType(year, week)
            .subscribe({
                next: (response: any) => {
                    if (response && response.labels && response.data) {
                        console.log(response.data, response.labels)
                        this._updateChart(response.labels, response.data);
                    } else {
                        this._snackBarService.openSnackBar('No data available', 'Info');
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
            colors: ['#81D4FA', '#80DEEA', '#A5D6A7', '#80CBC4', '#B39DDB'], // Customize the colors as needed
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
                enabled: true,
                y: {
                    formatter: (val) => `${val}`, // Only show raw value, no percentage
                }
            },
            dataLabels: {
                enabled: true, // Enable labels, but show raw values only
                formatter: function (val, opts) {
                    return opts.w.config.series[opts.seriesIndex]; // Show only raw values
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
