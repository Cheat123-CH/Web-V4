// ================================================================================>> Core Library
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

// ================================================================================>> Third Party Library
// ===>> Material
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector    : 'admin-student-filter-dialog',
    standalone  : true,
    templateUrl : './template.html',
    styleUrl    : './style.scss',
    imports     : [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatDialogModule,
        MatFormFieldModule,
        MatProgressSpinnerModule,
    ],
})
export class FilterDialogComponent {

    // ===>> Give data to Parent Component
    @Output() filterSubmitted = new EventEmitter<any>();

    public filter : UntypedFormGroup;
    public setup  : any = null;

    constructor(
        public dialogRef: MatDialogRef<FilterDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data : any,

        private _formBuilder: UntypedFormBuilder,
    ) {}

    ngOnInit(): void {

        this.setup = this.data.setup;
        this.ngBuilderForm();
    }

    ngBuilderForm(): void {
        this.filter = this._formBuilder.group({
            type_id            : [this.data.filter.type_id     ?? ''],
            name               : [this.data.filter.name             ?? ''],
            // province           : [this.data.filter.province           ?? ''],
            // tracking_status    : [this.data.filter.tracking_status    ?? ''],
            // scholarship_status : [this.data.filter.scholarship_status ?? ''],
        });
    }

    submit(): void {

        this.filterSubmitted.emit(this.filter.value);
        this.dialogRef.close();
    }

    reset(): void{
        this.filter.reset();
        // this.filterSubmitted.emit(this.filter.value);
    }

    closeDialog(): void {
        this.filter.reset();
        this.dialogRef.close();
    }
}
