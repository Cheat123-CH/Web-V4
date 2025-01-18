// ================================================================>> Core Library (Angular)
import { CommonModule, DatePipe, DecimalPipe, NgClass, NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

// ================================================================>> Angular Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

// ================================================================>> Custom Library (Application-specific)
import { env } from 'envs/env';
import FileSaver from 'file-saver';
import { HelperConfirmationConfig, HelperConfirmationService } from 'helper/services/confirmation';
import { SnackbarService } from 'helper/services/snack-bar/snack-bar.service';
import GlobalConstants from 'helper/shared/constants';
import { ProductsDialogComponent } from './dialog/component';
// import { FilterProductComponent } from './filter/component';
import { ProductService } from './service';
import { Data, List, ProductType, User } from './interface';
import { ViewDetailProductComponent } from './view/component';
// import { Dialog } from '@angular/cdk/dialog';
import { DialogConfigService } from 'app/shared/dialog-config.service';
import { FilterDialogComponent } from './filter-dialog/component';
import { ErrorHandleService } from 'app/shared/error-handle.service';
import { MatBadgeModule } from '@angular/material/badge';
import { FilterProductComponent } from './filter/component';

@Component({
    selector: 'app-product',
    standalone: true,
    templateUrl: './product.component.html',
    styleUrl: './product.component.scss',
    imports: [
        CommonModule,
        MatTableModule,
        NgClass,
        NgIf,
        DatePipe,
        DecimalPipe,
        FormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatIconModule,
        MatButtonModule,
        MatPaginatorModule,
        MatMenuModule,
        MatBadgeModule,
    ]
})

export class ProductComponent implements OnInit {

    // Injecting necessary services
    private _service = inject(ProductService);
    private snackBarService = inject(SnackbarService);
    // Creating a product using a dialog
    private matDialog = inject(MatDialog);
    public data: Data[] = [];
    // Component properties
    displayedColumns: string[] = [
        'no',
        'product',
        'price',
        'total_sale',
        'total_sale_price',
        'created',
        'seller',
        'action'
    ];


    dataSource: MatTableDataSource<Data> = new MatTableDataSource<Data>([]);
    fileUrl: string = env.FILE_BASE_URL;
    setup: {

        productTypes: ProductType[]; users: User[]

    } = {

        productTypes: [], users: []

    };

    public productTypes            :   ProductType[]  = [];
    public users                   :   User[]         = [];
    public total                   :   number         = 0;
    public limit                   :   number         = 20;
    public page                    :   number         = 1;
    public isLoading               :   boolean        = false;
    public setupData               :   any            = {};


    // Search,sort and filter

    public key                     :   string         = '';
    public type_id                 :   number         = 0; // Product type ID
    public name                    :   string         = '';
    public shortedItems: any[] = [
        { name: 'ប្រភេទផលិតផល', value: 'type_id' },
        { name: 'ឈ្មោះផលិតផល', value: 'name' },
    ];
    public selectedShortedItem     :  any             = this.shortedItems[0];
    public shortedOrder            :  string          = 'desc';
    public _dialogConfigService    :   DialogConfigService;
    badgeValue: any;

    // Constructor
    constructor(
        private cdr                         : ChangeDetectorRef,
        private _matDialog                  : MatDialog,
        private _errorHandleService         : ErrorHandleService,

    ) { }

    // Initialization logic
    ngOnInit(): void {
        this.getSetupData();
        this.getData();
    }

    // // Fetches initial setup data for products
    // initSetup(): void {
    //     this._service.setup().subscribe({
    //         next: (response) => {
    //             this.setup = response.data; // Store the setup data
    //             this.productTypes = response.data.productTypes;
    //             this.users = response.data.users;
    //         },
    //         error: (err) => {
    //             console.error('Error fetching setup data:', err); // Handle errors
    //         },
    //     });
    // }
    // ====================================================================>> Get Setup Data for Filtering
    getSetupData(): void {
        // ===>> Call API
        this._service.getSetupData().subscribe({
            next: (res:any) => {
                this.setupData = res;
            },
            error: (err) => {
                this._errorHandleService.handleHttpError(err);
            },
        });
    }
    // // Fetches the list of products based on parameters
    // getData(_page: number = 1,
    //     _page_size: number = 10,
    //     filter_data: { timeType?: string; platform?: string; cashier?: number; startDate?: string; endDate?: string } = {}): void {
    //     const params: {
    //         page: number;
    //         page_size: number;
    //         key?: string;
    //         timeType?: string;
    //         creator_id?: number;
    //         type_id?: number;
    //         startDate?: string;
    //         endDate?: string;
    //     } = {
    //         page: _page,
    //         page_size: _page_size,
    //         ...filter_data // Spread operator to add filters dynamically
    //     };

    //     if (this.key !== '') {
    //         params.key = this.key;
    //     }
    //     this.isLoading = true;
    //     this._service.getData(params).subscribe({
    //         next: (res: List) => {
    //             this.dataSource.data = res.data;
    //             this.total = res.pagination.totalItems;
    //             this.limit = res.pagination.perPage;
    //             this.page = res.pagination.currentPage;
    //             this.isLoading = false; // Set loading state to false once data is loaded
    //         },
    //         error: (err: HttpErrorResponse) => {
    //             this.isLoading = false; // Ensure loading state is false even on error
    //             this.snackBarService.openSnackBar(
    //                 err?.error?.message ?? GlobalConstants.genericError,
    //                 GlobalConstants.error
    //             );
    //         }
    //     });
    // }


    // ====================================================================>> Get Data for Listing
    getData(){;

        // ===>> Set Loading UI
        this.isLoading = true;

        // ===>> Get Filter
        const params = this.prepareSearchSortFilterParam();
        console.log(params)
        // this._service.getData(params).subscribe({
        //     next: (res) => {

        //         // ===>> Maping data & DataSource
        //         this.data            =   res.data;
        //         this.dataSource.data =   this.data;

        //         // ===>> Update Pagination Variable
        //         this.total           =   res.pagination.total;
        //         this.page            =   res.pagination.page;
        //         this.limit           =   res.pagination.limit;

        //         // ===>> Stop Loading UI
        //         this.isLoading       =   false;

        //     },
        //     error: (err) => {

        //         // ===>> Stop Loading UI
        //         this.isLoading = false;

        //         // ===>> Display Error
        //         this._errorHandleService.handleHttpError(err);
        //     },
        // });
        this._service.getData(params).subscribe({
            next: (res: List) => {
                this.dataSource.data = res.data;
                this.total = res.pagination.total;
                this.limit = res.pagination.limit;
                this.page = res.pagination.totalPage;
                this.isLoading = false;
            },
            error: (err: HttpErrorResponse) => {
                this.isLoading = false;
                this.snackBarService.openSnackBar(
                    err?.error?.message || GlobalConstants.genericError,
                    GlobalConstants.error
                );
            }
        });
        
    }
    
    prepareSearchSortFilterParam(): any {
        const params: any = { limit: this.limit, page: this.page };
    
        if (this.key) {
            params.key = this.key; // Add search key if available
        }
        if (this.type_id && this.type_id !== 0) {
            params.type_id = this.type_id; // Add type filter if set
        }
        if (this.name && this.name !== '') {
            params.name = this.name; // Add name filter if provided
        }
    
       // ===>> Sort
       params.sort_by      = this.selectedShortedItem.value;
       params.order        = this.shortedOrder;
    
        return params;
    }
    


    // ====================================================================>> Select Short Item
    //Item
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
        this.type_id            = 0;
        this.name               = '';
        this.badgeValue         = 0;

        // Refresh Data
        this.getData();
    }



    // // // filter_data: any;
    // openFilterDialog(): void {
    //     const dialogConfig = new MatDialogConfig();
    //     dialogConfig.autoFocus = false;
    //     dialogConfig.data = this.setup
    //     dialogConfig.restoreFocus = false; // Avoids focus issues
    //     dialogConfig.position = { right: '0px' };
    //     dialogConfig.height = '100dvh';
    //     dialogConfig.width = '100dvw';
    //     dialogConfig.maxWidth = '550px';
    //     dialogConfig.panelClass = 'custom-mat-dialog-as-mat-drawer';
    //     dialogConfig.enterAnimationDuration = '0s';
    //     const dialogRef = this._matDialog.open(FilterProductComponent, dialogConfig);
        
    //     dialogRef.afterClosed().subscribe((result) => {
    //         if (result) {
    //             // this.filter_data = result;
    //             this.cdr.detectChanges();
    //             this.getData();
    //         }
    //     });
    // }
    
    // ====================================================================>> Open Filter Dialog

    openFilterDialog(): void {
        
        const dialogConfig = this._dialogConfigService.getDialogConfig({
            setup: this.setupData,
            filter: {
                type_id             : this.type_id,
                name                : this.name,
            }
        });

        const dialogRef = this._matDialog.open(FilterDialogComponent, dialogConfig);

        dialogRef.componentInstance.filterSubmitted.subscribe((res: any) => {

            // Count filter selected from the Filter Dialog
            const nullOrEmptyCount = Object.values(res).filter(value => value === null || value === 0).length;
            this.badgeValue = Object.keys(res).length - nullOrEmptyCount;

            // Map Filter
            this.type_id      = res.type_id;
            this.name         = res.name;

            // ===>> Refresh Data
            this.getData();
        });
    }

     // ====================================================================>> Pagination chagne for Next or Prevous
    onPageChanged(event: PageEvent): void {
        this.limit  =   event.pageSize;
        this.page   =   event.pageIndex + 1;
        this.getData();
    }

    create(): void {

        const dialogConfig = new MatDialogConfig();

        dialogConfig.data = {

            title: 'បង្កើតផលិតផល',
            product: null,
            setup: this.setup.productTypes
        };

        dialogConfig.autoFocus = false;
        dialogConfig.position = { right: '0px' };
        dialogConfig.height = '100dvh';
        dialogConfig.width = '100dvw';
        dialogConfig.maxWidth = '550px';
        dialogConfig.panelClass = 'custom-mat-dialog-as-mat-drawer';
        dialogConfig.enterAnimationDuration = '0s';

        const dialogRef = this.matDialog.open(ProductsDialogComponent, dialogConfig);
        dialogRef.componentInstance.ResponseData.subscribe((product: Data) => {
            const data = this.dataSource.data;
            data.unshift(product);
            this.getData();
            this.dataSource.data = data;
        });
    }

    view(element: Data) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.position = { right: '0px' };
        dialogConfig.height = '100dvh';
        dialogConfig.width = '100dvw';
        dialogConfig.maxWidth = '750px';
        dialogConfig.panelClass = 'custom-mat-dialog-as-mat-drawer';
        dialogConfig.enterAnimationDuration = '0s';
        dialogConfig.data = element
        const dialogRef = this.matDialog.open(ViewDetailProductComponent, dialogConfig);
    }

    // Updating a product using a dialog
    update(row: Data): void {

        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = {

            title: 'កែប្រែផលិតផល',
            product: row,
            setup: this.setup.productTypes
        };

        dialogConfig.autoFocus = false;
        dialogConfig.position = { right: '0px' };
        dialogConfig.height = '100dvh';
        dialogConfig.width = '100dvw';
        dialogConfig.maxWidth = '550px';
        dialogConfig.panelClass = 'custom-mat-dialog-as-mat-drawer';
        dialogConfig.enterAnimationDuration = '0s';
        const dialogRef = this.matDialog.open(ProductsDialogComponent, dialogConfig);

        dialogRef.componentInstance.ResponseData.subscribe((product: Data) => {

            const index = this.dataSource.data.indexOf(row);
            const data = this.dataSource.data;
            data[index] = product;
            this.getData()
            this.dataSource.data = data;
        });
    }

    saving: boolean = false;
    getReport() {
        this.saving = true;
        this._service.getDataProductReport().subscribe({
            next: (response) => {
                this.saving = false;
                let blob = this.b64toBlob(response.data, 'application/pdf');
                FileSaver.saveAs(blob, 'របាយការណ៍លក់តាមផលិតផល' + '.pdf');
                // Show a success message using the snackBarService
                this.snackBarService.openSnackBar('របាយការណ៍ទាញយកបានជោគជ័យ', GlobalConstants.success);
            },
            error: (err: HttpErrorResponse) => {
                // Set saving to false to indicate the operation is completed (even if it failed)
                this.saving = false;
                // Extract error information from the response
                const errors: { type: string; message: string }[] | undefined = err.error?.errors;
                let message: string = err.error?.message ?? GlobalConstants.genericError;

                // If there are field-specific errors, join them into a single message
                if (errors && errors.length > 0) {
                    message = errors.map((obj) => obj.message).join(', ');
                }
                // Show an error message using the snackBarService
                this.snackBarService.openSnackBar(message, GlobalConstants.error);
            },
        });
    }

    b64toBlob(b64Data: string, contentType: string, sliceSize?: number) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;
        var byteCharacters = atob(b64Data);
        var byteArrays = [];
        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);
            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        var blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }
    // Deleting a product with confirmation
    private helpersConfirmationService = inject(HelperConfirmationService)
    onDelete(product: Data): void {

        // Build the config form
        const configAction: HelperConfirmationConfig = {

            title: `Remove <strong> ${product.name} </strong>`,
            message: 'Are you sure you want to remove this receipt number permanently? <span class="font-medium">This action cannot be undone!</span>',
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

                // If the result is 'confirmed', proceed with the product deletion
                this._service.delete(product.id).subscribe({

                    // Handle the successful response from the delete operation
                    next: (response: { status_code: number, message: string }) => {

                        // Update the data source by filtering out the deleted product
                        this.dataSource.data = this.dataSource.data.filter((v: Data) => v.id != product.id);
                        this.getData()
                        // Show a success message using the SnackbarService
                        this.snackBarService.openSnackBar(response.message, GlobalConstants.success);
                    },

                    // Handle errors that occur during the delete operation
                    error: (err: HttpErrorResponse) => {
                        this.snackBarService.openSnackBar(err?.error?.message || GlobalConstants.genericError, GlobalConstants.error);
                    }
                });
            }
        });
    }
}
