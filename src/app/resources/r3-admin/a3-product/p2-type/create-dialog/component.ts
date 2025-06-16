
// ================================================================================>> Core Library
import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

// ================================================================================>> Thrid Party Library
// Material
import { HttpErrorResponse } from '@angular/common/http';
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
import { env } from 'envs/env';
import { PortraitComponent } from 'helper/components/portrait/component';
import { SnackbarService } from 'helper/services/snack-bar/snack-bar.service';
import GlobalConstants from 'helper/shared/constants';
import { Subject } from 'rxjs';
import { ProductTypeService } from '../service';
import { Item } from '../interface';
@Component({
    selector: 'create-car-type-component-seletor',
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
export class CreateDialogComponent implements OnInit, OnDestroy {

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    // EventEmitter to emit response data after create or update operations
    ResponseData = new EventEmitter<Item>();

    // Form related properties
    public form   : UntypedFormGroup;
    public saving : boolean = false;
    public src    : string = 'icons/image.jpg';

    // Constructor with dependency injection
    constructor(

        @Inject(MAT_DIALOG_DATA) public data,

        private _dialogRef         : MatDialogRef<CreateDialogComponent>,
        private _formBuilder       : UntypedFormBuilder,
        private _snackBarService   : SnackbarService,
        private _service          : ProductTypeService,
    ) { }

    // Lifecycle hook: ngOnInit
    ngOnInit(): void {

        // Initialize the form on component initialization
        this.ngBuilderForm();

    }

    // Method to build the form using the form builder
    ngBuilderForm(): void {

        // Create the form group with initial values
        this.form = this._formBuilder.group({
            name    : [null, [Validators.required]],
            image   : [null, [Validators.required]],
        });
    }

    // Method to handle form submission
    submit() {

        // Disable dialog close while the operation is in progress
        this._dialogRef.disableClose = true;

        // Set the saving flag to true to indicate that the operation is in progress
        this.saving = true;

        // Call the typeService to create a new type
        this._service.create(this.form.value).subscribe({

            next: response => {

                // Update the number of products (assuming it's a property of the returned data)
                response.data.n_of_products = 0;

                // Emit the response data using the EventEmitter
                this.ResponseData.emit(response.data);

                // Close the dialog
                this._dialogRef.close();

                // Reset the saving flag
                this.saving = false;

                // Display a success snackbar
                this._snackBarService.openSnackBar(response.message, GlobalConstants.success);
            },

            error: (err: HttpErrorResponse) => {

                // Re-enable dialog close
                this._dialogRef.disableClose = false;

                // Reset the saving flag
                this.saving = false;

                // Handle and display errors
                this.handleErrors(err);
            }
        });
    }

    // srcChange method
    srcChange(base64: string): void {
        // Set the 'image' form control value with the provided base64 image data
        this.form.get('image').setValue(base64);
    }

    onFileChange(event: any): void {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.src = e.target.result; // Preview image
                this.form.get('image')?.setValue(e.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            this._snackBarService.openSnackBar('Please select an image file.', GlobalConstants.error);
        }
    }

    // Helper method to handle and display errors
    private handleErrors(err: HttpErrorResponse): void {

        const errors: { type: string, message: string }[] | undefined = err.error?.errors;
        let message: string = err.error?.message ?? GlobalConstants.genericError;

        if (errors && errors.length > 0) {
            message = errors.map((obj) => obj.message).join(', ');
        }

        // Display error snackbar
        this._snackBarService.openSnackBar(message, GlobalConstants.error);
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    closeDialog() {
        this._dialogRef.close();
    }
}
