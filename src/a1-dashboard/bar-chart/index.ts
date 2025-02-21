import { NgIf } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnInit,
    SimpleChanges, ViewChild
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SnackbarService } from 'helper/services/snack-bar/snack-bar.service';
import { ApexOptions, NgApexchartsModule } from "ng-apexcharts";
import { DashbordService } from '../service';
import { BarChart, DataSaleResponse } from '../interface';
import { MatMenu, MatMenuModule } from '@angular/material/menu';
@Component({
    selector: 'sup-bar-chart',
    standalone: true,
    templateUrl: './template.html',
    styleUrls: ['./style.scss'],
    imports: [NgApexchartsModule, MatIconModule, NgIf, MatMenuModule],
})
export class BarChartComponent implements OnInit, OnChanges, AfterViewInit {
    // @Input() selectedDate: { thisWeek?: string; thisMonth?: string; threeMonthAgo?: string; sixMonthAgo?: string } | null = null;
    @Input() year !: number
    @ViewChild("chartContainer", { read: ElementRef }) chartContainer!: ElementRef;

    chartOptions: Partial<ApexOptions> = {};
    public data: DataSaleResponse | null = null;

    constructor(
        private _cdr              : ChangeDetectorRef,
        private _snackBarService  : SnackbarService,
        private _dashboardService : DashbordService
    ) { }

    ngOnInit(): void {
        this.fetchColumnChart(this.year); // Fetch data when component is initialized
        console.log("fetching data with ", this.year)
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['year'] && this.year) {
            this.fetchColumnChart(this.year);
        }
    }


    ngAfterViewInit(): void {
        this.modifyGridLines(); // Ensure the element is available
    }


    monthMapping = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    totalIncomeMapping = []
    totalExpenseMapping = []


    //fetch Data for barchart statistics:
    private fetchColumnChart(year: number): void {
        this._dashboardService.getBarStatistics(this.year).subscribe({
            next: (response: BarChart) => {
                const month = response?.data?.statistics.map(stat => this.monthMapping[stat.month - 1] || `Month ${stat.month}`)
                const totalIncome = response?.data?.statistics.map(stat => stat.totalIncomeUSD)
                const totalExpense = response?.data?.statistics.map(stat => stat.totalExpenseUSD)
                
                console.log(totalIncome)
                console.log(totalExpense)
                if (totalIncome.length && totalExpense) {
                    this.updateBarChart(month, totalIncome, totalExpense);
                } else {
                    // this._snackBarService.openSnackBar('No Data available', 'info');
                    console.log('error fetching')
                }
            },
            error: (err) => {
                const errorMessage = err.error?.message || 'Error fetching Data';
                this._snackBarService.openSnackBar(errorMessage, 'Error');
            }

        })
    }

    // years = [2020, 2021, 2022, 2023, 2024]; // Example years list
    selectedYear = 2024;
    thisYear = new Date().getFullYear()
    years = []


    onYearChange(event: any) {
        this.selectedYear = event.target.value;
        // Handle the year change logic here (e.g., update chart data)
    }

    private updateBarChart(labels: string[], totalIncome: number[], totalExpense: number[]): void {
        for (let i = 0; i <= 5; i++) {
            this.years.push(this.thisYear - i);
        }

        const maxValue = Math.max(...totalIncome) + (Math.max(...totalIncome) * 0.1);
        // console.log(maxValue)
        const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)) - 1); // Second significant digit
        // console.log(magnitude)
        const roundedMaxValue = Math.ceil(maxValue / magnitude) * magnitude;
        console.log(roundedMaxValue)
        const mag = Math.pow(10, Math.floor(Math.log10(roundedMaxValue)))
        const roundedroundMaxValue = Math.ceil(roundedMaxValue / mag) * mag
        console.log('roundedround', roundedroundMaxValue)
        console.log('Plotting on ', totalIncome)
        console.log(maxValue)
        this.chartOptions = {
            chart: {
                height: 236,
                // width: 250,
                type: 'bar',
                fontFamily: 'Barlow, Kantumruy Pro sans-serif',
                foreColor: '#6e729b',
                toolbar: { show: false },
            },
            // stroke: { curve: 'smooth', width: 0 },
            series: [
                { name: 'ចំណូល', data: totalIncome, color: '#16A34A' },
                { name: 'ចំណាយ', data: totalExpense, color: '#FFBF00' }
            ],
            plotOptions: { bar: { columnWidth: "80%" } },
            dataLabels: { enabled: false },
            legend: {
                position: 'bottom',
                floating: true,
                horizontalAlign: 'center', // Align legend to the left
                offsetY: 0, // Adjust vertical offset as needed
                offsetX: 0, // Adjust horizontal offset as needed
                fontWeight: 400,
                fontSize: '18px',
                labels: { colors: '#64748b', useSeriesColors: false },
                itemMargin: {
                    vertical: -5 // Adjust this value to add vertical margin between the legend items
                }
            },
            xaxis: {
                categories: labels,
                // title: {text: 'Months'},
            },
            yaxis: {
                min: 0,
                max: roundedroundMaxValue,
                tickAmount: Math.ceil(roundedroundMaxValue / (roundedroundMaxValue * 0.2)),
                labels: {
                    // formatter: (value: number) =>
                    // value >= 1_000 ? (value / 1_000).toFixed(1) + 'k' : value.toString(),
                    formatter: (value: number) => {
                        if (value >= 1000) {
                            // Convert to 'k' format
                            return (value / 1000) + 'k';
                        }
                        return value.toString(); // For values less than 1000
                    }
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
        if (this.chartContainer) {
            const verticalGridLines = this.chartContainer.nativeElement.querySelectorAll('.apexcharts-gridlines-vertical line');
            if (verticalGridLines.length > 0) {
                verticalGridLines[0].style.strokeDasharray = '0';
                verticalGridLines[verticalGridLines.length - 1].style.strokeDasharray = '0';
            }
        }
    }
}
