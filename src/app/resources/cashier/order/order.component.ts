// ================================================================>> Core Library
import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

// ================================================================>> Third party Library
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';

import { Subject, takeUntil } from 'rxjs';

// ================================================================>> Custom Library
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { SnackbarService } from 'helper/services/snack-bar/snack-bar.service';
import { ItemComponent } from './item/item.component';
import { OrderService } from './order.service';
import GlobalConstants from 'helper/shared/constants';
import { SharedDetailsComponent } from 'app/shared/details/details.component';
import {Product } from './order.types';
import { Data } from '../sale/sale.types';

interface CartItem {

    id: number;
    name: string;
    qty: number;
    temp_qty: number;
    unit_price: number;
}

@Component({

    selector: 'app-order',
    standalone: true,
    templateUrl: './order.component.html',
    styleUrls: ['./order.component.scss'], // Note: Corrected from 'styleUrl' to 'styleUrls'

    imports: [
        DecimalPipe,
        MatIconModule,
        MatTabsModule,
        ItemComponent,
        FormsModule,
        MatButtonModule,
        MatProgressSpinnerModule
    ]
})

export class OrderComponent implements OnInit, OnDestroy {

    private orderService: OrderService;
    private snackBarService: SnackbarService;
    private _unsubscribeAll: Subject<User> = new Subject<User>();

    data: Data[] = [];
    isLoading: boolean = false;
    carts: CartItem[] = [];
    user: User;
    isOrderBeingMade: boolean = false;
    canSubmit: boolean = false;
    totalPrice: number = 0;

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _userService: UserService,
        private _service: OrderService,
        private _snackBarService: SnackbarService,
    ) {

        // Subscribe to changes in the user's data
        this._userService.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((user: User) => {

            this.user = user;
            // Mark for check - triggers change detection manually
            this._changeDetectorRef.markForCheck();
        });
    }

    ngOnInit(): void {

        // Set isLoading to true to indicate that data is being loaded
        this.isLoading = true;

        // Subscribe to the list method of the orderService
        this.orderService.list().subscribe({

            // This block is executed when there is a successful response
            next: response => {

                // Set the data property to the received data
                this.data = response.data;
                // Set isLoading to false to indicate that data loading is complete
                this.isLoading = false;
            },

            // This block is executed when there is an error in the response
            error: (err: HttpErrorResponse) => {

                // Set isLoading to false to indicate that data loading is complete (even if there's an error)
                this.isLoading = false;
                // Show a snackbar with an error message. If there's no specific error message, show a generic one.
                this.snackBarService.openSnackBar(err?.error?.message || GlobalConstants.genericError, GlobalConstants.error);
            }
        });
    }

    ngOnDestroy(): void {

        // Emit a value through the _unsubscribeAll subject to trigger the unsubscription
        this._unsubscribeAll.next(null);
        // Complete the subject to release resources
        this._unsubscribeAll.complete();
    }


    addToCart(incomingItem: Product, qty = 0): void {

        // Find an existing item in the cart with the same id as the incoming item
        const existingItem = this.carts.find(item => item.id === incomingItem.id);

        if (existingItem) {

            // If the item already exists, update its quantity and temp_qty
            existingItem.qty += qty;
            existingItem.temp_qty = existingItem.qty;

        } else {

            // If the item doesn't exist, create a new CartItem and add it to the cart
            const newItem: CartItem = {

                id: incomingItem.id,
                name: incomingItem.name,
                qty: qty,
                temp_qty: qty,
                unit_price: incomingItem.unit_price,
            };

            this.carts.push(newItem);
            // Set canSubmit to true, indicating that there is at least one item in the cart
            this.canSubmit = true;
        }

        // Calculate and update the total price of the items in the cart
        this.getTotalPrice();
    }

    getTotalPrice(): void {

        // Calculate the total price by iterating over items in the cart and summing the product of quantity and unit price
        this.totalPrice = this.carts.reduce((total, item) => total + (item.qty * item.unit_price), 0);
    }

    remove(value: any, index: number = -1): void {

        // If the value is 0, set canSubmit to true
        if (value === 0) {

            this.canSubmit = true;
        }

        // Remove the item from the cart at the specified index
        this.carts.splice(index, 1);

        // Calculate and update the total price of the items in the cart
        this.getTotalPrice();
    }

    blur(event: any, index: number = -1): void {

        // Store the current quantity before any changes
        const tempQty = this.carts[index].qty;

        // Check if the entered value is 0, and update canSubmit accordingly
        if (event.target.value == 0) {

            this.canSubmit = false;
        } else {

            this.canSubmit = true;
        }

        // Parse the entered value as an integer (base 10)
        const enteredValue = parseInt(event.target.value, 10);

        // Ensure the entered value does not exceed 1000
        if (enteredValue > 1000) {
            event.target.value = '1000';
        }

        // Check if the entered value is falsy (e.g., an empty string)
        if (!event.target.value) {

            // Restore the quantity to its previous value if the entered value is falsy
            this.carts[index].qty = tempQty;
            this.carts[index].temp_qty = tempQty;
        } else {

            // Update the quantity with the entered value
            this.carts[index].qty = enteredValue;
            this.carts[index].temp_qty = enteredValue;
        }

        // Calculate and update the total price of the items in the cart
        this.getTotalPrice();
    }

    private matDialog = inject(MatDialog);
    checkOut(): void {

        // Create a dictionary to represent the cart with item IDs and quantities
        const carts: { [itemId: number]: number } = {};

        this.carts.forEach((item: CartItem) => {

            carts[item.id] = item.qty;
        });

        // Prepare the request body with the serialized cart data
        const body = {

            cart: JSON.stringify(carts)
        };

        // Set the flag to indicate that an order is being made
        this.isOrderBeingMade = true;

        // Make the API call to create an order using the order service
        this.orderService.create(body).subscribe({

            next: response => {

                // Reset the order in progress flag
                this.isOrderBeingMade = false;

                // Clear the cart after a successful order
                this.carts = [];

                // Display a success message
                this.snackBarService.openSnackBar(response.message, GlobalConstants.success);

                // Open a dialog to display order details
                const dialogConfig = new MatDialogConfig();
                dialogConfig.data = response.data;
                dialogConfig.width = "650px";
                dialogConfig.minHeight = "200px";
                dialogConfig.autoFocus = false;
                this.matDialog.open(SharedDetailsComponent, dialogConfig);
            },

            error: (err: HttpErrorResponse) => {

                // Reset the order in progress flag on error
                this.isOrderBeingMade = false;

                // Display an error message
                this.snackBarService.openSnackBar(err?.error?.message || GlobalConstants.genericError, GlobalConstants.error);
            }
        });
    }

}
