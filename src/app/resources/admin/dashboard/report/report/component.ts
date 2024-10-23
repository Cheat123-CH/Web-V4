
// ================================================================================>> Core Library
import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

// ================================================================================>> Thrid Party Library
// Material
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { HttpErrorResponse } from '@angular/common/http';
import { format } from 'date-fns-tz';
import FileSaver from 'file-saver';
import { PortraitComponent } from 'helper/components/portrait/portrait.component';
import { SnackbarService } from 'helper/services/snack-bar/snack-bar.service';
import GlobalConstants from 'helper/shared/constants';
import { Subject } from 'rxjs';
import { DashbordService } from '../../dashboards.service';
@Component({
    selector: 'app-report-generate',
    templateUrl: './template.html',
    styleUrls: ['./style.scss'],
    standalone: true,
    imports: [
        RouterModule,
        FormsModule,
        MatIconModule,
        CommonModule,
        MatTooltipModule,
        AsyncPipe,
        MatProgressSpinnerModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatOptionModule,
        MatAutocompleteModule,
        MatDatepickerModule,
        MatButtonModule,
        MatMenuModule,
        MatDividerModule,
        MatRadioModule,
        MatDialogModule,
        PortraitComponent
    ]
})
export class ReportGenerateComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    saving: boolean = false;
    filterForm: UntypedFormGroup;

    public dateType = [
        { id: 'today', name: 'ថ្ងៃនេះ' },
        { id: 'thisWeek', name: 'សប្តាហ៍នេះ' },
        { id: 'thisMonth', name: 'ខែនេះ' },
        { id: 'lastMonth', name: 'ខែមុន' },
        { id: '3MonthAgo', name: '3 ខែមុន' },
        { id: '6MonthAgo', name: '6 ខែមុន' },
        { id: 'startandend', name: 'ជ្រើសរើសអំឡុងពេល' }
    ];

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { type: number },
        private dialogRef: MatDialogRef<ReportGenerateComponent>,
        private formBuilder: UntypedFormBuilder,
        private snackBarService: SnackbarService,
        private _service: DashbordService
    ) { }

    ngOnInit(): void {
        console.log(this.data.type)
        this.ngBuilderForm();
        this.handleTimeTypeChanges();
    }

    // Initialize the form with default values
    ngBuilderForm(): void {
        const today = this.getTodayInCambodia();
        this.filterForm = this.formBuilder.group({
            timeType: ['today'], // Default to 'today'
            startDate: [{ value: today, disabled: true }, Validators.required],
            endDate: [{ value: today, disabled: true }, Validators.required]
        });
    }

    // Handle changes to the timeType field
    handleTimeTypeChanges(): void {
        this.filterForm.get('timeType')!.valueChanges.subscribe((value) => {
            if (value === 'startandend') {
                this.filterForm.get('startDate')!.enable();
                this.filterForm.get('endDate')!.enable();
            } else {
                const { startDate, endDate } = this.calculateDateRange(value);
                this.filterForm.patchValue({ startDate, endDate });

                this.filterForm.get('startDate')!.disable();
                this.filterForm.get('endDate')!.disable();
            }
        });
    }

    // Calculate date ranges based on the selected type
    calculateDateRange(type: string): { startDate: Date; endDate: Date } {
        const now = new Date();
        let startDate = new Date();
        let endDate = new Date();

        switch (type) {
            case 'today':
                startDate = endDate = this.getTodayInCambodia();
                break;

            case 'thisWeek':
                const dayOfWeek = now.getDay(); // Get the current day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
                const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek; // Calculate the difference to get to Monday

                startDate = new Date(now);
                startDate.setDate(now.getDate() + diffToMonday); // Set to Monday
                startDate.setHours(0, 0, 0, 0); // Start of the day on Monday

                endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 6); // Set to Sunday
                endDate.setHours(23, 59, 59, 999); // End of the day on Sunday
                break;

            case 'thisMonth':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1); // 1st day of the current month
                startDate.setHours(0, 0, 0, 0); // Start of the day

                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of the current month (30th or 31st)
                endDate.setHours(23, 59, 59, 999); // End of the day
                break;

            case 'lastMonth':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1); // 1st day of the previous month
                startDate.setHours(0, 0, 0, 0); // Start of the day

                endDate = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of the previous month
                endDate.setHours(23, 59, 59, 999); // End of the day
                break;

            case '3MonthAgo':
                startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1); // 1st day of the month three months ago
                startDate.setHours(0, 0, 0, 0); // Start of the day

                endDate = new Date(now.getFullYear(), now.getMonth() - 2, 0); // Last day of the month three months ago
                endDate.setHours(23, 59, 59, 999); // End of the day
                break;

            case '6MonthAgo':
                startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1); // 1st day of the month six months ago
                startDate.setHours(0, 0, 0, 0); // Start of the day

                endDate = new Date(now.getFullYear(), now.getMonth() - 5, 0); // Last day of the month six months ago
                endDate.setHours(23, 59, 59, 999); // End of the day
                break;
        }

        return { startDate, endDate };
    }

    // Helper method to get today's date in Cambodian timezone (UTC+7)
    getTodayInCambodia(): Date {
        const now = new Date();
        const timeZone = 'Asia/Phnom_Penh';
        const formattedDate = format(now, 'yyyy-MM-dd', { timeZone });
        return new Date(formattedDate);
    }

    submit(): void {
        if (this.filterForm.valid) {
            const formValue = this.filterForm.value;
            let { startDate, endDate } = formValue;

            // If a predefined timeType is selected, calculate the dates
            if (formValue.timeType !== 'startandend') {
                const { startDate: calculatedStart, endDate: calculatedEnd } = this.calculateDateRange(formValue.timeType);
                startDate = calculatedStart;
                endDate = calculatedEnd;
            }
            // Call the service with formatted startDate and endDate
            this.saving = true;
            if (this.data.type === 1) {
                this._service.getDataSaleReport(this.formatDate(startDate), this.formatDate(endDate)).subscribe({
                    next: (response) => {
                        this.dialogRef.close();
                        this.saving = false;
                        const blob = this.b64toBlob(response.data, 'application/pdf');
                        FileSaver.saveAs(blob, 'របាយការណ៍លក់រាយ.pdf');
                        this.snackBarService.openSnackBar('របាយការណ៍ទាញយកបានជោគជ័យ', GlobalConstants.success);
                    },
                    error: (err: HttpErrorResponse) => {
                        this.dialogRef.disableClose = false;
                        this.saving = false;
                        const errors = err.error?.errors;
                        let message = err.error?.message ?? GlobalConstants.genericError;
                        if (errors && errors.length > 0) {
                            message = errors.map((obj) => obj.message).join(', ');
                        }
                        this.snackBarService.openSnackBar(message, GlobalConstants.error);
                    }
                });
            }
            else if (this.data.type === 2) {
                this._service.getDataCashierReport(this.formatDate(startDate), this.formatDate(endDate)).subscribe({
                    next: (response) => {
                        // Close the dialog
                        this.dialogRef.close();

                        this.saving = false;
                        let blob = this.b64toBlob(response.data, 'application/pdf');
                        FileSaver.saveAs(blob, 'របាយការណ៍លក់តាមអ្នក គិតប្រាក់' + '.pdf');
                        // Show a success message using the snackBarService
                        this.snackBarService.openSnackBar('របាយការណ៍ទាញយកបានជោគជ័យ', GlobalConstants.success);
                    },
                    error: (err: HttpErrorResponse) => {
                        // Re-enable closing the dialog in case of an error
                        this.dialogRef.disableClose = false;
                        // Set saving to false to indicate the operation is completed (even if it failed)
                        this.saving = false;
                        // Extract error information from the response
                        const errors: { type: string; message: string }[] | undefined = err.error?.errors;
                        let message: string = err.error?.message ?? GlobalConstants.genericError;

                        // If there are field-specific errors, join them into a single message
                        if (errors && errors.length > 0) {
                            message = errors.map((obj) => obj.message).join(', ');
                        }
                        // Show an error message using the snackBarService
                        this.snackBarService.openSnackBar(message, GlobalConstants.error);
                    },
                });
            } else {
                this._service.getDataProductReport(this.formatDate(startDate), this.formatDate(endDate)).subscribe({
                    next: (response) => {
                        // Close the dialog
                        this.dialogRef.close();

                        this.saving = false;
                        let blob = this.b64toBlob(response.data, 'application/pdf');
                        FileSaver.saveAs(blob, 'របាយការណ៍លក់តាមផលិតផល' + '.pdf');
                        // Show a success message using the snackBarService
                        this.snackBarService.openSnackBar('របាយការណ៍ទាញយកបានជោគជ័យ', GlobalConstants.success);
                    },
                    error: (err: HttpErrorResponse) => {
                        // Re-enable closing the dialog in case of an error
                        this.dialogRef.disableClose = false;
                        // Set saving to false to indicate the operation is completed (even if it failed)
                        this.saving = false;
                        // Extract error information from the response
                        const errors: { type: string; message: string }[] | undefined = err.error?.errors;
                        let message: string = err.error?.message ?? GlobalConstants.genericError;

                        // If there are field-specific errors, join them into a single message
                        if (errors && errors.length > 0) {
                            message = errors.map((obj) => obj.message).join(', ');
                        }
                        // Show an error message using the snackBarService
                        this.snackBarService.openSnackBar(message, GlobalConstants.error);
                    },
                });
            }
        } else {
            this.snackBarService.openSnackBar('Please fill in the required fields.', 'Error');
        }
    }

    // =================================>> Convert base64 to blob
    b64toBlob(b64Data: string, contentType: string, sliceSize?: number) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;
        var byteCharacters = atob(b64Data);
        var byteArrays = [];
        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);
            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        var blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }

    // Helper method to format the date as 'YYYY-MM-DD'
    formatDate(date: Date | string): string {
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    }


    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    closeDialog(): void {
        this.dialogRef.close();
    }
}

