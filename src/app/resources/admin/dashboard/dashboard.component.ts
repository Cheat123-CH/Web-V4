import { CommonModule, HashLocationStrategy, LocationStrategy, NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { format } from 'date-fns';
import { env } from 'envs/env';
import { SnackbarService } from 'helper/services/snack-bar/snack-bar.service';
import GlobalConstants from 'helper/shared/constants';
import { UiSwitchModule } from 'ngx-ui-switch';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { DashbordService } from './dashboards.service';
import { DocumentData } from './documents.interface';
import { DashboardResponse, StataticData } from './interface';

@Component({
    selector: 'admin-dashboard',
    standalone: true,
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
    imports: [
        CommonModule,
        RouterModule,
        MatIconModule,
        MatButtonModule,
        NgClass,
        NgFor,
        NgIf,
        MatMenuModule,
        MatTabsModule,
        MatTableModule,
        MatCheckboxModule,
        UiSwitchModule,
        MatPaginatorModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        ReactiveFormsModule,
    ],
    providers: [
        { provide: LocationStrategy, useClass: HashLocationStrategy },
    ],
})
export class DashboardComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private _organizationDataSubject = new BehaviorSubject<StataticData[]>([]);
    organizationData$ = this._organizationDataSubject.asObservable();
    isLoading: boolean = false;
    user: User;
    fileUrl = env.FILE_BASE_URL;
    today?: string;
    yesterday?: string;
    thisWeek?: string;
    thisMonth?: string;
    dateTypeControl = new FormControl('', { updateOn: 'blur' });
    form: FormGroup;
    stataticData: StataticData;
    public dateType = [
        { id: 'today', name: 'ថ្ងៃនេះ' },
        { id: 'yesterday', name: 'ម្សិលមិញ' },
        { id: 'thisWeek', name: 'សប្តាហ៍នេះ' },
        { id: 'thisMonth', name: 'ខែនេះ' }
    ];
    private cache: any = {};
    activeTab: string = 'all';

    dataSource_all_document: MatTableDataSource<DocumentData> = new MatTableDataSource<DocumentData>([]);
    dataSource_draff_document: MatTableDataSource<DocumentData> = new MatTableDataSource<DocumentData>([]);
    dataSource_competed_document: MatTableDataSource<DocumentData> = new MatTableDataSource<DocumentData>([]);
    dataSource_copies_document: MatTableDataSource<DocumentData> = new MatTableDataSource<DocumentData>([]);
    displayedColumns: string[] = ['number_doc', 'title_doc', 'ministry_doc', 'action_doc'];

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _userService: UserService,
        private _matDialog: MatDialog,
        private _snackBarService: SnackbarService,
        private _service: DashbordService,
    ) { }

    ngOnInit(): void {
        this._userService.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((user: User) => {
            this.user = user;
            this._changeDetectorRef.markForCheck();
        });

        this.form = new FormGroup({
            date_type: this.dateTypeControl
        });

        this.dateTypeControl.valueChanges
            .pipe(debounceTime(0), distinctUntilChanged(), takeUntil(this._unsubscribeAll))
            .subscribe(() => this.dateTypeHandler());

        this.getStaticDataDucument();
        this.listDocumentsAll();
        this.listDocumentsDraff();
        this.listDocumentsCompeted();
        this.listDocumentsCopy();
        this._setupOnInit();
    }
    public docCategory: { id: number, name: string, is_license: boolean }[] | undefined
    public newDocNumber: { doc_number: string }
    private _setupOnInit(): void {
        this._service.setup().subscribe({
            next: res => {
                this.docCategory = res.docCategory
                this.newDocNumber = res.newDocNumber
                console.log(this.newDocNumber)
            },
            error: err => this._snackBarService.openSnackBar(err.error?.message ?? GlobalConstants.genericError, GlobalConstants.error)
        });
    }
    dateTypeHandler(): void {
        const selectedDateType = this.dateTypeControl.value;
        const now = new Date();

        switch (selectedDateType) {
            case 'today':
                this.today = format(now, 'yyyy-MM-dd');
                this.yesterday = this.thisWeek = this.thisMonth = undefined;
                break;
            case 'yesterday':
                const yesterdayDate = new Date(now);
                yesterdayDate.setDate(now.getDate() - 1);
                this.yesterday = format(yesterdayDate, 'yyyy-MM-dd');
                this.today = this.thisWeek = this.thisMonth = undefined;
                break;
            case 'thisWeek':
                const firstDayOfWeek = new Date(now);
                firstDayOfWeek.setDate(now.getDate() - now.getDay());
                this.thisWeek = format(firstDayOfWeek, 'yyyy-MM-dd');
                this.today = this.yesterday = this.thisMonth = undefined;
                break;
            case 'thisMonth':
                const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                this.thisMonth = format(firstDayOfMonth, 'yyyy-MM-dd');
                this.today = this.yesterday = this.thisWeek = undefined;
                break;
            default:
                this.today = this.yesterday = this.thisWeek = this.thisMonth = undefined;
                break;
        }

        this.getStaticDataDucument();
    }

    getStaticDataDucument(): void {
        const cacheKey = this.today || this.yesterday || this.thisWeek || this.thisMonth;

        if (this.cache[cacheKey]) {
            this.stataticData = this.cache[cacheKey];
            return;
        }

        this.isLoading = true;
        this._service.getStaticDataDucument(this.today, this.yesterday, this.thisWeek, this.thisMonth)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response: DashboardResponse) => {
                    if (response) {
                        this.stataticData = response.statatic;
                        this.cache[cacheKey] = response.statatic;
                    }
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck(); // Trigger UI update
                },
                error: (err) => {
                    this._snackBarService.openSnackBar(err.error?.message ?? GlobalConstants.genericError, GlobalConstants.error);
                    this.isLoading = false;
                }
            });
    }
    listDocumentsAll(): void {
        this.isLoading = true;
        this._service.listDocumentsAll().subscribe({
            next: res => {
                this.dataSource_all_document.data = res.data ?? [];
                this.isLoading = false;
            },
            error: err => {
                this.isLoading = false;
                this._snackBarService.openSnackBar(err.error?.message ?? GlobalConstants.genericError, GlobalConstants.error);
            }
        });
    }

    listDocumentsDraff(): void {
        this.isLoading = true;
        this._service.listDocumentsDraff().subscribe({
            next: res => {
                this.dataSource_draff_document.data = res.data ?? [];
                this.isLoading = false;
            },
            error: err => {
                this.isLoading = false;
                this._snackBarService.openSnackBar(err.error?.message ?? GlobalConstants.genericError, GlobalConstants.error);
            }
        });
    }

    listDocumentsCompeted(): void {
        this.isLoading = true;
        this._service.listDocumentsCompeted().subscribe({
            next: res => {
                this.dataSource_competed_document.data = res.data ?? [];
                this.isLoading = false;
            },
            error: err => {
                this.isLoading = false;
                this._snackBarService.openSnackBar(err.error?.message ?? GlobalConstants.genericError, GlobalConstants.error);
            }
        });
    }

    listDocumentsCopy(): void {
        this.isLoading = true;
        this._service.listDocumentsCopy().subscribe({
            next: res => {
                this.dataSource_copies_document.data = res.data ?? [];
                this.isLoading = false;
            },
            error: err => {
                this.isLoading = false;
                this._snackBarService.openSnackBar(err.error?.message ?? GlobalConstants.genericError, GlobalConstants.error);
            }
        });
    }


    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
