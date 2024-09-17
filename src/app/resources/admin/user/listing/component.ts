// ================================================================================>> Core Library
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';

// ================================================================================>> Thrid Party Library
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ActivatedRoute, RouterLink } from '@angular/router';

// RxJS
import { Subject } from 'rxjs';

// UI Swtich
import { UiSwitchModule } from 'ngx-ui-switch';

// ================================================================================>> Custom Library
// Environment
import { env } from 'envs/env';

// Local
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CapitalizePipe } from 'helper/pipes/capitalize.pipe';
import { HelperConfirmationConfig, HelperConfirmationService } from 'helper/services/confirmation';
import { SnackbarService } from 'helper/services/snack-bar/snack-bar.service';
import GlobalConstants from 'helper/shared/constants';
import { SharedCreateUserComponent } from '../create/component';
import { List, User } from '../interface';
import { UserService } from '../service';
import { SkeletonComponent } from './skeleton';
@Component({
    selector: 'shared-list-user',
    standalone: true,
    templateUrl: './template.html',
    styleUrls: ['./style.scss'],
    imports: [
        MatTableModule,
        CommonModule,
        MatIconModule,
        RouterLink,
        MatButtonModule,
        MatPaginatorModule,
        MatIconModule,
        RouterLink,
        MatTooltipModule,
        CapitalizePipe,
        MatMenuModule,
        UiSwitchModule,
        SkeletonComponent,
    ],
})
export class UserComponent implements OnInit, OnDestroy {

    private _unsubscribeAll: Subject<List> = new Subject<List>();
    private userService = inject(UserService);
    private snackBarService = inject(SnackbarService);
    private helpersConfirmationService = inject(HelperConfirmationService);
    private matDialog = inject(MatDialog);

    displayedColumns: string[] = ['no', 'profile', 'number', 'status', 'date', 'action'];
    dataSource: MatTableDataSource<User> = new MatTableDataSource<User>([]);
    fileUrl: string = env.FILE_BASE_URL;
    link: string = undefined;
    total: number = 10;
    limit: number = 10;
    page: number = 1;
    key: string = '';
    isLoading: boolean = false;
    copiedStatus: { [key: string]: boolean } = {};

    constructor(private route: ActivatedRoute, private cdr: ChangeDetectorRef,) { }
    ngOnInit(): void {
        this.list()
    }

    list(_page: number = 1, _page_size: number = 10): void {
        const params: { page: number, page_size: number, key?: string } = {
            page: _page,
            page_size: _page_size
        }
        if (this.key != '') {
            params.key = this.key;
        }
        console.log(this.key)
        this.isLoading = true;
        this.userService.list(params).subscribe({
            next: res => {
                console.log(res)
                this.dataSource.data = res.data ?? [];
                console.log(this.dataSource.data)
                this.total = res.pagination.totalItems;
                this.limit = res.pagination.perPage;
                this.page = res.pagination.currentPage;
                this.isLoading = false;
            },
            error: err => {
                this.isLoading = false;
                this.snackBarService.openSnackBar(err.error?.message ?? GlobalConstants.genericError, GlobalConstants.error);
            }
        });
    }
    create(): void {
        const dialogConfig = new MatDialogConfig();
        // dialogConfig.data = this.labels.find((v: { id: number, name: string }) => v.name == this.filterType);
        dialogConfig.width = "550px";
        dialogConfig.position = { right: '0px' };
        dialogConfig.height = '100dvh';
        dialogConfig.panelClass = 'custom-dialog-container';

        dialogConfig.autoFocus = false;
        dialogConfig.autoFocus = false;
        const dialogRef = this.matDialog.open(SharedCreateUserComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(() => {
            this.list();  // Refresh data when the dialog is closed
        });
    }
    // view(id): void {
    //     const dialogConfig = new MatDialogConfig();
    //     dialogConfig.data = {id};
    //     dialogConfig.autoFocus = false;
    //     dialogConfig.position = { right: '0px' };
    //     dialogConfig.height = '100dvh';
    //     dialogConfig.width = '100dvw';
    //     dialogConfig.maxWidth = '550px';
    //     dialogConfig.panelClass = 'custom-mat-dialog-as-mat-drawer';
    //     dialogConfig.enterAnimationDuration = '0s';
    //     const dialogRef = this.matDialog.open(SharedViewUserComponent, dialogConfig);
    // }
    // changPassword(id: number) {
    //     const dialogConfig = new MatDialogConfig();
    //     dialogConfig.autoFocus = false;
    //     dialogConfig.position = { right: '0px' };
    //     dialogConfig.height = '100dvh';
    //     dialogConfig.width = '100dvw';
    //     dialogConfig.maxWidth = '550px';
    //     dialogConfig.panelClass = 'custom-mat-dialog-as-mat-drawer';
    //     dialogConfig.enterAnimationDuration = '0s';
    //     dialogConfig.data = id
    //     const dialogRef = this.matDialog.open(ChangePasswordComponentForManager, dialogConfig);

    //     this.cdr.detectChanges();
    // }
    onPageChanged(event: PageEvent): void {
        if (event && event.pageSize) {
            this.limit = event.pageSize;
            this.page = event.pageIndex + 1;
            this.list(this.page, this.limit);
        }
    }

    onDelete(user: User): void {
        // Build the config form
        const configAction: HelperConfirmationConfig = {
            title: `Remove <strong> ${user.name} </strong>`,
            message: 'Are you sure you want to remove this user permanently? <span class="font-medium">This action cannot be undone!</span>',
            icon: ({
                show: true,
                name: 'heroicons_outline:exclamation-triangle',
                color: 'warn',
            }),
            actions: {
                confirm: {
                    show: true,
                    label: 'Remove',
                    color: 'warn',
                },
                cancel: {
                    show: true,
                    label: 'Cancel',
                },
            },
            dismissible: true,
        };
        // Open the dialog and save the reference of it
        const dialogRef = this.helpersConfirmationService.open(configAction);

        // Subscribe to afterClosed from the dialog reference
        dialogRef.afterClosed().subscribe((result: string) => {
            if (result && typeof result === 'string' && result === 'confirmed') {
                this.userService.delete(user.id).subscribe({
                    next: (response: { statusCode: number, message: string }) => {
                        this.dataSource.data = this.dataSource.data.filter((v: User) => v.id != user.id);
                        this.snackBarService.openSnackBar(response.message, GlobalConstants.success);
                    },
                    error: (err: HttpErrorResponse) => {
                        const error: { httpStatus: 400, message: string } = err.error;
                        this.snackBarService.openSnackBar(error.message, GlobalConstants.error);
                    }
                });
            }
        });
    }

    //=============================================>> Status
    onChange(status: boolean, user: User): void {
        const body = {
            is_active: status ? true : false
        };
        this.userService.updateStatus(user.id, body).subscribe({
            next: (response) => {
                this.snackBarService.openSnackBar(response.message, GlobalConstants.success);
            },
            error: (err) => {
                const error: { httpStatus: number, message: string } = err.error;
                this.snackBarService.openSnackBar(error.message, GlobalConstants.error);
            }
        })
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
