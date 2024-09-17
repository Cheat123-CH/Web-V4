import { CommonModule, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { SaleService } from 'app/resources/cashier/sale/sale.service';
import { DetailsService } from 'app/shared/details/details.service';
import { env } from 'envs/env';
import FileSaver from 'file-saver';
import { SnackbarService } from 'helper/services/snack-bar/snack-bar.service';
import GlobalConstants from 'helper/shared/constants';
import { Subject } from 'rxjs';
import { ProductsDialogComponent } from '../dialog/component';
import { Data } from '../product.types';
@Component({
    selector: 'dashboard-gm-fast-view-customer',
    templateUrl: './view.template.html',
    styleUrls: ['./view.style.scss'],
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatDividerModule,
        MatTabsModule,
        MatMenuModule,
        MatCheckboxModule,
        DatePipe,
    ]
})
export class ViewDetailProductComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    // Component properties
    displayedColumns: string[] = ['number', 'name', 'unit_price', 'qty', 'total'];
    dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
    fileUrl = env.FILE_BASE_URL;
    public isLoading: boolean;

    constructor(
        @Inject(MAT_DIALOG_DATA) public element: any,
        private _dialogRef: MatDialogRef<ViewDetailProductComponent>,
        private _matDialog: MatDialog,
        private cdr: ChangeDetectorRef,
        private _snackbar: SnackbarService,
        private saleService: SaleService,
        private detailsService: DetailsService
    ) { }

    ngOnInit(): void {

        console.log(this.dataSource.data);
    }

    closeDialog() {
        this._dialogRef.close();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
