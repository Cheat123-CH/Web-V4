import { Component, Inject, OnInit } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  Validators,
  FormGroup,
  FormBuilder,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { NgFor, NgIf } from '@angular/common';
import { MatFormFieldModule, MatFormField } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatDialogRef, MatDialogClose, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_FORMATS, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Injectable } from '@angular/core';

// ===================================================> component

import { SnackbarService } from 'helper/services/snack-bar/snack-bar.service';


// ===================================================> interface, service

import { FreeRoomDialogService } from '../free-room-dialog.service';
import { RoomInfo } from '../interface';


@Component({
  selector: 'app-free-room-dialog',
  standalone: true,
  imports: [
    NgIf,
    MatIconModule,
    MatMenuModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogClose,
    MatDatepicker,
    MatNativeDateModule,
    MatDatepickerModule,
    MatInput,
    MatInputModule,
    MatFormField,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './reserve-dialog.component.html',
  styleUrls: ['./reserve-dialog.component.scss'],
  providers: [provideNativeDateAdapter()],
})


export class ReserveDialogComponent implements OnInit {
    
  reserveForm: FormGroup;
  roomInfo: any;

  constructor(
    private _dialogRef: MatDialogRef<ReserveDialogComponent>,
    private _formBuilder: FormBuilder,
    private _service: FreeRoomDialogService,
    private _snackbar: SnackbarService,
    @Inject(MAT_DIALOG_DATA) public roomData: any // Injected room data
  ) { }

  @Injectable()

  format(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-indexed
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }



  ngOnInit(): void {

    // Initialize the form with default or room-specific values
    this.reserveForm = this._formBuilder.group({
      username: ['', [Validators.required, Validators.maxLength(30)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^(\+855|0)[1-9]\d{7,8}$/)]],
      date: [new Date(), Validators.required],
    });
    this.getRoomInfo();
  }

  closeDialog(): void {
    this._dialogRef.close(); 
  }

  getRoomInfo(): void {
    this._service.view(this.roomData.room.id).subscribe({
        next: (res: RoomInfo) => {
          this.roomInfo = res.data;
        },
        error: (err) => {
          this._snackbar.openSnackBar('មិនមានទិន្នន័យបន្ទប់', 'error')
        }
      }
    )
  }

  // Handle the form submission
  submitForm(): void {

    if (this.reserveForm.invalid) {
      console.log('Invalid')
      this._snackbar.openSnackBar('ការចុះឈ្មោះមិនត្រឹមត្រូវ', 'error')
      return;
    }

    const name = this.reserveForm.get('username')?.value
    const phone = this.reserveForm.get('phoneNumber')?.value
    const date = this.reserveForm.get('date')?.value
    const room_id = this.roomData.room.id


    let formattedDate: string | null = null;

    if (date) {
      if (typeof date === 'string') {
        // If date is a string in mm-dd-yyyy format
        const [month, day, year] = date.split('-');
        formattedDate = `${year}-${month}-${day}`;
      } else if (date instanceof Date) {
        // If date is a Date object, use local time methods
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-based
        const day = String(date.getDate()).padStart(2, '0');
        formattedDate = `${year}-${month}-${day}`; // yyyy-mm-dd format
      }
    }

    const payLoad = {
      name: name,
      phone: phone,
    }

    const params = {
      move_in: formattedDate,
      room_id: room_id,
    }

    this._service.reserveRoom(params, payLoad).subscribe({
      next: () => {
        this._snackbar.openSnackBar('បន្ទប់បានធ្វើការកក់', 'Create');
        this._dialogRef.close(payLoad);
      },
      error: (err) => {
        console.error('Error details:', err.error)
        this._snackbar.openSnackBar('មានបញ្ហាក្នុងការកក់', 'error');
      }
    })
  }
}

