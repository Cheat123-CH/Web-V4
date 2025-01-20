// ================================================================================>> Core Library
import { CommonModule }             from '@angular/common';
import { Component, OnInit }        from '@angular/core';
import { FormsModule }              from '@angular/forms';
import { Router }                   from '@angular/router';

// ================================================================================>> Third Party Library
// ===>> Material
import { MatBadgeModule }                       from '@angular/material/badge';
import { MatButtonModule }                      from '@angular/material/button';
import { MatDialog }                            from '@angular/material/dialog';
import { MatIconModule }                        from '@angular/material/icon';
import { MatMenuModule }                        from '@angular/material/menu';
import { MatPaginatorModule, PageEvent }        from '@angular/material/paginator';
import { MatProgressSpinnerModule }             from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule }   from '@angular/material/table';

// ================================================================================>> Custom Library
// ===>> Env
import { env } from 'envs/env';

// ===>> Helper Library
import { helperAnimations }             from 'helper/animations';
import { HelperConfirmationService }    from 'helper/services/confirmation';
import { SnackbarService }              from 'helper/services/snack-bar/snack-bar.service';

// ===>> Shared
import { DialogConfigService }          from 'app/shared/dialog-config.service';
import { ErrorHandleService }           from 'app/shared/error-handle.service';

// ===>> Local
import { Data }                         from './interface';
import { FilterDialogComponent }        from './filter-dialog/component';
import { SaleService }                  from './service';
import { savePDFFromBlob } from 'helper/download-report/save-pdf';

@Component({
    selector    : 'student-listing',
    standalone  : true,
    templateUrl : './template.html',
    styleUrl    : './style.scss',
    animations  : helperAnimations,
    imports     : [
        CommonModule,
        FormsModule,

        MatPaginatorModule,
        MatTableModule,
        MatProgressSpinnerModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatBadgeModule,
    ],
})
export class SaleComponent implements OnInit {

    // ===>> Data
    public data             : Data[]  = [];
    public setupData        : any     = {};
    public isLoading        : boolean = false;
    public dataSource       : MatTableDataSource<Data> = new MatTableDataSource<Data>([]);
    public displayedColumns : string[] = [
        'no', 
        'receipt', 
        'price', 
        'ordered_at', 
        'device', 
        'seller', 
        'action'
    ];

    // ===>> Search, Sort & Filter
    public key                  : string = '';

    public cashier              : number = 0;
    public platform             : number = 0;
    public fromDate             : string = '';
    public toDate               : string = '';

    public badgeValue           : any;

    public shortedItems: any[] = [
        { 
            value: 'total_price' , 
            name: 'តម្លៃលក់' 
        },
        {
            value: 'ordered_at', 
            name: 'ថ្ងៃបញ្ជាទិញ',
        }
    ];
    public selectedShortedItem  :any    = this.shortedItems[0];
    public shortedOrder         :string = 'desc';


    // ===>> Download
    public isDownloadingReport      : boolean   = false;
    public isDownloadingCV          : boolean   = false;
    public selectedCVDownloadIndex  : number    = -1;

    // ===>> File Url
    public FILE_URL         : string = env.FILE_BASE_URL

    // ===>> Pagination
    public page                 : number = 1;
    public limit                : number = 20;
    public total                : number = 0;


    constructor(
        private _service                    : SaleService,
        private _snackbarService            : SnackbarService,
        private _router                     : Router,
        private _matDialog                  : MatDialog,
        private _errorHandleService         : ErrorHandleService,
        private _dialogConfigService        : DialogConfigService,
        private _helpersConfirmationService : HelperConfirmationService
    ) {}

    ngOnInit(): void {

        this.getSetupData();
        this.getData();

    }

    // ====================================================================>> Get Setup Data for Filtering
    getSetupData(): void {
        // ===>> Call API
        this._service.getSetupData().subscribe({
            next: (res:any) => {
                this.setupData = res;
                this.shortedItems = res.shortItems;
                this.platform = res.platform;
                //this.openFilterDialog();
            },
            error: (err) => {
                this._errorHandleService.handleHttpError(err);
            },
        });
    }

    // ====================================================================>> Get Data for Listing
    getData(){;

        // ===>> Set Loading UI
        this.isLoading = true;

        // ===>> Get Filter
        const params = this.prepareSearchSortFilterParam();
        this._service.getData(params).subscribe({
            next: (res) => {

                // ===>> Maping data & DataSource
                this.data            =   res.data;
                this.dataSource.data =   this.data;

                // ===>> Update Pagination Variable
                this.total           =   res.pagination.total;
                this.page            =   res.pagination.page;
                this.limit           =   res.pagination.limit;

                // ===>> Stop Loading UI
                this.isLoading       =   false;

            },
            error: (err) => {

                // ===>> Stop Loading UI
                this.isLoading = false;

                // ===>> Display Error
                this._errorHandleService.handleHttpError(err);
            },
        });
    }

    // ====================================================================>> Generate Search, Sort & Filter
    prepareSearchSortFilterParam(){
        // ===>> Prepare Query Parameter
        // let params:any = { limit: this.limit, page: this.page};

        const params: any = {
            limit: this.limit,
            page: this.page > 0 ? this.page : 1, // Ensure page starts from 1
            sort_by: this.selectedShortedItem.value,
            order: this.shortedOrder,
        };

        // ===>> Search
        if(this.key != ''){
            params.key = this.key
        }

        // ===>> Filter

        if(this.cashier != 0 && this.cashier != null){
            params.cashier = this.cashier
        }

        if (this.platform != 0 && this.platform != null) {
            params.platform = this.platform
        }

        if(this.fromDate != ''){
            params.from = this.fromDate
        }

        if(this.toDate != ''){
            params.to = this.toDate
        }


        // ===>> Sort
        params.sort         = this.selectedShortedItem.value;
        params.order        = this.shortedOrder;

        return params;
    }

    // ====================================================================>> Pagination chagne for Next or Prevous
    onPageChanged(event: PageEvent): void {
        this.limit  =   event.pageSize;
        this.page   =   event.pageIndex + 1;
        this.getData();
    }

    // ====================================================================>> Open Filter Dialog
    openFilterDialog(): void {

        const dialogConfig = this._dialogConfigService.getDialogConfig({
            setup: this.setupData,
            filter: {
                cashier       : this.cashier,
                from          : this.fromDate,
                to            : this.toDate,
                platform      : this.platform,
            }
        });

        const dialogRef = this._matDialog.open(FilterDialogComponent, dialogConfig);

        dialogRef.componentInstance.filterSubmitted.subscribe((res: any) => {

            // Count filter selected from the Filter Dialog
            const nullOrEmptyCount = Object.values(res).filter(value => value === null || value === 0).length;
            this.badgeValue = Object.keys(res).length - nullOrEmptyCount;

            // Map Filter
            this.cashier      = res.cashier;
            this.fromDate     = res.from;
            this.toDate       = res.to;
            this.platform     = res.platform;

            

            // ===>> Refresh Data
            this.getData();
        });
    }

    // ====================================================================>> Select Short Item
    selectShortedItem(item = {}){
        this.selectedShortedItem = item;
        this.getData();
    }

    // ====================================================================>> Select Short Order
    selectShortOrder(){

        // Mapping the data
        this.shortedOrder = this.shortedOrder == 'desc' ? 'asc' : 'desc';

        // refresh data
        this.getData();

    }

    // ====================================================================>> Clear Short Filter
    clearFilter(): void{

        // Set all filters to 0
        // this.cashier      = 0;
        // this.fromDate     = '';
        // this.toDate       = '';
        this.platform     = 0;
        this.badgeValue   = 0;

        // Refresh Data
        this.getData();
    }

    // ====================================================================>> Get Data for Listing
    view(id: number): void {
        this._router.navigateByUrl( `/admin/student/view/${id}`);
    }

    // ====================================================================>> Delete
    delete(data:Data): void {

        // ===>> Open Confirmation Dialog
        //const dialogRef = this._helpersConfirmationService.open('delete');

        // dialogRef.afterClosed().subscribe((result: string | undefined) => {

        //     if (result === 'confirmed') {

        //         this.isLoading = true;

        //         this._service.delete('students', data.id).subscribe({

        //             next: (res) => {
        //                 this.getData();
        //                 this._snackbarService.openSnackBar(res.message, '');
        //                 this.isLoading = false;
        //             },

        //             error: (err) => {
        //                 this._errorHandleService.handleHttpError(err);
        //                 this.isLoading = false;
        //             },

        //         });
        //     }
        // });
    }

    // ====================================================================>> Upgrade to Member
    

    // ====================================================================>> Download CV
    downloadInvoice(cvId: number, index:number = 0): void {


        this.selectedCVDownloadIndex  = index;
        this.isDownloadingCV          =   true; // Indicate the download process is ongoing

        // Call the service to fetch the Base64-encoded PDF
        // this._service.downloadInvoice(cvId).subscribe({
        //     next: (response:any) => {

        //         if (response.result) {

        //             savePDFFromBlob(`CV-${response.name}-`, response.result);

        //         } else {
        //             this._snackbarService.openSnackBar('No data available for the report.', 'Close');
        //         }

        //         this.selectedCVDownloadIndex    = -1
        //         this.isDownloadingCV            = false;
        //     },
        //     error: (err) => {

        //         this.selectedCVDownloadIndex    = -1;
        //         this.isDownloadingCV            = false;
        //         this._errorHandleService.handleHttpError(err);

        //     },
        //);
    }

    // ====================================================================>> Download Report
    downloadReport(): void {

        // ===>> Get Filter
        const params = this.prepareSearchSortFilterParam();

        // ===>> Set Loading
        this.isDownloadingReport = true;

        // ===>> Call API
        this._service.downloadReport().subscribe({
            next: (res:any) => {

                savePDFFromBlob('របាយការណ៍លក់', res.result);
                // Display Message
                this._snackbarService.openSnackBar('របាយការណ័ត្រូវបានទាញយកដោយជោគជ័យ', '');

                // Stop the spinner
                this.isDownloadingReport       =   false;
            },
            error: (err) => {

                this.isDownloadingReport = false;
                this._errorHandleService.handleHttpError(err);
            },
        });
    }
}
