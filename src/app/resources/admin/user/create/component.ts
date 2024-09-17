// ================================================================================>> Core Library
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { AbstractControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// ================================================================================>> Thrid Party Library
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';

// ================================================================================>> Custom Library

// Local
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { PortraitComponent } from 'helper/components/portrait/portrait.component';
import { SnackbarService } from 'helper/services/snack-bar/snack-bar.service';
import GlobalConstants from 'helper/shared/constants';
import { RequestPutUser } from '../interface';
import { UserService } from '../service';

@Component({
    selector: 'shared-create-user',
    standalone: true,
    templateUrl: './template.html',
    styleUrls: ['./style.scss'],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatOptionModule,
        MatDividerModule,
        MatFormFieldModule,
        PortraitComponent,
        MatRadioModule,
        MatDialogModule
    ]
})
export class SharedCreateUserComponent {
    @Input() src: string = 'assets/images/avatars/image-icon.jpg';
    createUser: UntypedFormGroup;
    isLoading: boolean;
    roles: { id: number, name: string }[] = [];
    currentDate: Date = new Date();
    @Output() onServiceAdded = new EventEmitter<void>();
    private userService = inject(UserService);
    ResponseData = new EventEmitter<RequestPutUser>()
    constructor(
        private dialogRef: MatDialogRef<SharedCreateUserComponent>,
        private readonly route: ActivatedRoute,
        private readonly formBuilder: UntypedFormBuilder,
        private readonly snackBarService: SnackbarService,
        private readonly router: Router
    ) { }

    ngOnInit(): void {
        this.ngBuilderForm();
    }

    srcChange(base64: string): void {
        this.createUser.get('avatar').setValue(base64);
    }

    ngBuilderForm(): void {
        this.createUser = this.formBuilder.group({
            avatar: [null],
            sex_id: [null, Validators.required],
            name: [null, Validators.required],
            email: [null, Validators.required],
            phone: [null, Validators.required],
            role_ids: ['', [Validators.required, this.validateRoleIds]],
            password: [null, Validators.required],
        });
    }

    validateRoleIds(control: AbstractControl): ValidationErrors | null {
        const roleIds = control.value;
        if (Array.isArray(roleIds) && roleIds.length > 0) {
            return null; // Valid selection
        }
        return { noRolesSelected: true }; // Error: No roles selected
    }

    submit(): void {
        this.createUser.disable();
        this.isLoading = true;
        console.log(this.createUser.value)
        this.userService.create(this.createUser.value).subscribe({
            next: (response) => {
                this.onServiceAdded.emit();
                this.isLoading = false;
                this.createUser.enable();
                this.userService.items = null;
                this.dialogRef.close();
                this.snackBarService.openSnackBar(response.message, GlobalConstants.success);
            },
            error: (err) => {
                this.createUser.enable();
                this.isLoading = false;
                const errors: { field: string, message: string }[] | undefined = err.error.errors;
                let message: string = err.error.message ?? GlobalConstants.genericError;
                if (errors && errors.length > 0) {
                    message = errors.map((obj) => obj.message).join(', ')
                }
                this.snackBarService.openSnackBar(message, GlobalConstants.error);
            },
            complete: () => {
            }
        });
    }

    closeDialog() {
        this.dialogRef.close();
    }

    private usernameValidator(control: AbstractControl): { [key: string]: any } | null {
        const forbidden = /[^\w]/.test(control.value);
        return forbidden ? { 'forbiddenUsername': { value: control.value } } : null;
    }
}
