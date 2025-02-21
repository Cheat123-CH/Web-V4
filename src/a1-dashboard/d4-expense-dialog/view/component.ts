import { CommonModule } from '@angular/common';

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatDialogClose } from '@angular/material/dialog';
import { HelperConfirmationService, HelperConfirmationConfig } from 'helper/services/confirmation';
import { SnackbarService } from 'helper/services/snack-bar/snack-bar.service';
import { env } from 'envs/env';

//============================> service and component
import { ExpenseService } from '../service';
import { Expense, ExpenseDetail, ExpenseViewInterface } from '../interface';
@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    MatIcon,
    MatDialogClose,
  ],
  templateUrl: './template.html',
  styleUrl: './style.scss'
})
export class ViewExpense implements OnInit {

    fileUrl = env.FILE_BASE_URL;
    isLoading = false
    expenseDetail : ExpenseDetail[] = []
    expenseInfo   : Expense
    constructor(
        private _dialogRef: MatDialogRef<ViewExpense>,
        private _snackbar : SnackbarService,
        private _service: ExpenseService,
        private _helpersConfirmationService: HelperConfirmationService,
        @Inject(MAT_DIALOG_DATA) public data : number
      ) { }

    ngOnInit(): void {
        this.viewExpenseDetails() 
    }

    viewExpenseDetails(): void{
        this.isLoading  = true;
        const expenseId = this.data
        this._service.viewExpense(expenseId).subscribe({
            next : (res : ExpenseViewInterface) => {
                this.isLoading     = false
                this.expenseInfo   = res.data
                this.expenseDetail = res.data.expenseDetails
            },
            error : (err) => {
                this.isLoading = false
                console.log(err)
            }
        })
    }
}