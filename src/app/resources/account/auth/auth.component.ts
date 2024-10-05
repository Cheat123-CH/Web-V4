import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    FormsModule,
    NgForm,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { LanguagesComponent } from 'app/layout/common/languages/languages.component';
import { helperAnimations } from 'helper/animations';
import { HelperAlertComponent, HelperAlertType } from 'helper/components/alert';

@Component({
    selector: 'auth-login',
    templateUrl: './auth.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: helperAnimations,
    standalone: true,
    imports: [
        RouterLink,
        HelperAlertComponent,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        LanguagesComponent,
    ],
})
export class AuthSignInComponent implements OnInit {
    @ViewChild('signInNgForm') signInNgForm: NgForm;

    alert: { type: HelperAlertType; message: string } = {
        type: 'success',
        message: '',
    };

    images: string[] = [
        'images/apps/pos1.png',
        'images/apps/pos1.png',
        'images/apps/pos1.png',
    ];
    
    currentImage: string = this.images[0];
    imageIndex: number = 0;
    interval: any;
    signInForm: UntypedFormGroup;
    showAlert: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router
    ) { }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.signInForm = this._formBuilder.group({
            username: ['0889566929', [Validators.required, Validators.pattern('^0[0-9]{8,9}$')]],
            password: ['123456', Validators.required]
        });
        this.startImageSlider();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */
    signIn(): void {
        // Return if the form is invalid
        if (this.signInForm.invalid) {
            return;
        }

        // Disable the form
        this.signInForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Sign in
        this._authService.signIn(this.signInForm.value).subscribe({
            next: res => {
                // Navigate to the redirect url
                this._router.navigateByUrl('');
            },
            error: err => {
                // Re-enable the form
                this.signInForm.enable();

                // Reset the form
                this.signInNgForm.resetForm();

                // Set the alert
                this.alert = {
                    type: 'error',
                    message: err.error?.message || 'Wrong Phone numeber or password',
                };

                // Show the alert
                this.showAlert = true;
            }
        });
    }

    startImageSlider() {
        this.interval = setInterval(() => {
            this.imageIndex = (this.imageIndex + 1) % this.images.length;
            this.currentImage = this.images[this.imageIndex];
        }, 100000); // 100000 milliseconds = 100 seconds
    }

    ngOnDestroy() {
        // Clear the interval when the component is destroyed to prevent memory leaks
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
}
