//======================> Library
import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { NgFor } from '@angular/common';
import { MatDialogClose } from '@angular/material/dialog';

//=============================>Helper and Service
import { HelperConfirmationService, HelperConfirmationConfig } from 'helper/services/confirmation';
import { SnackbarService } from 'helper/services/snack-bar/snack-bar.service';
import { InvoiceService } from '../invoice.service';
import { InvoiceDetail } from '../invoice';
import { env } from 'envs/env';
@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    MatIcon,
    MatDialogClose,
  ],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss'
})
export class PaymentComponent implements OnInit {

  fileUrl       = env.FILE_BASE_URL;
  invoiceDetail : InvoiceDetail;
  invoicePrice  : any[] = [];

  totalPriceUSD : number;
  totalPriceKHR : number;

  constructor(
    private _dialogRef                   : MatDialogRef<PaymentComponent>,
    private _snackbar                    : SnackbarService,
    private _service                     : InvoiceService,
    private _helpersConfirmationService  : HelperConfirmationService,
    @Inject(MAT_DIALOG_DATA) public data : any,
  ) { }

  ngOnInit(): void {
    this.showInvoiceDetail();
  }

  showInvoiceDetail(): void {
    const renterId = this.data?.id;
    if (!renterId) {
      console.error("Renter ID is undefined or null.");
      return;
    }
    this._service.getInvoiceDetailById({ id: renterId }).subscribe({
      next: (invoiceDetail : InvoiceDetail) => {
        this.invoiceDetail = invoiceDetail;
        this.totalPriceUSD = this.invoiceDetail.data.invoice.total_price_usd

      },
      error: (err) => {
        console.log(err);
      }
    })
  }

  invoiceCheckout(): void{
    const configAction: HelperConfirmationConfig = {
      title: `<strong>បញ្ជាក់ទូទាត់</strong>`,
      message: 'តើអ្នកប្រាកដថាចង់ធ្វើការទូទាត់ឬទេ',
      icon: {
          show: true,
          name: 'heroicons_outline:exclamation-triangle',
          color: 'warn',
      },
      actions: {
          confirm: {
              show: true,
              label: 'ទូទាត់',
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
  dialogRef.afterClosed().subscribe((confirmed: boolean) => {
    
    if (confirmed === true) {
      const id            = this.invoiceDetail?.data?.invoice?.id

      this._service.invoiceCheckout(id).subscribe({
        next : () => {
          this._snackbar.openSnackBar('ការទូទាត់ធ្វើបានសម្រេច', 'Create');
          this._dialogRef.close();
        },
        error: (err) => {
          console.log(err)
          this._snackbar.openSnackBar('មានបញ្ហាក្នុងការធ្វើការទូទាត់', 'error');
        }
        })
      }
    })
  }
  

}
