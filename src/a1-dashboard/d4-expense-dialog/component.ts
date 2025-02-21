import { ChangeDetectorRef, Inject,Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatLabel } from '@angular/material/form-field';
import {FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule, MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


// ===================================================> interface, service
import { DashbordService } from '../service';
import { ExpenseService } from './service';
import { env } from 'envs/env';
import { Expense, ExpenseDetail, ExpenseInterface } from './interface';
import { ViewExpense } from './view/component';

@Component({
    standalone: true,
    imports: [
      CommonModule,
      NgFor,
      NgIf,
      MatIcon,
      MatInput,
      MatMenuModule,
      MatIconModule,
      MatFormField,
      MatSelect,
      MatLabel,
      MatDialogModule,
      FormsModule,
      ReactiveFormsModule,
      MatOption,
      MatSelectModule,
      MatFormFieldModule,
      MatOptionModule,
      MatSelectModule,
      MatProgressSpinnerModule
    ],
    templateUrl: './template.html',
    styleUrl: './style.scss'
  })

  export class ExpenseDialog implements OnInit{

    isLoading = false
    key       = ''


    constructor(
        private _service: ExpenseService,
        private _dialog: MatDialog,
      ) { }

      ngOnInit(): void {
          this.getExpenseInfo()
          this.setParamsforListing()
      }

      expenseInfo    : Expense[] = []
      expenseDetails : ExpenseDetail

      getExpenseInfo() : void {
        //set params to 10 only
        const params = this.setParamsforListing()

        this.isLoading = true
        this._service.getExpenseType(params).subscribe({
            next: (res: ExpenseInterface) => {
                this.expenseInfo = res.data
                this.isLoading = false; // Stop loading after success
            },
            error: (err) => {
                this.isLoading = false; // Stop loading even if an error occurs
            }
        });
      }

      setParamsforListing(): any{
        const params : {
            limit : number
            search   ?: string
        } = {
            limit : 10
        }

        if(this.key !== ''){
            params.search = this.key
        }
        return params
      }

      View(expenseId : number): void{
        const dialogConfig                  = new MatDialogConfig();
        dialogConfig.autoFocus              = false;
        dialogConfig.position               = { right: '0px' };
        dialogConfig.width                  = '600px';
        dialogConfig.height                 = '100vh';
        dialogConfig.panelClass             = 'side-dialog';
        dialogConfig.enterAnimationDuration = '0s';
        dialogConfig.data                   = expenseId
        this._dialog.open(ViewExpense, dialogConfig);
      }
} 