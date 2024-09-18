import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SnackbarService } from 'helper/services/snack-bar/snack-bar.service';
import { ApexOptions, NgApexchartsModule } from "ng-apexcharts";

@Component({
    selector: 'cicle-chart',
    standalone: true,
    templateUrl: './template.html',
    styleUrls: ['./style.scss'],
    imports: [NgApexchartsModule, MatIconModule],
})
export class CicleChartComponent implements OnInit {
    @Input() dateForChart_II: string | null = null;
    @ViewChild("chartContainer2", { read: ElementRef }) chartContainer: ElementRef<HTMLDivElement>;

    chartOptions: Partial<ApexOptions> = {};
    public year: string = '';
    private defaultDate: string = '';

    constructor(
        private _cdr: ChangeDetectorRef,
        private _snackBarService: SnackbarService
    ) { }

    public data: any | undefined;

    ngOnInit(): void {
        this.year = this.dateForChart_II || this.defaultDate;
        this._dataCustomerByYear();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['dateForChart_II']) {
            if (!changes['dateForChart_II'].isFirstChange()) {
                this.year = changes['dateForChart_II'].currentValue || this.defaultDate;
                this._dataCustomerByYear();
            }
        }
    }

    private _dataCustomerByYear(year?: string): void {
        // Mock data for the chart
        this.data = {
            yearlyGuestCount: 5,  // Example data for Alcohol
            yearlyCustomerCount: 12,  // Example data for Beverage
            allCustomerCount: 28,  // Total count for all categories
            categories: [
                { name: 'Alcohol', count: 5, date: '18-09-2024' },
                { name: 'Beverage', count: 12, date: '18-09-2024' },
                { name: 'Food-Meat', count: 8, date: '18-09-2024' },
                { name: 'Snacks', count: 3, date: '18-09-2024' }
            ]
        };

        const { yearlyGuestCount, yearlyCustomerCount, allCustomerCount } = this.data;

        this.chartOptions = {
            chart: {
                type: 'donut',
                height: 400,
            },
            series: [5, 12, 8, 3], // Mock data for each category
            labels: [
                `Alcohol (${this.data.categories[0].count})`,
                `Beverage (${this.data.categories[1].count})`,
                `Food-Meat (${this.data.categories[2].count})`,
                `Snacks (${this.data.categories[3].count})`
            ],
            legend: {
                position: 'bottom',
                horizontalAlign: 'center',
                offsetY: -140,
                fontSize: '14px', // Adjusted font size for legend
                fontFamily: 'Arial, sans-serif', // Customized font for legend
                labels: {
                    colors: '#000', // Change legend text color
                }
            },
            colors: ['#FF8F00', '#3D5AFE', '#00C853', '#FFC107'], // Colors for the categories
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
                                fontSize: '18px', // Customize total label font size
                                fontFamily: 'Arial, sans-serif', // Customize total label font family
                                color: '#373d3f',
                                formatter: () => `${allCustomerCount}` // Only display total count, no percentage
                            }
                        }
                    }
                }
            },
            tooltip: {
                enabled: false, // Disable tooltips to avoid showing percentages
            },
            dataLabels: {
                enabled: true, // Enable data labels
                formatter: function (val, opts) {
                    return opts.w.config.series[opts.seriesIndex]; // Show only the raw values (counts), not percentages
                },
                style: {
                    fontSize: '14px', // Customize font size of the data labels
                    fontFamily: 'Arial, sans-serif', // Customize font family of the data labels
                    colors: ['#000'] // Customize font color of the data labels
                }
            }
        };

        this._cdr.detectChanges();
    }
}
