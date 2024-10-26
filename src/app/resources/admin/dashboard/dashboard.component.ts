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
import { format } from 'date-fns';
import { env } from 'envs/env';
import { SnackbarService } from 'helper/services/snack-bar/snack-bar.service';
import GlobalConstants from 'helper/shared/constants';
import { UiSwitchModule } from 'ngx-ui-switch';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { BarChartComponent } from './bar-chart';
import { SaleCashierBarChartComponent } from './bar-chart-sale';
import { CicleChartComponent } from './cicle-chart';
import { SaleCicleChartComponent } from './cicle-chart-sale';
import { DashbordService } from './dashboards.service';
import { CashierData, StataticData } from './interface';
import { ReportComponent } from './report/component';

@Component({
    selector: 'admin-dashboard',
    standalone: true,
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
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
        SaleCashierBarChartComponent,
        SaleCicleChartComponent,
    ],
    providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }],
})
export class DashboardComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private _organizationDataSubject = new BehaviorSubject<StataticData[]>([]);
    organizationData$ = this._organizationDataSubject.asObservable();

    user: User;
    public selectedDateName = 'ថ្ងៃនេះ';
    public selectedDateNameChasier = 'ថ្ងៃនេះ';
    fileUrl = env.FILE_BASE_URL;

    today?: string;
    yesterday?: string;
    thisWeek?: string;
    thisMonth?: string;

    dateTypeControl = new FormControl('today', { updateOn: 'blur' });
    dateTypeControlChasier = new FormControl('today', { updateOn: 'blur' });

    form: FormGroup;
    stataticData: StataticData;
    cashierData: CashierData[];
    activeTab: string = 'all';
    displayedColumns: string[] = ['number_doc', 'title_doc', 'ministry_doc', 'action_doc'];
    private cache: any = {};
    private cacheCashier: any = {};
    isCart1Visible = false;
    intervalId: any;

    public dateType = [
        { id: 'today', name: 'ថ្ងៃនេះ' },
        { id: 'yesterday', name: 'ម្សិលមិញ' },
        { id: 'thisWeek', name: 'សប្តាហ៍នេះ' },
        { id: 'thisMonth', name: 'ខែនេះ' },
    ];

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _userService: UserService,
        private _snackBarService: SnackbarService,
        private _service: DashbordService,
    ) { }

    ngOnInit(): void {
        const now = new Date();
        this.today = format(now, 'yyyy-MM-dd');
        this.initializeForm();
        this.fetchUserData();
        this.startCarousel();
        this.getStaticData();
        this.getCashierData();
        this.setupDateTypeListeners();
    }

    initializeForm(): void {
        this.form = new FormGroup({
            date_type: this.dateTypeControl,
            date_type_cashier: this.dateTypeControlChasier,
        });
    }

    setupDateTypeListeners(): void {
        this.dateTypeControl.valueChanges
            .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this._unsubscribeAll))
            .subscribe(() => this.dateTypeHandler(true));

        this.dateTypeControlChasier.valueChanges
            .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this._unsubscribeAll))
            .subscribe(() => this.dateTypeHandler(false));
    }

    fetchUserData(): void {
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user) => {
                this.user = user;
                this._changeDetectorRef.markForCheck();
            });
    }

    selectDateType(type: { id: string; name: string }, isMain: boolean): void {
        if (isMain) {
            this.selectedDateName = type.name;
            this.dateTypeControl.setValue(type.id, { emitEvent: true });
        } else {
            this.selectedDateNameChasier = type.name;
            this.dateTypeControlChasier.setValue(type.id, { emitEvent: true });
        }
        this._changeDetectorRef.markForCheck();
    }

    dateTypeHandler(isMain: boolean): void {
        const selectedType = isMain ? this.dateTypeControl.value : this.dateTypeControlChasier.value;
        // Apply the selected date type
        switch (selectedType) {
            case 'today':
                this.applyToday();
                break;
            case 'yesterday':
                this.applyYesterday();
                break;
            case 'thisWeek':
                this.applyThisWeek();
                break;
            case 'thisMonth':
                this.applyThisMonth();
                break;
        }

        // Fetch data based on the filter type
        if (isMain) this.getStaticData();
        else this.getCashierData();
    }

    applyToday(): void {
        this.today = format(new Date(), 'yyyy-MM-dd');
        this.clearOtherDates('today');
    }

    applyYesterday(): void {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        this.yesterday = format(yesterday, 'yyyy-MM-dd');
        this.clearOtherDates('yesterday');
    }

    applyThisWeek(): void {
        const firstDayOfWeek = new Date();
        firstDayOfWeek.setDate(firstDayOfWeek.getDate() - firstDayOfWeek.getDay());
        this.thisWeek = format(firstDayOfWeek, 'yyyy-MM-dd');
        this.clearOtherDates('thisWeek');
    }

    applyThisMonth(): void {
        const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        this.thisMonth = format(firstDayOfMonth, 'yyyy-MM-dd');
        this.clearOtherDates('thisMonth');
    }

    clearOtherDates(activeDate: string): void {
        if (activeDate !== 'today') this.today = undefined;
        if (activeDate !== 'yesterday') this.yesterday = undefined;
        if (activeDate !== 'thisWeek') this.thisWeek = undefined;
        if (activeDate !== 'thisMonth') this.thisMonth = undefined;
    }

    getCacheKey(isMain: boolean): string {
        // Determine the appropriate date for cache key generation
        const datePart = this.today || this.yesterday || this.thisWeek || this.thisMonth || 'default';
        const prefix = isMain ? 'main' : 'cashier';
        const cacheKey = `${prefix}_${datePart}`;
        return cacheKey;
    }

    getStaticData(): void {
        const cacheKey = this.getCacheKey(true); // Generate cache key for main filter
        if (this.cache[cacheKey]) {
            this.stataticData = this.cache[cacheKey];
            return;
        }

        this._service.getStaticData(this.today, this.yesterday, this.thisWeek, this.thisMonth)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    this.stataticData = response.statatics;
                    this.cache[cacheKey] = response.statatics;
                    this._changeDetectorRef.markForCheck();
                },
                error: (err) => {
                    console.error('Error fetching static data:', err); // Log error
                    this._snackBarService.openSnackBar(err.error?.message ?? GlobalConstants.genericError, 'Error');
                },
            });
    }

    getCashierData(): void {
        const cacheKey = this.getCacheKey(false); // Cashier filter cache key
        if (this.cacheCashier[cacheKey]) {
            this.cashierData = this.cacheCashier[cacheKey];
            return;
        }

        this._service.getCashier(this.today, this.yesterday, this.thisWeek, this.thisMonth)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    this.cashierData = response.data;
                    this.cacheCashier[cacheKey] = response.data;
                    this._changeDetectorRef.markForCheck();
                },
                error: (err) => {
                    console.error('Error fetching cashier data:', err);
                    this._snackBarService.openSnackBar(err.error?.message ?? 'Error fetching cashier data.', 'Error');
                },
            });
    }

    startCarousel(): void {
        this.toggleCart();
    }

    toggleCart(): void {
        this.isCart1Visible = !this.isCart1Visible;
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
        this.matDialog.open(ReportComponent, dialogConfig);
    }

    selectedDate3: Date
    onDateChangeForChart(): void {
    }

    selectedDate4: Date | null = null;
    onDateChangeForChart2(event: any): void {
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
