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
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { SnackbarService } from 'helper/services/snack-bar/snack-bar.service';
import GlobalConstants from 'helper/shared/constants';
import { ChangePasswordComponent } from './change-password/component';
import { ProfileService } from './profile.service';
import { Data, List } from './profile.type';
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
        MatDialogModule,
        MatTableModule,
        MatPaginatorModule,
    ]
})

export class ProfileComponent implements OnInit {
    user: User;
    fileUrl: string = env.FILE_BASE_URL;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    displayedColumns: string[] = ['no', 'type', 'ip', 'date', 'time'];
    dataSource: MatTableDataSource<Data> = new MatTableDataSource<Data>([]);
    total: number = 10;
    limit: number = 10;
    page: number = 1;
    key: string = '';
    isLoading: boolean = false;
    constructor(

        private _changeDetectorRef: ChangeDetectorRef,
        private _userService: UserService,
        private profileService: ProfileService,
        private snackBarService: SnackbarService,
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
        this.list(this.page, this.limit)
    }
    list(_page: number = 1, _page_size: number = 10,): void {
        const params: {
            page: number;
            page_size: number;
        } = {
            page: _page,
            page_size: _page_size,
        };
        this.isLoading = true;
        this.profileService.list(params).subscribe({
            next: (res: List) => {
                this.dataSource.data = res.data;
                this.total = res.pagination.totalItems;
                this.limit = res.pagination.perPage;
                this.page = res.pagination.currentPage;
                this.isLoading = false; // Set loading state to false once data is loaded
            },
            error: (err: HttpErrorResponse) => {
                this.isLoading = false; // Ensure loading state is false even on error
                this.snackBarService.openSnackBar(
                    err?.error?.message ?? GlobalConstants.genericError,
                    GlobalConstants.error
                );
            }
        });
    }

    onPageChanged(event: PageEvent): void {
        if (event && event.pageSize) {
            this.limit = event.pageSize;
            this.page = event.pageIndex + 1;
            this.list(this.page, this.limit);
        }
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
