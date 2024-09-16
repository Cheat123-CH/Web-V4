// ================================================================================>> Core Library
import { CommonModule } from '@angular/common';
import { Component, Inject, Input } from '@angular/core';
import { AbstractControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

// ================================================================================>> Thrid Party Library
// Material
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioGroup } from '@angular/material/radio';
import { MatRadioButton } from '@angular/material/radio';
import { MatIcon } from '@angular/material/icon';

// Decoder
import jwt_decode from 'jwt-decode';

// ================================================================================>> Custom Library
// Core
import { User } from 'app/core/user/user.types';
import { UserService } from 'app/core/user/user.service';

// Helper
import { SnackbarService } from 'helper/services/snack-bar/snack-bar.service';
import { PortraitComponent } from 'helper/components/portrait/portrait.component';


// Environment
import { env } from 'envs/env';

// Local
import { ProfileService } from '../profile.service';
import { AuthService } from 'app/core/auth/auth.service';
import { Router } from '@angular/router';
import { ResponseProfile } from '../profile.type';
import GlobalConstants from 'helper/shared/constants';

@Component({
    selector: 'update-form',
    standalone: true,
    imports: [CommonModule, FormsModule,MatRadioButton, ReactiveFormsModule, MatButtonModule, MatIcon,MatIconModule, MatInputModule, MatSelectModule, MatOptionModule, MatDialogModule, MatDividerModule, MatFormFieldModule, PortraitComponent,MatRadioGroup],
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
        private readonly _userService: UserService,
        private _authService: AuthService,
        private _router: Router
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
            email: [this.data?.email, [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")] ],
            phone: [this.data?.phone, [Validators.required, Validators.pattern("^[0-9]*$")] ],
            sex_id: [null], // Include this line for sex_id
        });
    }


    // private usernameValidator(control: AbstractControl): { [key: string]: any } | null {
    //     const forbidden = /[^\w]/.test(control.value);
    //     return forbidden ? { 'forbiddenUsername': { value: control.value } } : null;
    // }

    srcChange(base64: string): void {
        this.form.get('avatar').setValue(base64);
    }
    submit(): void {
        this.loading = true;
        this.form.disable();

        if (!this.form.value.avatar) {
            this.form.removeControl('avatar');
        }

        this._accountService.profile(this.form.value).subscribe({
            next: (res: ResponseProfile) => {
                // Log the full response for debugging
                console.log('Full Response:', res);

                // Extract avatar URL if available
                const avatarPath = res.data?.user?.avatar;
                if (avatarPath) {
                    const avatarUrl = `${env.FILE_BASE_URL.replace(/\/?$/, '/')}${avatarPath}`;
                    this.src = avatarUrl;
                    console.log('Avatar URL:', this.src);
                } else {
                    console.error('Avatar not found in response.');
                }

                this._snackBarService.openSnackBar(res.message, GlobalConstants.success);
                this._dialogRef.close();
                this._authService.signOut();
                this._router.navigateByUrl('/auth/sign-in');
            },
            error: (err) => {
                console.error('Error updating profile:', err);

                // Extracting the error message from the response
                const errorMessage = err?.error?.message || 'An error occurred while updating the profile.';

                // Display the error message using Snackbar
                this._snackBarService.openSnackBar(errorMessage, GlobalConstants.error);

                // Optionally, set the error message on a form control
                this.form.enable(); // Re-enable the form in case of error
            },
            complete: () => {
                this.loading = false; // Stop loading indicator
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


    // Add this កែសម្រួលប្រវត្តិរូប method
    close(): void {
        this._dialogRef.close();
        this.opened = false;
    }

    signOut(): void {
        this._authService.signOut();
        this._router.navigateByUrl('/auth/sign-in');
    }

}
