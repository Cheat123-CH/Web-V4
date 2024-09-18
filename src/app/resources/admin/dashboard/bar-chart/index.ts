import { ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SnackbarService } from 'helper/services/snack-bar/snack-bar.service';
import { ApexOptions, NgApexchartsModule } from "ng-apexcharts";

@Component({
    selector: 'sup-bar-chart',
    standalone: true,
    templateUrl: './template.html',
    styleUrls: ['./style.scss'],
    imports: [NgApexchartsModule, MatIconModule],
})
export class BarChartComponent implements OnInit, OnChanges {

    @Input() dateForChart_I: string | null = null;
    @ViewChild("chartContainer1", { read: ElementRef }) chartContainer!: ElementRef;
    chartOptions: Partial<ApexOptions> = {};
    private defaultDate: string = ''; // Set default date here if needed

    constructor(
        private _cdr: ChangeDetectorRef,
        private _snackBarService: SnackbarService
    ) { }

    public data: any | undefined;
    public year: string = '';

    ngOnInit(): void {
        // Initialize with default or initial date
        this.year = this.dateForChart_I || this.defaultDate || '2023';
        this.fetchData(); // Call fetchData during initialization
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['dateForChart_I']) {
            if (!changes['dateForChart_I'].isFirstChange()) {
                this.year = changes['dateForChart_I'].currentValue || this.defaultDate;
                this.fetchData(); // Fetch data with updated date
            }
        }
    }

    private fetchData(year?: string): void {
        // Simulated mock data for testing purposes (7 days of the week)
        this.data = {
            n_of_dat_ion_week: [10, 15, 30, 20, 25, 35, 18] // Example data for 7 days (Monday to Sunday)
        };

        const { n_of_dat_ion_week } = this.data;
        this.chartOptions = {
            chart: {
                height: 300,
                type: 'bar',
                fontFamily: 'Barlow, Kantumruy Pro sans-serif',
                foreColor: '#6e729b',
                toolbar: { show: false },
                events: {
                    mounted: () => {
                        setTimeout(() => this.modifyGridLines(), 500);
                    }
                }
            },
            stroke: {
                curve: 'smooth',
                width: 0
            },
            series: [
                { name: "អតិថិជន", data: n_of_dat_ion_week, color: '#3D5AFE' } // Only one bar series for customers
            ],
            plotOptions: {
                bar: { columnWidth: "50%" }
            },
            dataLabels: { enabled: false },
            legend: {
                position: 'bottom',
                horizontalAlign: 'center',
                fontWeight: 400,
                offsetY: -5,
                fontSize: '18px',
                labels: { colors: '#64748b', useSeriesColors: false },
                markers: { width: 16, height: 16, offsetY: 0, radius: 100 }
            },
            xaxis: {
                // Days of the week in Khmer
                categories: [
                    "ចន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍", "អាទិត្យ"
                ]
            },
            yaxis: {
                min: 0,
                max: 50,
                tickAmount: 5,
                labels: {
                    formatter: function (value) { return value.toFixed(0); }
                }
            },
            grid: {
                show: true,
                borderColor: '#e0e0e0',
                strokeDashArray: 5,
                xaxis: { lines: { show: true } },
                yaxis: { lines: { show: true } }
            },
        };

        this._cdr.detectChanges();
    }

    private modifyGridLines(): void {
        const verticalGridLines = this.chartContainer.nativeElement.querySelectorAll('.apexcharts-gridlines-vertical line');
        if (verticalGridLines.length > 0) {
            verticalGridLines[0].style.strokeDasharray = '0'; // First vertical line
            verticalGridLines[verticalGridLines.length - 1].style.strokeDasharray = '0'; // Last vertical line
        }
    }
}
