// ================================================================================>> Core Library
import { CommonModule } from '@angular/common';
import { Component, Inject, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

// ================================================================================>> Thrid Party Library
// Material
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';

// ================================================================================>> Custom Library
// Core
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';

// Helper
import { PortraitComponent } from 'helper/components/portrait/portrait.component';
import { SnackbarService } from 'helper/services/snack-bar/snack-bar.service';


// Environment
import { env } from 'envs/env';

// Local
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import GlobalConstants from 'helper/shared/constants';
import { ProfileService } from '../profile.service';
import { ResponseProfile } from '../profile.type';

@Component({
    selector: 'update-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatRadioButton, ReactiveFormsModule, MatButtonModule, MatIcon, MatIconModule, MatInputModule, MatSelectModule, MatOptionModule, MatDialogModule, MatDividerModule, MatFormFieldModule, PortraitComponent, MatRadioGroup],
    templateUrl: './template.html',
    styleUrls: ['./style.scss']
})
export class UpdateProfileDialogComponent {

    @Input() user: any;

    public form: UntypedFormGroup;
    public src: string = 'assets/images/avatars/avatar.jpeg';
    opened: boolean = true;
    public loading: boolean;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: User,
        private readonly _dialogRef: MatDialogRef<UpdateProfileDialogComponent>,
        private readonly _formBuilder: UntypedFormBuilder,
        private readonly _accountService: ProfileService,
        private readonly _snackBarService: SnackbarService,
    ) { }

    ngOnInit(): void {
        // Trim any leading slash from avatar path and ensure base URL ends with one
        const avatarPath = this.data.avatar.replace(/^\/+/, '');
        this.src = `${env.FILE_BASE_URL.replace(/\/?$/, '/')}${avatarPath}`;
        this.ngBuilderForm();
        console.log(this.form);
    }

    ngBuilderForm(): void {
        this.form = this._formBuilder.group({
            avatar: [null],
            name: [this.data?.name, Validators.required],
            email: [this.data?.email, [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]],
            phone: [this.data?.phone, [Validators.required, Validators.pattern("^[0-9]*$")]],
        });
    }

    srcChange(base64: string): void {
        this.form.get('avatar').setValue(base64);
    }

    submit(): void {
        this.loading = true;
        this.form.disable();

        // Remove the avatar field if it is not present in the form
        if (!this.form.value.avatar) {
            this.form.removeControl('avatar');
        }

        // Call the profile update service
        this._accountService.profile(this.form.value).subscribe({
            next: (res: ResponseProfile) => {
                // Update the token in local storage/session storage with the new token
                if (res.token) {
                    // Remove the old token
                    localStorage.removeItem('accessToken'); // Or sessionStorage, based on your setup

                    // Store the new token
                    localStorage.setItem('accessToken', res.token); // Or sessionStorage, based on your setup
                }

                // Reload the page to reflect the new profile changes
                window.location.reload(); // Use window.location.reload() to reload the page

                // Show success message
                this._snackBarService.openSnackBar(res.message, GlobalConstants.success);

                // Close the dialog
                this._dialogRef.close();
            },
            error: (err) => {
                console.error('Error updating profile:', err);

                // Extracting the error message from the response
                const errorMessage = err?.error?.message || 'An error occurred while updating the profile.';

                // Display the error message using Snackbar
                this._snackBarService.openSnackBar(errorMessage, GlobalConstants.error);

                // Enable the form again after an error
                this.form.enable();
            },
            complete: () => {
                this.loading = false; // Stop the loading indicator
            }
        });
    }

    onFileChange(event: any): void {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.src = e.target.result; // Preview image
                this.form.get('avatar')?.setValue(e.target.result); // Base64 string
            };
            reader.readAsDataURL(file);
        } else {
            this._snackBarService.openSnackBar('Please select an image file.', GlobalConstants.error);
        }
    }

    close(): void {
        this._dialogRef.close();
        this.opened = false;
    }

}
