import { CommonModule, HashLocationStrategy, LocationStrategy, NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { format, getISOWeek } from 'date-fns';
import { env } from 'envs/env';
import { SnackbarService } from 'helper/services/snack-bar/snack-bar.service';
import GlobalConstants from 'helper/shared/constants';
import { UiSwitchModule } from 'ngx-ui-switch';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { BarChartComponent } from './bar-chart';
import { CicleChartComponent } from './cicle-chart';
import { DashbordService } from './dashboards.service';
import { CashierData, DashboardResponse, DataCashierResponse, StataticData } from './interface';
import { ReportComponent } from './report/component';

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
        BarChartComponent,
        CicleChartComponent,
        MatDatepickerModule,
        MatNativeDateModule,
    ],
    providers: [
        { provide: LocationStrategy, useClass: HashLocationStrategy },
    ],
})
export class DashboardComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private _organizationDataSubject = new BehaviorSubject<StataticData[]>([]);
    organizationData$ = this._organizationDataSubject.asObservable();
    user: User;
    fileUrl = env.FILE_BASE_URL;
    today?: string;
    yesterday?: string;
    thisWeek?: string;
    thisMonth?: string;
    dateTypeControl = new FormControl('', { updateOn: 'blur' });
    form: FormGroup;
    stataticData: StataticData;
    cashierData: CashierData[];
    selectedDate: Date;
    public dateType = [
        { id: 'today', name: 'ថ្ងៃនេះ' },
        { id: 'yesterday', name: 'ម្សិលមិញ' },
        { id: 'thisWeek', name: 'សប្តាហ៍នេះ' },
        { id: 'thisMonth', name: 'ខែនេះ' }
    ];
    private cache: any = {};
    activeTab: string = 'all';
    displayedColumns: string[] = ['number_doc', 'title_doc', 'ministry_doc', 'action_doc'];

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _userService: UserService,
        private _snackBarService: SnackbarService,
        private _service: DashbordService,
    ) { }

    ngOnInit(): void {
        this._userService.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((user: User) => {
            this.user = user;
            this._changeDetectorRef.markForCheck();
        });
        this.startCarousel();
        this.form = new FormGroup({
            date_type: this.dateTypeControl
        });

        this.dateTypeControl.valueChanges
            .pipe(debounceTime(0), distinctUntilChanged(), takeUntil(this._unsubscribeAll))
            .subscribe(() => this.dateTypeHandler());

        this.getStaticData();
        this.getCashierData()
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
        this.getStaticData();
    }

    getStaticData(): void {
        const cacheKey = this.today || this.yesterday || this.thisWeek || this.thisMonth;

        if (this.cache[cacheKey]) {
            this.stataticData = this.cache[cacheKey];
            return;
        }

        this._service.getStaticData(this.today, this.yesterday, this.thisWeek, this.thisMonth)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response: DashboardResponse) => {
                    if (response) {
                        this.stataticData = response.statatics;
                        this.cache[cacheKey] = response.statatics;
                    }
                    this._changeDetectorRef.markForCheck(); // Trigger UI update
                },
                error: (err) => {
                    this._snackBarService.openSnackBar(err.error?.message ?? GlobalConstants.genericError, GlobalConstants.error);
                }
            });
    }

    getCashierData(): void {
        let year: string | undefined;
        let week: string | undefined;

        if (this.selectedDate) {
            year = format(this.selectedDate, 'yyyy');  // Extract year
            week = getISOWeek(this.selectedDate).toString();  // Extract week
        }

        this._service.getCashier(year, week)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response: DataCashierResponse) => {
                    if (response && response.data) {
                        this.cashierData = response.data;
                    }
                    this._changeDetectorRef.markForCheck();  // Trigger UI update
                },
                error: (err) => {
                    const errorMessage = err.error?.message ?? 'Error fetching cashier data.';
                    console.error(errorMessage);
                }
            });
    }

    private matDialog = inject(MatDialog);
    report(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.position = { right: '0px' };
        dialogConfig.height = '100dvh';
        dialogConfig.width = '100dvw';
        dialogConfig.maxWidth = '550px';
        dialogConfig.panelClass = 'custom-mat-dialog-as-mat-drawer';
        dialogConfig.enterAnimationDuration = '0s';
        const dialogRef = this.matDialog.open(ReportComponent, dialogConfig);

    }

    selectedDate3: Date
    onDateChangeForChart(): void {
    }

    selectedDate4: Date | null = null;
    onDateChangeForChart2(event: any): void {
    }

    isCart1Visible = false;
    intervalId: any;
    startCarousel() {
        this.toggleCart();
    }

    toggleCart() {
        this.isCart1Visible = !this.isCart1Visible;
    }

    showCart(cart1: boolean) {
        this.isCart1Visible = cart1;
    }
    listView = true; // Start with the list view by default
    chartView = false;
    lineView = false;
    // Toggle views
    showListView() {
        this.listView = true;
        this.chartView = false;
        this.lineView = false;
    }

    showChartView() {
        this.listView = false;
        this.chartView = true;
        this.lineView = false;
    }

    showLineView() {
        this.listView = false;
        this.chartView = false;
        this.lineView = true;
    }

    ngOnDestroy(): void {
        clearInterval(this.intervalId);
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
