import { CommonModule, HashLocationStrategy, LocationStrategy, NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, output } from '@angular/core';
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
import { env } from 'envs/env';
import { SnackbarService } from 'helper/services/snack-bar/snack-bar.service';
import { UiSwitchModule } from 'ngx-ui-switch';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { BarChartComponent } from './bar-chart';
import { SaleCashierBarChartComponent } from './bar-chart-sale';
import { CicleChartComponent } from './cicle-chart';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';


// Component, Service, and Interface import
import { HelperConfirmationService } from 'helper/services/confirmation';
import { HelperConfirmationConfig } from 'helper/services/confirmation';
import { MoveoutComponent } from './d2-room-checkout-dialog/component';
import { DashbordService } from './service';
import { CashierData, RoomSummary, StataticData, RenterStatistics,
    ZoneStatisticsResponse, Zone, RenterInfo, ZoneStatisticsV2, DashboardStatisticsV2,
    RoomStatisticsType, RoomStatisticsV2, InvoiceStatisticsV2, ExpenseStatisticsV2,
    RenterDashboard, InvoiceInfoInterface} from './interface';
import { FreeRoomDialogComponent } from './d1-room-management-dialog/free-room-dialog.component';
import { InvoiceComponent } from './d3-payment-dialog/invoice.component';
import { IncomereportComponent } from './d5-report/income/template';
import { ExportreportComponent } from './d5-report/expense/component';
import { RenterdetailComponent } from './renter-dialog/component';
import { ExpenseDialog } from './d4-expense-dialog/component';
@Component({
    selector: 'admin-dashboard',
    standalone: true,
    templateUrl: './template.html',
    styleUrls: ['./style.scss'],
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
        MatProgressBar,
    ],
    providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }],
})
export class DashboardComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private _organizationDataSubject = new BehaviorSubject<StataticData[]>([]);
    private _helpersConfirmationService = inject(HelperConfirmationService)
    private subscription: Subscription = new Subscription();

    user: User;
    public selectedDateName = 'ថ្ងៃនេះ';
    public selectedDateNameChasier = 'ថ្ងៃនេះ';
    public selectedDateNameSale = 'សប្តាហ៍នេះ';
    public selectedDateNameProduct = 'សប្តាហ៍នេះ';
    fileUrl = env.FILE_BASE_URL;

    thisYear = new Date().getFullYear();
    years: number[] = [];
    selectedYear!: number

    dateTypeControl = new FormControl('today', { updateOn: 'blur' });
    dateTypeControlChasier = new FormControl('today', { updateOn: 'blur' });
    dateTypeControlProduct = new FormControl('thisWeek', { updateOn: 'blur' });
    dateTypeControlSale = new FormControl('thisWeek', { updateOn: 'blur' });

    form: FormGroup;
    stataticData: StataticData;
    cashierData: CashierData[];
    activeTab: string = 'all';
    displayedColumns: string[] = ['number_doc', 'title_doc', 'ministry_doc', 'action_doc'];
    private cache: any = {};
    private cacheCashier: any = {};
    isCart1Visible = false;
    intervalId: any;
    roomSummary: RoomSummary;
    zoneStatistics: ZoneStatisticsResponse;
    zs: any = [];
    // zoneColumns: string[] = ['ល.រ', 'តំបន់', 'ស្ថានភាពបន្ទប់', 'ទឹកប្រាក់មិនទាន់ទូទាត់', 'actions']


    dataRenter: MatTableDataSource<any> = new MatTableDataSource<any>([]);
    dataRenterCheckout:  MatTableDataSource<any> = new MatTableDataSource<any>([]);
    isLoading: boolean = false;
    renterStatistics: RenterStatistics
    renterStatisticsNull: RenterInfo[] = []
    renterStatisticsNotNull: RenterInfo[] = []
    zoneInfo: Zone[] = [];



    //=====================> Dashboard update

            //------Zone Dashboard:
            // zoneColumns : string[] = ['no', 'zone', 'room_status', 'priceNotPaid', 'action']
            zoneColumns : string[] = ['no', 'zone', 'room_status','progress_bar', 'priceNotPaid', 'action'];
            dataZoneColumns : MatTableDataSource<any> = new MatTableDataSource<any>([]);

            //------ Renter Dashboard
            renterColumns: string[] = ['no', 'room', 'name', 'phone', 'status', 'bookedPrice', 'date', 'action']
            renterColumnsCheckout: string[] = ['no', 'room', 'name', 'phone', 'date']
            renterDashboard : RenterDashboard[] = []
            dataRenterDashboard : MatTableDataSource<any> = new MatTableDataSource<any>([])
            defaultRenterStatus : string = 'IN'

    getColor(row : number){
        if(row % 2== 1){
            return 'grey';
            return '';
        }
    }
    // public dateType = [
    //     { id: 'y1', name: '2024' },
    //     { id: 'y2', name: '2023' },
    //     { id: 'y3', name: '2022' },
    //     { id: 'y4', name: '2021' },
    //     { id: 'y5', name: '2020' },
    //     { id: 'y6', name: '2019' },
    // ];

    public roomManagement = [
        { id: 'bookRoom', name: 'កក់បន្ទប់' },
        { id: 'leave', name: 'ចាក់ចេញ' },
    ]

    public payment = [
        { id: 'income', name: 'ចំណូល' },
        { id: 'expense', name: 'ចំណាយ' },
    ]

    public reportIncomeExpense = [
        { id: 'income', name: 'ចំណូល' },
        { id: 'expense', name: 'ចំណាយ' },
    ]

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _userService: UserService,
        private _snackBarService: SnackbarService,
        private _service: DashbordService,
        private _dialog: MatDialog,
        private _cdr: ChangeDetectorRef,
    ) { }

    ngOnInit(): void {
        this.fetchUserData();
        // this.showRoomSummary();
        // this.showZoneSummary();
        // this.showRenterSummary();
        this.showYear();
        //setup Year for barchart
        this.selectedYear = this.thisYear
        this.subscription.add(
            this._service.getRefresh().subscribe((callback) => {
                if (callback) {
                    callback(); // Call the passed function to refresh
                }
            })
        );
        // this.getZoneStatisticsV2();
        // Set the refresh callback for this component
        this._service.setRefresh(() => this.refreshDashboard());

        //===>Dashboard Update
        this.getRenterDashboard()
        this.getZoneDashboard()
    }


    changeColor(){

    }

    refreshDashboard(): void {
        // Logic to refresh the dashboard
        // this.getZoneStatisticsV2();
    }

    fetchUserData(): void {
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user) => {
                this.user = user;
                this._changeDetectorRef.markForCheck();
            });
    }

    showYear(): void {
        for (let i = 0; i <= 5; i++) {
            this.years.push(this.thisYear - i); // Generate years from this year to 5 years back
        }
    }

    selectYear(year: number) {
        this.selectedYear = year;
        console.log(this.selectedYear)
    }

    report(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.position = { right: '0px' };
        dialogConfig.height = '100dvh';
        dialogConfig.width = '100dvw';
        dialogConfig.maxWidth = '550px';
        dialogConfig.panelClass = 'custom-mat-dialog-as-mat-drawer';
        dialogConfig.enterAnimationDuration = '0s';
        // this.matDialog.open(ReportComponent, dialogConfig);
    }

    selectedDate3: { thisWeek: string; thisMonth: string, threeMonthAgo: string, sixMonthAgo: string } | null = null;
    selectedDate4: { thisWeek: string; thisMonth: string, threeMonthAgo: string, sixMonthAgo: string } | null = null;

    getProductData(thisWeek: string, thisMonth: string, threeMonthAgo: string, sixMonthAgo: string,): void {
        this.selectedDate3 = {
            thisWeek,
            thisMonth,
            threeMonthAgo,
            sixMonthAgo,
        };
        this._changeDetectorRef.markForCheck();
    }

    getSalesData(thisWeek: string, thisMonth: string, threeMonthAgo: string, sixMonthAgo: string,): void {
        this.selectedDate4 = {
            thisWeek,
            thisMonth,
            threeMonthAgo,
            sixMonthAgo,
        };
        console.log(this.selectedDate4)
        this._changeDetectorRef.markForCheck();
    }

    listView = true; // Start with the list view by default
    chartView = false;
    columnChartview = false;
    // Toggle views
    showListView() {
        this.listView = true;
        this.chartView = false;
        this.columnChartview = false;
    }

    showChartView() {
        this.listView = false;
        this.chartView = true;
        this.columnChartview = false;
    }

    showColumnChartView() {
        this.listView = false
        this.chartView = false;
        this.columnChartview = true;
    }

    ngOnDestroy(): void {
        clearInterval(this.intervalId);
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // showRoomSummary(): void {
    //     this.isLoading = true;
    //     this._service.getRoomSummary().subscribe({
    //         next: (data) => {
    //             this.roomSummary = data;
    //             this.isLoading = false;
    //         },
    //         error: (err) => {
    //             console.error("Error fetching room summary: ", err);
    //             this.isLoading = false;
    //         }
    //     }
    //     )
    // }

    // showZoneSummary(): void {
    //     this._service.getZoneStatistic().subscribe({
    //         next: (data) => {
    //             this.zoneStatistics = data;
    //             console.log("zone statistics: ", this.zoneStatistics)
    //         },
    //         error: (err) => {
    //             console.error("Error fetching zone statistics: ", err);
    //         }
    //     });
    // }

    openFreeRoomDialog(item: any): void {
        const dialogConfig                  = new MatDialogConfig();
        dialogConfig.autoFocus              = false;
        dialogConfig.position               = { right: '0px' };
        dialogConfig.width                  = '600px';
        dialogConfig.height                 = '100vh';
        dialogConfig.panelClass             = 'side-dialog';
        dialogConfig.enterAnimationDuration = '0s';
        dialogConfig.data                   = item
        const dialogRef                     = this._dialog.open(FreeRoomDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(() => {
            // this.showZoneSummary();
            // this.getZoneStatisticsV2();
            // Detect changes after dialog is closed
            this._cdr.detectChanges();
        });
    }



    openInvoiceDialog(zone: any): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.position = { right: '0px' };
        dialogConfig.width = '600px';
        dialogConfig.height = '100vh';
        dialogConfig.panelClass = 'side-dialog';
        dialogConfig.enterAnimationDuration = '0s';
        dialogConfig.data = zone;

        this._dialog.open(InvoiceComponent, dialogConfig);
    }

    openExpenseDialog(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.position = { right: '0px' };
        dialogConfig.width = '600px';
        dialogConfig.height = '100vh';
        dialogConfig.panelClass = 'side-dialog';
        dialogConfig.enterAnimationDuration = '0s';
        // dialogConfig.data = zone;

        this._dialog.open(ExpenseDialog, dialogConfig);
    }

    openRenterDialog(data: number): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.position = { right: '0px' };
        dialogConfig.width = '600px';
        dialogConfig.height = '100vh';
        dialogConfig.panelClass = 'side-dialog';
        dialogConfig.enterAnimationDuration = '0s';
        dialogConfig.data = data;

        console.log(data)
        this._dialog.open(RenterdetailComponent, dialogConfig);
    }

    openMoveoutDialog(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.position = { right: '0px' };
        dialogConfig.width = '600px';
        dialogConfig.height = '100vh';
        dialogConfig.panelClass = 'side-dialog';
        dialogConfig.enterAnimationDuration = '0s';

        this._dialog.open(MoveoutComponent, dialogConfig);
    }

    openIncomeReportDialog(item: any): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.position = { right: '0px' };
        dialogConfig.width = '600px';
        dialogConfig.height = '100vh';
        dialogConfig.panelClass = 'side-dialog';
        dialogConfig.enterAnimationDuration = '0s';
        dialogConfig.data = item;
        this._dialog.open(IncomereportComponent, dialogConfig);
    }

    openExportReportDialog(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.position = { right: '0px' };
        dialogConfig.width = '600px';
        dialogConfig.height = '100vh';
        dialogConfig.panelClass = 'side-dialog';
        dialogConfig.enterAnimationDuration = '0s';

        this._dialog.open(ExportreportComponent, dialogConfig);
    }

    deleteRenter(item: any): void {

        const configAction: HelperConfirmationConfig = {
            title: `លុប​ អ្នកជួល <strong>${item.renterName}</strong>`,
            message: 'តើអ្នកប្រាកដថាអ្នកចង់លុបអ្នកជួលនេះចោលជាអចិន្ត្រៃយ៍មែនទេ? <span class="font-medium">សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ!</span>',
            icon: {
                show: true,
                name: 'heroicons_outline:exclamation-triangle',
                color: 'warn',
            },
            actions: {
                confirm: {
                    show: true,
                    label: 'លុប',
                    color: 'warn',
                },
                cancel: {
                    show: true,
                    label: 'បោះបង់',
                },
            },
            dismissible: true,
        };

        const dialogRef = this._helpersConfirmationService.open(configAction);

        console.log(item)
        dialogRef.afterClosed().subscribe((confirmed: boolean) => {
            if (confirmed) {
                const renter = item.renterId

                this._service.deleteRenter(renter).subscribe({
                    next: () => {
                        this._snackBarService.openSnackBar('លុបដោយជោគជ័យ', 'done')
                        // this.showRenterSummary()
                    },
                    error: (err) => {
                        let errorMessage = 'មានបញ្ហាក្នុងការលុប';

                        // Check and map specific backend error messages to Khmer messages
                        if (err?.error?.message === 'Cannot delete room with active transactions. 1 active transaction(s) found.') {
                            errorMessage = 'អ្នកជួលមានវិក្កយបត្រមិនទាន់បានទូទាត់';
                        }

                        // Display the error message in the snackbar
                        this._snackBarService.openSnackBar(errorMessage, 'error');
                    }
                })
            }
        })
    }


    //==================================> Dashboard V2:

    //interface for zonestatistics and method to get
    // zoneStatisticsV2    : DashboardStatisticsV2
    // roomStatisticsV2    : any[] = [];
    // invoiceStatisticsV2 : any[] = [];
    // expenseStatisticsV2 : any[] = [];
    // getZoneStatisticsV2(): void{
    //     this.isLoading = true,
    //     this._service.getStatisticsv2().subscribe({
    //         next : (res) => {
    //             this.isLoading = false
    //             this.zoneStatisticsV2 = res
                // this.roomStatisticsV2 = res.data.object_1.rooms.reduce(
                //     (acc: { [key: string]: number }, room: RoomStatisticsV2) => {
                //         acc[room.status.toLowerCase()] = Number(room.count); // Use lowercase for keys and ensure count is a number
                //         return acc;
                //     },
                //     {}
                // );
    //             this.roomStatisticsV2    = res.data.object_1.rooms.map((room : RoomStatisticsV2) => {
    //                 return { status : room.status, count : Number(room.count)}
    //             })
    //             this.invoiceStatisticsV2 = res.data.object_1.invoices.map((invoice: InvoiceStatisticsV2) => {
    //                 return { status : invoice.status, count : Number(invoice.count) };
    //               });
    //             this.expenseStatisticsV2 = res.data.object_1.expenses.map((expense: ExpenseStatisticsV2) => {
    //                 return { status : expense.status, count : Number(expense.count)};
    //             })

    //             this.invoiceStatisticsV2 = res.data.object_1.invoices
    //             this.expenseStatisticsV2 = res.data.object_1.expenses

    //         },
    //         error: () => {
    //             this.isLoading = false
    //         }
    //     })
    // }


    //-----------------> Zone Dashboard <-----------------------
    getZoneDashboard(): void{
        this.isLoading = true,
        this._service.getZoneStatisticsv2().subscribe({
            next : (response : ZoneStatisticsV2[]) => {
                this.isLoading = false,
                this.dataZoneColumns.data = response
            },
            error : (err) => {
                this._snackBarService.openSnackBar('មិនមានទិន្នន័យតំបន់' , 'error')
            }
        })
    }

    //====================>show renter Dashboard:
    onSwitchRenterTab(event : any) : void {
        if (event.index === 1) {
            this.defaultRenterStatus = 'OUT';
          } else {
            this.defaultRenterStatus = 'IN';
          }

          // Call dashboard update function
          this.getRenterDashboard();
        }

    setParamsForRenter(): any{
        const params : any =
        {
            status : this.defaultRenterStatus,
            limit  : 20,
        }
        return params
    }

    getRenterDashboard(): void {
        const params = this.setParamsForRenter()
        this._service.getDashboardRenter(params).subscribe({
            next : (res : RenterDashboard[]) => {
                // this.renterDashboard     = res
                this.dataRenterDashboard.data = res

            },
            error : () =>
            {
                this._snackBarService.openSnackBar('មិនមានផ្ទាំងព័ត៌មានអ្នកជួល', 'error')
            }
        })
    }

    getZoneInfoforInvoice(zone_id : number): void {
        this._service.getZoneInfotoCreate({zone_id}).subscribe({
            next : (res : InvoiceInfoInterface) => {
                const configAction: HelperConfirmationConfig = {
                    title: `បញ្ជាក់ការបង្កើត`,
                    message: `តើអ្នកប្រាកដថាចង់បង្កើតវិក្កយបត្រមែនទេ? <br><span class="font-medium"> <br>
                    រយៈពេលបង្កើតចុងក្រោយ​ ៖​ ${res.data.close_invoice.last_created.days} ថ្ងៃ ${res.data.close_invoice.last_created.hours} ម៉ោង
                                    ${res.data.close_invoice.last_created.minutes} នាទី
                    បង្កើតចុងក្រោយដោយ ៖ ${res.data.close_invoice.creator_name}!</span><br><span class="font-medium">
                    ចំនួន ៖ ${res.data.invoice_counts}</span>`,
                    icon: {
                        show: true,
                        name: 'mat_outline:check',
                        color: 'primary',
                    },
                    actions: {
                        confirm: {
                            show: true,
                            label: 'បង្កើត',
                            color: 'primary',
                        },
                        cancel: {
                            show: true,
                            label: 'បោះបង់',
                        },
                    },
                    dismissible: true,
                };
                const dialogRef = this._helpersConfirmationService.open(configAction);
                dialogRef.afterClosed().subscribe((confirmed: boolean) => {
                    if (confirmed === true) {
                        this._service.generateInvoiceByZone({zone_id}).subscribe({
                            next: () => {
                                this._snackBarService.openSnackBar('បង្កើតវិក្កយបត្របានសម្រេច', 'done')
                                // this.getZoneStatisticsV2()
                                this._cdr.detectChanges()
                            },
                            error: (err) => {
                                let errorMessage = 'មានបញ្ហាក្នុងការបង្កើត';
                                // Display the error message in the snackbar
                                this._snackBarService.openSnackBar(errorMessage, 'error');
                            }
                        })
                    }
                })
            }
        })
    }

}
