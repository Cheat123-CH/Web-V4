import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatDialogClose } from '@angular/material/dialog';
import { MatFormField, MatLabel, MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { OnInit } from '@angular/core';
import { MatInput } from '@angular/material/input';
import { MatInputModule } from '@angular/material/input';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatCommonModule, MatOption, MatOptionModule } from '@angular/material/core';
import { NgFor, NgIf } from '@angular/common';
import { SnackbarService } from 'helper/services/snack-bar/snack-bar.service';
import { DashbordService } from '../../service';
@Component({
  selector: 'app-exportreport',
  standalone: true,
  imports: [
    MatIcon,
    MatDialogClose,
    MatFormField,
    MatLabel,
    MatDatepicker,
    MatInput,
    MatInputModule,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSelect,
    MatSelectModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatCommonModule,
    MatOption,
    MatOptionModule,
    NgFor,
    NgIf,
  ],
  templateUrl: './template.html',
  styleUrl: './style.scss'
})

export class ExportreportComponent implements OnInit {

  yearOption       : number[] = [];
  dayErrorMessage  : boolean = false;
  currentMonthName : string = '';  // To store the month name
  isLoading        : boolean = false

  constructor(
    private _dialogRef        : MatDialogRef<ExportreportComponent>,
    private _snackbarService  : SnackbarService,
    private _dashboardService : DashbordService,
  ) {}

  exportForm!: FormGroup<{
    day: FormControl<number | null>;
    month: FormControl<number | null>;
    year: FormControl<number | null>;
  }>;

  monthOption = [
    { value: 1, month: 'មករា' },
    { value: 2, month: 'កុម្ភៈ' },
    { value: 3, month: 'មិនា' },
    { value: 4, month: 'មេសា' },
    { value: 5, month: 'ឧសភា' },
    { value: 6, month: 'មិថុនា' },
    { value: 7, month: 'កក្កដា' },
    { value: 8, month: 'សីហា' },
    { value: 9, month: 'កញ្ញា' },
    { value: 10, month: 'តុលា' },
    { value: 11, month: 'វិច្ឋិកា' },
    { value: 12, month: 'ធ្នូ' },
  ];

  ngOnInit(): void {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1; // getMonth() returns month index (0-based), so add 1
    const currentYear = today.getFullYear();

    const selectedMonth = this.monthOption.find(m => m.value === currentMonth);
    if (selectedMonth) {
      this.currentMonthName = selectedMonth.month; // Set the month name for display
    }
    this.exportForm = new FormGroup({
      day: new FormControl(currentDay),
      month: new FormControl(currentMonth),
      year: new FormControl(currentYear),
    });

    // Populate the year options for the last 10 years
    for (let i = 0; i < 10; i++) {
      this.yearOption.push(currentYear - i);
    }
  }


  getReportExport(): void {
    console.log(this.exportForm.value);
    const monthSelected = this.exportForm.get('month')?.value;
    const yearSelected = this.exportForm.get('year')?.value;

    // Helper function to check for leap year
    const isLeapYear = (year: number): boolean => {
      return (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0));
    };

    // Check if day is valid for the selected month
    const day = this.exportForm.get('day')?.value;

    if (monthSelected && day) {
      // Validate day for months with 31 days
      if ([1, 3, 5, 7, 8, 10, 12].includes(monthSelected)) {
        if (day > 31) {
          this._snackbarService.openSnackBar('ថ្ងៃមិនអាចលើសពី ៣១ ទេ', 'error');
        }
      }
      // Validate day for February (non-leap year)
      else if (monthSelected === 2 && !isLeapYear(yearSelected)) {
        if (day > 28) {
          this._snackbarService.openSnackBar('ថ្ងៃមិនអាចលើសពី ២៨ ទេ', 'error');
        }
      }
      // Validate day for February (leap year)
      else if (monthSelected === 2 && isLeapYear(yearSelected)) {
        if (day > 29) {
          this._snackbarService.openSnackBar('ថ្ងៃមិនអាចលើសពី ២៩ ទេ', 'error');
        }
      }
      // Validate day for months with 30 days
      else if ([4, 6, 9, 11].includes(monthSelected)) {
        if (day > 30) {
          this._snackbarService.openSnackBar('ថ្ងៃមិនអាចលើសពី ៣០ ទេ', 'error');
        }
      }
    }


    this.isLoading = true
    this._snackbarService.openSnackBar('កំពុងធ្វើការទាញយក', 'done')
    this._dashboardService.getExpenseReport().subscribe({
      next: (response: { data: string }) => {
        this.isLoading = false
        const base64Data = response.data; // Map to the data property
        const binaryData = atob(base64Data); // Decode Base64 string
        const arrayBuffer = new Uint8Array(binaryData.length);

        for (let i = 0; i < binaryData.length; i++) {
          arrayBuffer[i] = binaryData.charCodeAt(i);
        }

        const blob = new Blob([arrayBuffer], { type: 'application/pdf' }); // Set file MIME type
        const url = window.URL.createObjectURL(blob);

        // Create a download link and click it programmatically
        const a = document.createElement('a');
        a.href = url;
        a.download =`ចំណាយ ${monthSelected}.pdf`; // File name
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        this._snackbarService.openSnackBar('ទាញយកបានជោគជ័យ', 'done')
      },
      error :(err) =>{
        this._snackbarService.openSnackBar('ទាញយកមិនបានជោគជ័យ', 'error')

      }
    })
  }
  }

