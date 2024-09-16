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
import { User } from 'app/core/user/user.types';
import { UserService } from 'app/core/user/user.service';
import { UpdateProfileDialogComponent } from './update-dialog';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';

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
        dialogConfig.autoFocus = false;
        dialogConfig.data = this.user;
        dialogConfig.width = '600px'; // Adjust the width as needed
        dialogConfig.position = { right: '0px', top: '0px' }; // Align dialog to the top-right
        dialogConfig.height = '100vh'; // Full height
        dialogConfig.panelClass = 'side-dialog'; // Add a custom CSS class if needed

        const dialogRef = this._dialog.open(UpdateProfileDialogComponent, dialogConfig);

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                // Update the local user data if needed
                this.user = result;
                // Optionally refresh data or perform other actions
            }
        });
    }

}
