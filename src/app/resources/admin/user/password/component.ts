// ================================================================================>> Core Library
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// ================================================================================>> Thrid Party Library
// Material
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
// ================================================================================>> Custom Library

@Component({
    selector: 'change-password-manager',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule],
    templateUrl: './template.html',
    styleUrls: ['./style.scss']
})
export class ChangePasswordComponentForManager {
    changePasswordForm: UntypedFormGroup;
    @Output() onServiceAdded = new EventEmitter<void>();
    saving = false;
    constructor(
        @Inject(MAT_DIALOG_DATA) public id: number,
        private readonly formBuilder: UntypedFormBuilder,
        private dialogRef: MatDialogRef<ChangePasswordComponentForManager>,
        private _snackBarService: SnackbarService,
        private _service: ManagerGeneralManagerService,

    ) { }

    ngOnInit(): void {
        this.changePasswordForm = this.formBuilder.group({
            new_password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
            confirm_password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]]
        }, { validators: this.passwordMatchValidator });
    }

    private passwordMatchValidator(formGroup: FormGroup): ValidationErrors | null {
        const newPassword = formGroup.get('new_password');
        const confirmPassword = formGroup.get('confirm_password');

        if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
            return { passwordMismatch: true };
        }
        return null;
    }

    onSubmit() {
        if (this.changePasswordForm.valid && !this.saving) {
            this.saving = true;
            const id = this.id;
            const body = {
                id: id,
                new_password: this.changePasswordForm.value.confirm_password
            };
            console.log(body)
            this._service.updatePassword(body).subscribe({
                next: (response) => {
                    this.dialogRef.close();
                    this._snackBarService.openSnackBar(response.message, 'Success');
                },
                error: (err: HttpErrorResponse) => {
                    this.saving = false;

                    // Default error message
                    let message: string = 'An error occurred. Please try again.';

                    // Check if the error response has a specific error message
                    if (err.error && err.error.message) {
                        message = err.error.message;
                    }

                    // Check if there are validation errors
                    if (err.error && err.error.errors) {
                        const errors: { field: string, message: string }[] = err.error.errors;
                        if (errors.length > 0) {
                            message = errors.map((obj) => obj.message).join(', ');
                        }
                    }

                    // Display the error message
                    this._snackBarService.openSnackBar(message, 'error');
                },
                complete: () => {
                    this.saving = false;
                }
            });
        }
    }

    closeDialog() {
        this.dialogRef.close();
    }
}
