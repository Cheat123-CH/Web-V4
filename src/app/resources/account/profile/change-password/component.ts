// ================================================================>> Core Library (Angular)
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

// ================================================================>> Third Party Library (material)
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// ================================================================>> Custom Library (Application-specific)
import { SnackbarService } from 'helper/services/snack-bar/snack-bar.service';
import { ProfileService } from '../profile.service';
import GlobalConstants from 'helper/shared/constants';

@Component({
    selector: 'profile-change-password',
    standalone: true,
    templateUrl: './component.html',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule
    ]
})

export class ChangePasswordComponent implements OnInit {

    passwordForm: UntypedFormGroup;
    saving: boolean = false;

    constructor(

        private formBuilder: UntypedFormBuilder,
        private snackBarService: SnackbarService,
        private profileService: ProfileService
    ) { }

    ngOnInit(): void {

        // Initialize the form when the component is created
        this.ngBuilderForm();
    }

    ngBuilderForm(): void {

        // Build the password form using the Angular reactive forms approach
        this.passwordForm = this.formBuilder.group({
            current_password: [null, [Validators.required]],
            new_password: [null, [Validators.required]],
            confirm_password: [null, [Validators.required]]
        });
    }

    submit(): void {

        // Disable the form during the submission
        this.passwordForm.disable();

        // Call the profile service to update the user's password
        this.profileService.password(this.passwordForm.value).subscribe({

            next: response => {

                // Enable the form after a successful password update
                this.passwordForm.enable();

                // Show a success message using the snackbar service
                this.snackBarService.openSnackBar(response.message, GlobalConstants.success);
            },

            error: (err: HttpErrorResponse) => {
                console.log("hello");
                // Enable the form after an error and show an error message
                this.passwordForm.enable();

                // Extract error details, if available, and construct an error message
                const errors: { type: string, message: string }[] | undefined = err.error?.errors;
                let message: string = err.error?.message ?? GlobalConstants.genericError;

                // If there are field-specific errors, concatenate them for display
                if (errors && errors.length > 0) {
                    message = errors.map((obj) => obj.message).join(', ')
                }

                // Show the error message using the snackbar service
                this.snackBarService.openSnackBar(message, GlobalConstants.error);
            }
        });
    }
}
