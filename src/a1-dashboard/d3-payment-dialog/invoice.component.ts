import { ChangeDetectorRef, Inject,Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatLabel } from '@angular/material/form-field';
import { PaymentComponent } from './payment/payment.component';
import {FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatOptionModule, MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


// ===================================================> interface, service
import { Invoice } from './invoice';
import { InvoiceService } from './invoice.service';
import { DashbordService } from '../service';
import { env } from 'envs/env';
@Component({
  selector: 'app-invoice',
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
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.scss'
})

export class InvoiceComponent implements OnInit {

  constructor(
    private _dialogRef: MatDialogRef<InvoiceComponent>,
    private _service: InvoiceService,
    private _dialog: MatDialog,
    private _cdr : ChangeDetectorRef,
    private _dashboardService: DashbordService,
    @Inject(MAT_DIALOG_DATA) public zoneInfo: any,
  ) { }

  // vars
  invoiceForm: Invoice[] = [];
  zone: string = '';
  fileUrl = env.FILE_BASE_URL
  search: string;

  isLoading: boolean = false
  ngOnInit(): void {
    this.showInvoiceByZone();
    this.getZoneall()
  }


  public zoneType = []

  onZoneChange(selectedValue: string): void {
    this.zone = selectedValue;
    this.showInvoiceByZone();
  }

  getZoneall(): void {
    this._dashboardService.getZoneSelection().subscribe({
      next: (data) => {
        this.zoneType = data.map(zone => ({
          name: zone.name,
          value: zone.name,
        }))
      },
      error: (err) => {

      }
    })
  }


  setParamsForInvoice(): any {
    const params : any =
    {
      sort : null,
      order : null,
      search : this.search || null, 
      zoneName: this.zoneInfo?.name || this.zone || null,
      status  : null,
      limit   : 10,
      page    : null,
    }
    return params
  }

  showInvoiceByZone(): void {
    this.isLoading = true
    const params = this.setParamsForInvoice();

    this._service.getInvoiceByZone(params).subscribe({
      next: (res : Invoice[]) => {
        this.isLoading = false
        this.invoiceForm = res;
      },
      error: (err) => {
        this.isLoading = false
        console.error('Error fetching invoice by zone:', err);
      },
    });
  }

  generatePayment(item): void {
    const transaction_id = item?.id;
    this._service.generatePaymentbytransaction(transaction_id).subscribe({
      next: (response: { data: string }) => {
        const base64Data = response.data; // Map to the data property
        const binaryData = atob(base64Data); // Decode Base64 string
        const arrayBuffer = new Uint8Array(binaryData.length);

        for (let i = 0; i < binaryData.length; i++) {
          arrayBuffer[i] = binaryData.charCodeAt(i);
        }

        const blob = new Blob([arrayBuffer], { type: 'application/pdf' }); // Set file MIME type
        const url = window.URL.createObjectURL(blob);

        // Create a download link and click it programmatically
        const a = document.createElement('a');
        a.href = url;
        a.download =`វិក្កយបត្រលេខ ${transaction_id}.pdf`; // File name
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        console.log('Report downloaded successfully!');
      },
      error: (err) => {
        console.error('Error downloading report:', err);
      },
    });
  }

  openPaymentDialog(data: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.position = { right: '0px' };
    dialogConfig.width = '600px';
    dialogConfig.height = '100vh';
    dialogConfig.panelClass = 'side-dialog';
    dialogConfig.enterAnimationDuration = '0s';
    dialogConfig.data = data;

    const dialogRef = this._dialog.open(PaymentComponent, dialogConfig)
    dialogRef.afterClosed().subscribe(() => {
      this.showInvoiceByZone();
      // Detect changes after dialog is closed
      this._cdr.detectChanges();
    });
  }

}


