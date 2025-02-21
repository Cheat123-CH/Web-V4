// =======================================> Library
import { Component,  OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { NgFor, NgIf } from '@angular/common';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatOption } from '@angular/material/select';
import { MatDatepicker, MatDatepickerToggle, MatDatepickerModule } from '@angular/material/datepicker';
import { MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';


// ===================================================> service, interface
import { ReserveDialogComponent } from './reserve-dialog/reserve-dialog.component';
import { DashbordService } from '../service';
import { FreeRoomDialogService } from './free-room-dialog.service';
import { FreeRoom, FreeRoomInterface } from './interface';
@Component({
  selector: 'app-free-room-dialog',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    MatIcon,
    MatInput,
    MatMenuModule,
    MatIconModule,
    MatDatepickerModule,
    MatFormField,
    MatSelect,
    MatLabel,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    MatOption,
    MatNativeDateModule,
    MatSelectModule,
    MatDatepicker,
    MatDatepickerToggle,
    MatFormFieldModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './free-room-dialog.component.html',
  styleUrl: './free-room-dialog.component.scss'
})
export class FreeRoomDialogComponent implements OnInit{


  availableRooms         : FreeRoomInterface[] = [];
  FreeRoom               : FreeRoom[] = [];
  public reserveRoomForm : FormGroup;

  showDatePicker = false;
  defaultZone    : string  = ''
  isLoading      : boolean = false

  constructor(
    private _dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private _service: FreeRoomDialogService,
    private _dashboardService : DashbordService,
    private _cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public roomData: any // Injected room data
  ) {  }

  private today = new Date()
  private nextWeek = new Date(new Date().setDate(new Date().getDate() + 7))
  private nnextWeek = new Date(new Date().setDate(new Date().getDate() + 14))
  private nextmonth = new Date(new Date().setMonth(new Date().getMonth() + 1))

  ngOnInit(): void {
    if (this.roomData?.name) {
      this.defaultZone = this.roomData.name;
      console.log(this.defaultZone)
    }
    this.reserveRoomForm = this._formBuilder.group({
      date       : [],
      customDate : [],
      zoneName   : [],
    });
    this.showAvailableRooms();
    this.getZoneall()
  }

  dateType = [
    { value: this.today, name: 'ថ្ងៃនេះ' },
    { value: this.nextWeek, name: '១ សប្ដាហ៍ក្រោយ' },
    { value: this.nnextWeek, name: '២ សប្ដាបហ៍ក្រោយ' },
    { value: this.nextmonth, name: 'ខែក្រោយ' },
    { value: '5', name: 'ជ្រើសរើសកាលបរិច្ចេទ' },
  ];

  // if the last option is choose, let the user pick another form:
  // onDateChange(selectedValue: string): void {
  //   console.log(selectedValue)
  //   this.reserveRoomForm.get('date')?.setValue(selectedValue)
  //   if(selectedValue === '5'){
  //     this.showDatePicker = true;
  //   }  else if (!this.showDatePicker){
  //     this.showDatePicker = false;
  //   }
  //   console.log(this.reserveRoomForm.get('date').value)
  //   console.log(this.reserveRoomForm.get('customDate').value)
  //   console.log(selectedValue, this.showDatePicker)
  // }

  checkValue($event): void {
    if($event === '5'){
      this.showDatePicker = true
    } else {
      this.showDatePicker = false
    }
  }

  public zoneType = []
  getZoneall(): void{
    this.isLoading = true
    this._dashboardService.getZoneSelection().subscribe({
      next: (data) => {
        this.zoneType = data.map(zone => ({
          name: zone.name,
          value: zone.name,
        }))
        this.isLoading = false
      },
      error :  (err) => {
        this.isLoading = false,
        console.log(err)
      }
    })
  }

  onZoneChange(selectedValue: string): void{
    this.reserveRoomForm.patchValue({
      zoneName: selectedValue,
    });
    this.defaultZone === selectedValue
  }

  showAvailableRooms(): void {
    if (this.reserveRoomForm.invalid) {
      return
    }

    let freeFrom : Date ;
    if (this.showDatePicker) {
      const customDateControl = this.reserveRoomForm.get('customDate').value;
      console.log(customDateControl)
      const selectedDate = new Date(customDateControl);
      freeFrom = new Date(
                selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000)
    }else {
        freeFrom = this.reserveRoomForm.get('date')?.value;
    }

    const zoneName =  this.defaultZone ||
                      this.reserveRoomForm.get('zoneName').value || null
    const formattedFreeFrom = freeFrom ? new Date(freeFrom).toISOString().slice(0, 10) : null;
    const status = 1
    
    const params = {
      freeFrom: formattedFreeFrom,
      zoneName: zoneName,
      status: status,
    }

    this._service.getAvailableRooms(params).subscribe({
      next: (response: FreeRoom) => {
        this.availableRooms = response.data;
      },
      error: (err) => {
        console.log("Error fetching data: ", err);
      }
    })
  }

  onSubmit(room: FreeRoomInterface): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.autoFocus = false;
    dialogConfig.position = { right: '0px' };
    dialogConfig.width = '600px';
    dialogConfig.height = '100vh';
    dialogConfig.panelClass = 'side-dialog';
    dialogConfig.enterAnimationDuration = '0s';

    dialogConfig.data = {
      room: room
    }
    // this._dialog.open(ReserveDialogComponent, dialogConfig);
    const dialogRef = this._dialog.open(ReserveDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(() => {
      this.showAvailableRooms();
      this._dashboardService.getRefresh().subscribe((callback) => {
        if (callback) {
          callback(); // Call the dashboard refresh function
        }
      });
      this._cdr.detectChanges();
    });
  }
}
