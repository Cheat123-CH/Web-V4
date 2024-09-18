// ================================================================================>> Core Library
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

// ================================================================================>> Thrid Party Library
// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// RxJS
import { Subject, takeUntil } from 'rxjs';

// ================================================================================>> Custom Library
// Env
import { env } from 'envs/env';

// Core
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { ChangePasswordComponent } from './change-password/component';
import { UpdateProfileDialogComponent } from './update-dialog';

@Component({
    selector: 'app-profile',
    standalone: true,
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule
    ]
})

export class ProfileComponent implements OnInit {

    user: User;
    fileUrl: string = env.FILE_BASE_URL;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _userService: UserService,
        private _dialog: MatDialog,
    ) { }

    ngOnInit(): void {
        // ===>> Get Data from Global User Service
        this._userService.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((user: User) => {

            // Data Maping
            this.user = user;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    openUpdateProfileDialog(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = this.user;
        dialogConfig.autoFocus = false;
        dialogConfig.position = { right: '0px' };
        dialogConfig.height = '100dvh';
        dialogConfig.width = '100dvw';
        dialogConfig.maxWidth = '550px';
        dialogConfig.panelClass = 'custom-mat-dialog-as-mat-drawer';
        dialogConfig.enterAnimationDuration = '0s';
        const dialogRef = this._dialog.open(UpdateProfileDialogComponent, dialogConfig);

        dialogRef.afterClosed().subscribe(result => {
        });
    }
    updatePassword(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = this.user;
        dialogConfig.autoFocus = false;
        dialogConfig.position = { right: '0px' };
        dialogConfig.height = '100dvh';
        dialogConfig.width = '100dvw';
        dialogConfig.maxWidth = '550px';
        dialogConfig.panelClass = 'custom-mat-dialog-as-mat-drawer';
        dialogConfig.enterAnimationDuration = '0s';
        const dialogRef = this._dialog.open(ChangePasswordComponent, dialogConfig);

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.user = result;
            }
        });
    }

}
