// ================================================================>> Core Library (Angular)
import { DatePipe, DecimalPipe, NgClass, NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';

// ================================================================>> Third Party Library (Angular Material)
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

// ================================================================>> Custom Library (Application-specific)
import { env } from 'envs/env';
import { HelperConfirmationConfig, HelperConfirmationService } from 'helper/services/confirmation';
import { SnackbarService } from 'helper/services/snack-bar/snack-bar.service';
import GlobalConstants from 'helper/shared/constants';
import { ProductsTypeDialogComponent } from './dialog/component';
import { ProductsTypeService } from './type.service';
import { Data, List } from './type.types';

@Component({
    selector: 'products-type',
    standalone: true,
    templateUrl: './type.component.html',
    styleUrl: './type.component.scss',
    imports: [
        MatTableModule,
        NgClass,
        NgIf,
        DecimalPipe,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        DatePipe,
    ]
})

export class ProductsTypeComponent implements OnInit {

    private typeService = inject(ProductsTypeService);
    private snackBarService = inject(SnackbarService);
    displayedColumns: string[] = ['no', 'name', 'n_of_products', 'created_at', 'action'];
    dataSource: MatTableDataSource<Data> = new MatTableDataSource<Data>([]);

    fileUrl: string = env.FILE_BASE_URL; // Assuming this is the base URL for file-related operations
    total: number = 10;
    limit: number = 10;
    page: number = 1;
    from: Date;
    to: Date;
    receipt_number: string = '';

    isLoading: boolean = false;

    ngOnInit(): void {
        // Initialize data by fetching from the backend on component initialization
        this.isLoading = true;

        this.typeService.list().subscribe({

            next: (response: List) => {

                // Update the data source with the received data
                this.dataSource.data = response.data;

                // Set isLoading to false to indicate that data loading is complete
                this.isLoading = false;
            },

            error: (err: HttpErrorResponse) => {

                // Display a snackbar notification with an error message, falling back to a generic error message if not available
                this.snackBarService.openSnackBar(err?.error?.message ?? GlobalConstants.genericError, GlobalConstants.error);
                this.isLoading = false;
            }
        });
    }

    private matDialog = inject(MatDialog);

    create(): void {

        // Create a new MatDialogConfig to configure the appearance and behavior of the dialog
        const dialogConfig = new MatDialogConfig();

        // Set the initial data to be passed to the ProductsTypeDialogComponent
        dialogConfig.data = {

            title: 'បង្កើតប្រភេទ',
            type: null
        };

        // Configure the width, minimum height, and autofocus settings for the dialog
        dialogConfig.autoFocus = false;
        dialogConfig.position = { right: '0px' };
        dialogConfig.height = '100dvh';
        dialogConfig.width = '100dvw';
        dialogConfig.maxWidth = '550px';
        dialogConfig.panelClass = 'custom-mat-dialog-as-mat-drawer';
        dialogConfig.enterAnimationDuration = '0s';

        // Open the dialog with ProductsTypeDialogComponent as the content component and apply the configuration
        const dialogRef = this.matDialog.open(ProductsTypeDialogComponent, dialogConfig);

        // Subscribe to the ResponseData observable in the ProductsTypeDialogComponent
        dialogRef.componentInstance.ResponseData.subscribe((type: Data) => {

            // Get the current data from the data source
            const data = this.dataSource.data;

            // Push the new type data to the data array
            data.push({
                id: type.id,
                name: type.name,
                image: type.image,
                n_of_products: type.n_of_products,
                created_at: type.created_at
            });

            // Sort the data array alphabetically based on the 'name' property
            data.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

            // Update the data source with the modified data
            this.dataSource.data = data;
        });
    }

    update(row: Data): void {

        // Create a new MatDialogConfig to configure the appearance and behavior of the dialog
        const dialogConfig = new MatDialogConfig();

        // Set the initial data to be passed to the ProductsTypeDialogComponent
        dialogConfig.data = {

            title: 'កែប្រែប្រភេទ',
            type: row
        };

        // Configure the width, minimum height, and autofocus settings for the dialog
        dialogConfig.autoFocus = false;
        dialogConfig.position = { right: '0px' };
        dialogConfig.height = '100dvh';
        dialogConfig.width = '100dvw';
        dialogConfig.maxWidth = '550px';
        dialogConfig.panelClass = 'custom-mat-dialog-as-mat-drawer';
        dialogConfig.enterAnimationDuration = '0s';

        // Open the dialog with ProductsTypeDialogComponent as the content component and apply the configuration
        const dialogRef = this.matDialog.open(ProductsTypeDialogComponent, dialogConfig);

        // Subscribe to the ResponseData observable in the ProductsTypeDialogComponent
        dialogRef.componentInstance.ResponseData.subscribe((type: Data) => {

            // Find the index of the updated row in the data source
            const index = this.dataSource.data.indexOf(row);

            // Update the 'name' property of the corresponding row with the edited name from the dialog
            this.dataSource.data[index].name = type.name;
            this.dataSource.data[index].image = type.image;
        });
    }

    // Deleting a product with confirmation
    private helpersConfirmationService = inject(HelperConfirmationService)
    onDelete(type: Data): void {

        // Build the configuration for the confirmation dialog
        const configAction: HelperConfirmationConfig = {

            title: `Remove <strong> ${type.name} </strong>`,
            message: 'Are you sure you want to remove this receipt number permanently? <span class="font-medium">This action cannot be undone!</span>', // Confirmation message

            icon: {

                show: true,
                name: 'heroicons_outline:exclamation-triangle',
                color: 'warn',
            },

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

        // Open the confirmation dialog and save the reference
        const dialogRef = this.helpersConfirmationService.open(configAction);

        // Subscribe to the afterClosed event of the dialog reference
        dialogRef.afterClosed().subscribe((result: string) => {

            // Check if the user confirmed the action
            if (result && typeof result === 'string' && result === 'confirmed') {

                // Call the delete method from the service to remove the type
                this.typeService.delete(type.id).subscribe({

                    next: (response: { status_code: number, message: string }) => {

                        // If successful, filter the deleted type from the data source
                        this.dataSource.data = this.dataSource.data.filter((v: Data) => v.id != type.id);
                        // Display a success message using the snackbar service
                        this.snackBarService.openSnackBar(response.message, GlobalConstants.success);
                    },
                    error: (err: HttpErrorResponse) => {

                        // Handle errors by displaying an error message using the snackbar service
                        this.snackBarService.openSnackBar(err?.error?.message || GlobalConstants.genericError, GlobalConstants.error);
                    }
                });
            }
        });
    }

    getTotal(): number {
        // Use map to extract the 'n_of_products' property from each item in the dataSource
        return this.dataSource.data.map(t => t.n_of_products)
            // Use reduce to sum up all the extracted values
            .reduce((acc, value) => Number(acc) + Number(value), 0);
    }
}
