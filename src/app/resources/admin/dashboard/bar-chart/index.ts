import { NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { format, getISOWeek } from 'date-fns'; // Import date-fns for date manipulation
import { SnackbarService } from 'helper/services/snack-bar/snack-bar.service';
import { ApexOptions, NgApexchartsModule } from "ng-apexcharts";
import { DashbordService } from '../dashboards.service'; // Import your service
import { DataSaleResponse } from '../interface';

@Component({
    selector: 'sup-bar-chart',
    standalone: true,
    templateUrl: './template.html',
    styleUrls: ['./style.scss'],
    imports: [NgApexchartsModule, MatIconModule, NgIf],
})
export class BarChartComponent implements OnInit, OnChanges {

    @Input() selectedDate: Date | null = null; // Receive selectedDate from the parent component
    @ViewChild("chartContainer1", { read: ElementRef }) chartContainer!: ElementRef;
    chartOptions: Partial<ApexOptions> = {};
    public data: DataSaleResponse;
    public year: string = '';
    public week: string = ''; // Store week as a filter

    // English to Khmer day name mapping
    private dayMapping: { [key: string]: string } = {
        'Monday': 'ចន្ទ',
        'Tuesday': 'អង្គារ',
        'Wednesday': 'ពុធ',
        'Thursday': 'ព្រហស្បតិ៍',
        'Friday': 'សុក្រ',
        'Saturday': 'សៅរ៍',
        'Sunday': 'អាទិត្យ'
    };

    constructor(
        private _cdr: ChangeDetectorRef,
        private _snackBarService: SnackbarService,
        private _dashboardService: DashbordService // Inject the service
    ) { }

    ngOnInit(): void {
        this.fetchData(); // Fetch data without filters on initialization
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['selectedDate'] && this.selectedDate) {
            this.year = format(this.selectedDate, 'yyyy'); // Extract year from selectedDate
            this.week = getISOWeek(this.selectedDate).toString(); // Extract ISO week from selectedDate
            this.fetchData(this.year, this.week); // Fetch data based on the new year and week
        } else {
            this.fetchData(); // Fetch data without filters if no date is selected
        }
    }

    private fetchData(year?: string, week?: string): void {
        this._dashboardService.getDataSale(year, week)
            .subscribe({
                next: (response: DataSaleResponse) => {
                    let labels = response?.labels || [];
                    let data = response?.data || [];
                    labels = labels.map((label: string) => this.dayMapping[label] || label);

                    if (labels.length && data.length) {
                        this.updateChart(labels, data);
                    } else {
                        this._snackBarService.openSnackBar('No data available', 'Info');
                    }
                },
                error: (err) => {
                    const errorMessage = err.error?.message || 'Error fetching data';
                    this._snackBarService.openSnackBar(errorMessage, 'Error');
                }
            });
    }

    private updateChart(labels: string[], data: number[]): void {
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
                { name: "ចំនួនលក់", data: data, color: '#3D5AFE' }
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
                labels: { colors: '#64748b', useSeriesColors: false }
            },
            xaxis: {
                categories: labels
            },
            yaxis: {
                min: 0,
                max: Math.max(...data) + 10000,
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

        this._cdr.detectChanges(); // Trigger change detection to update the chart
    }

    private modifyGridLines(): void {
        const verticalGridLines = this.chartContainer.nativeElement.querySelectorAll('.apexcharts-gridlines-vertical line');
        if (verticalGridLines.length > 0) {
            verticalGridLines[0].style.strokeDasharray = '0'; // First vertical line
            verticalGridLines[verticalGridLines.length - 1].style.strokeDasharray = '0'; // Last vertical line
        }
    }
}
