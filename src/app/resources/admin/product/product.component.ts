// ================================================================>> Core Library (Angular)
import { DatePipe, DecimalPipe, NgClass, NgIf } from '@angular/common';
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
import { FilterProductComponent } from './filter/component';
import { ProductService } from './product.service';
import { Data, List, ProductType, User } from './product.types';
import { ViewDetailProductComponent } from './view/view.component';


@Component({
    selector: 'app-product',
    standalone: true,
    templateUrl: './product.component.html',
    styleUrl: './product.component.scss',
    imports: [
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
        MatMenuModule
    ]
})

export class ProductComponent implements OnInit {

    // Injecting necessary services
    private productService = inject(ProductService);
    private snackBarService = inject(SnackbarService);
    // Creating a product using a dialog
    private matDialog = inject(MatDialog);
    // Component properties
    displayedColumns: string[] = ['no', 'product', 'price', 'total_sale', 'total_sale_price', 'created', 'seller', 'action'];
    dataSource: MatTableDataSource<Data> = new MatTableDataSource<Data>([]);
    fileUrl: string = env.FILE_BASE_URL;
    setup: { productTypes: ProductType[]; users: User[] } = { productTypes: [], users: [] };
    productTypes: ProductType[] = [];
    users: User[] = [];
    total: number = 10;
    limit: number = 10;
    page: number = 1;
    key: string = '';
    type_id: number = 0;
    isLoading: boolean = false;
    constructor(
        private cdr: ChangeDetectorRef,
        private dialog: MatDialog
    ) { }

    // Initialization logic
    ngOnInit(): void {
        this.initSetup();
        this.list(this.page, this.limit);
    }

    // Fetches initial setup data for products
    initSetup(): void {
        this.productService.setup().subscribe({
            next: (response) => {
                this.setup = response.data; // Store the setup data
                this.productTypes = response.data.productTypes;
                this.users = response.data.users;
            },
            error: (err) => {
                console.error('Error fetching setup data:', err); // Handle errors
            },
        });
    }

    // Fetches the list of products based on parameters
    list(_page: number = 1,
        _page_size: number = 10,
        filter_data: { timeType?: string; platform?: string; cashier?: number; startDate?: string; endDate?: string } = {}): void {
        const params: {
            page: number;
            page_size: number;
            key?: string;
            timeType?: string;
            creator_id?: number;
            type_id?: number;
            startDate?: string;
            endDate?: string;
        } = {
            page: _page,
            page_size: _page_size,
            ...filter_data // Spread operator to add filters dynamically
        };

        if (this.key !== '') {
            params.key = this.key;
        }
        this.isLoading = true;
        this.productService.list(params).subscribe({
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

    filter_data: any;
    openFilterDialog(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.data = this.setup
        dialogConfig.restoreFocus = false; // Avoids focus issues
        dialogConfig.position = { right: '0px' };
        dialogConfig.height = '100dvh';
        dialogConfig.width = '100dvw';
        dialogConfig.maxWidth = '550px';
        dialogConfig.panelClass = 'custom-mat-dialog-as-mat-drawer';
        dialogConfig.enterAnimationDuration = '0s';
        const dialogRef = this.dialog.open(FilterProductComponent, dialogConfig);
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.filter_data = result;
                this.cdr.detectChanges();
                this.list(1, 10, this.filter_data);
            }
        });
    }

    // Handles page change event from the paginator
    onPageChanged(event: PageEvent): void {
        if (event && event.pageSize) {

            this.limit = event.pageSize;
            this.page = event.pageIndex + 1;
            this.list(this.page, this.limit);
        }
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
            this.list();
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
            this.list()
            this.dataSource.data = data;
        });
    }

    saving: boolean = false;
    getReport() {
        this.saving = true;
        this.productService.getDataProductReport().subscribe({
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
                this.productService.delete(product.id).subscribe({

                    // Handle the successful response from the delete operation
                    next: (response: { status_code: number, message: string }) => {

                        // Update the data source by filtering out the deleted product
                        this.dataSource.data = this.dataSource.data.filter((v: Data) => v.id != product.id);
                        this.list()
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
