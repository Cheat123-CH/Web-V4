import { ChangeDetectorRef, Component } from '@angular/core';
import { MatDialogClose, MatDialogModule } from '@angular/material/dialog';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatMenu, MatMenuModule } from '@angular/material/menu';
import { OnInit } from '@angular/core';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelect, MatSelectModule, MatOption } from '@angular/material/select';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { NgIf, NgFor } from '@angular/common';
import { ConfirmComponent } from './confirm/component';
import { MoveoutInterface, Zone } from './interface';
import { MoveoutService } from './service';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressSpinnerModule, MatProgressSpinner } from '@angular/material/progress-spinner';

import { Room } from './interface';
import { DashbordService } from '../service';
import { env } from 'envs/env';
@Component({
  selector: 'app-moveout',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    MatIcon,
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
    MatProgressSpinner,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './template.html',
  styleUrl: './style.scss'
})
export class MoveoutComponent implements OnInit {
  zone: string = ''

  moveOutData: any
  moveOutInterface: MoveoutInterface
  fileUrl = env.FILE_BASE_URL
  search: string

  isLoading: boolean = false
  ngOnInit(): void {
    this.showMoveOutData();
    this.getZoneall()
  }

  constructor(
    private _service: MoveoutService,
    private _dialog: MatDialog,
    private _dashboardService: DashbordService,
    private _cdr: ChangeDetectorRef,
  ) { }

  day: number
  month: number
  year: number
  public zoneType = [
  ]

  getZoneall(): void {
    this._dashboardService.getZoneSelection().subscribe({
      next: (data) => {
        this.zoneType = data.map(zone => ({
          name: zone.name,
          value: zone.name,
        }))
      },
      error: (err) => {
        console.log(err)
      }
    })
  }

  onZoneChange(selectedValue: string): void {
    this.zone = selectedValue
    this.showMoveOutData()
  }


  showMoveOutData(): void {
    const params = {
      search: this.search,
      zoneName: this.zone
    }
    this.isLoading = true
    
    this._service.getMoveOut(params).subscribe({
      next: (res: MoveoutInterface) => {
        this.isLoading = false
        this.moveOutInterface = res
        this.moveOutData = this.moveOutInterface.data.flatMap((value) => value.rooms)
      },
      error: (err) => {
        this.isLoading = false
        console.error("Error fetching zone statistics: ", err);
      }
    });
  }

  calculateLivingDuration(moveInDate: string): void {
    const today = new Date();
    const moveIn = new Date(moveInDate);

    // Calculate the difference in years, months, and days
    let years = today.getFullYear() - moveIn.getFullYear();
    let months = today.getMonth() - moveIn.getMonth();
    let days = today.getDate() - moveIn.getDate();

    
    // Adjust if the days or months are negative
    if (days < 0) {
      months--;
      days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); // get last day of previous month
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    this.day = days
    this.month = months
    this.year = years
  }

  openConfirmDialog(data: Room): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.autoFocus = false;
    dialogConfig.position = { right: '0px' };
    dialogConfig.width = '600px';
    dialogConfig.height = '100vh';
    dialogConfig.panelClass = 'side-dialog';
    dialogConfig.enterAnimationDuration = '0s';
    dialogConfig.data = {
      moveOut: data
    }
    // this._dialog.open(ConfirmComponent, dialogConfig);
    const dialogRef = this._dialog.open(ConfirmComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => {
      this._cdr.detectChanges();
      this.showMoveOutData();
    });
    // Listen for dialog close and refresh data

  }
}
