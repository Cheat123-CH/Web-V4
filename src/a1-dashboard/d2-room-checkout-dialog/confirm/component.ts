import { Component, ViewChild, Inject, Output, OnInit, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  Validators,
  FormGroup,
  FormBuilder,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule, MatDatepicker } from '@angular/material/datepicker';
import { MatIcon } from '@angular/material/icon';
import { MatFormField } from '@angular/material/form-field';
import { MatSuffix } from '@angular/material/form-field';
import { ChangeDetectionStrategy } from '@angular/core';
import { MatDialogClose } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { MatOption, provideNativeDateAdapter   } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';


import { MoveoutService } from '../service';
import { SnackbarService } from 'helper/services/snack-bar/snack-bar.service';
@Component({
  selector: 'app-confirm',
  standalone: true,
  imports: [
    MatIcon,
    MatIconModule,
    MatFormField,
    MatLabel,
    MatDatepicker,
    MatSuffix,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatInputModule,
    NgIf,
    MatSelect, 
    MatOption,
    MatDialogClose
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './template.html',
  styleUrl: './style.scss',
  providers: [provideNativeDateAdapter()],
})
export class ConfirmComponent implements OnInit {
  
  moveOutForm : FormGroup;
  day         : number
  month       : number
  year        : number
  isToday     : boolean = false


  constructor(
    private _snackbar   : SnackbarService,
    private _dialogRef  : MatDialogRef<ConfirmComponent>,
    private _formBuilder: FormBuilder,
    private _service    : MoveoutService,
    @Inject(MAT_DIALOG_DATA) public moveOutinfo: any
  ){}

  ngOnInit(): void {
    this.moveOutForm = this._formBuilder.group({      
      moveOutDate: ['', [Validators.required]],
      moveOutNote: ['', ],
    });
    console.log(this.moveOutinfo)
    this.calculateLivingDuration(this.moveOutinfo?.moveOut?.transactions[0]?.move_in)
  }

  calculateLivingDuration(moveInDate: string): void {
    const today = new Date();
    const moveIn = new Date(moveInDate);

    // Calculate the difference in years, months, and days
    let years = today.getFullYear() - moveIn.getFullYear();
    let months = today.getMonth() - moveIn.getMonth();
    let days = today.getDate() - moveIn.getDate();

    const formattedToday = today.toISOString().slice(0, 10);

    if(formattedToday === this.moveOutinfo.moveOut?.transactions[0]?.moveIn){
      this.isToday = true
    }
    console.log(this.moveOutinfo.moveOut?.transactions[0]?.moveIn)
    console.log(formattedToday)
    console.log(this.isToday)
    // Adjust if the days or months are negative
    if (days < 0) {
      months--;
      days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); // get last day of previous month
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    this.day   = days
    this.month = months
    this.year  = years
  }

  onSubmit(): void{

    const checkoutDate = this.moveOutForm.get('moveOutDate')?.value
    
    const transactionId = this.moveOutinfo?.moveOut?.transactions[0]?.id
    const down_payment  = this.moveOutinfo?.moveOut?.transactions[0]?.downPayment
    const renterId      = this.moveOutinfo?.moveOut?.transactions[0]?.renter?.id
    const roomId        = this.moveOutinfo?.moveOut?.id
    // const checkout_date =  checkoutDate? 
    //                       new Date(checkoutDate.c.year, checkoutDate.c.month - 1, checkoutDate.c.day).toISOString().slice(0, 10)
    //                       : null;
    let moveIn_date   = this.moveOutinfo?.moveOut?.transactions[0]?.move_in
    moveIn_date         = new Date(moveIn_date)
    console.log(checkoutDate)
    console.log(transactionId)
    console.log(down_payment)
    console.log(renterId)
    console.log(roomId)

    const formattedDate = checkoutDate instanceof Date 
    ? checkoutDate.toISOString().slice(0, 10) // Convert to yyyy-mm-dd
    : null;

    console.log(formattedDate)

    console.log(formattedDate)
    if (checkoutDate && new Date(checkoutDate) < moveIn_date) {
      this._snackbar.openSnackBar('កាលបរិច្ឆេទចាកចេញមិនអាចមុនថ្ងៃចូលទៅរស់នៅ', 'error');
      return; // Stop the submission if the date is in the past
    }

    if (transactionId && formattedDate) {
      // Scenario 1: Delete with transactionId and checkout_date
      this._service.deleteMoveOut({ transactionId, checkout_date: formattedDate }).subscribe({
        next: (response) => {
          console.log('Deleted with transactionId:', response);
          this._snackbar.openSnackBar('ការចាកចេញធ្វើបានដោយជោគជ័យ', 'work')
          this._dialogRef.close()
        },
        error: (error) => {
          console.error('Error:', error);
          this._snackbar.openSnackBar('ការចាកចេញមានបញ្ហា', 'error')
        },
      });
    } else if (roomId && renterId && formattedDate && down_payment) {
      // Scenario 2: Delete with roomId, renterId, checkout_date, and down_payment
      this._service.deleteMoveOut({ roomId, renterId, checkout_date: formattedDate, down_payment }).subscribe({
        next: (response) => {
          console.log('Deleted with room and renter details:', response);
          this._snackbar.openSnackBar('ការចាកចេញធ្វើបានដោយជោគជ័យ', 'work')
          this._dialogRef.close();
        },
        error: (error) => {
          console.error('Error:', error);
          this._snackbar.openSnackBar('ការចាកចេញមានបញ្ហា', 'error')
        },
      });
    } else {
      console.log('Insufficient data to delete.');
    }
  }
}