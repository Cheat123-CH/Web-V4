import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


//=======================>servicve
// import { SummaryService } from '../../a4-room/room/service';
// import { Data } from '../../a4-room/room/view/interface';
// import { RoomInfo } from '../../a4-room/room/interface';

@Component({
  selector: 'app-renterdetail',
  standalone: true,
  imports: [
    CommonModule,
    MatIcon,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogClose,
  ],
  templateUrl: './template.html',
  styleUrl: './style.scss'
})
export class RenterdetailComponent implements OnInit {


  viewRenterInterface : any
  isLoading           : boolean = false

  constructor(
    // private _service  : SummaryService,
    @Inject(MAT_DIALOG_DATA) public data: number
  ){}

  ngOnInit(): void {
    this.viewRenter()
    console.log(this.data)
  }


  viewRenter(): void {
    // this._service.view(this.data).subscribe({
    //   next : (res : RoomInfo) => {
    //     this.viewRenterInterface = res.data
    //     console.log(this.data)
    //     console.log(this.viewRenterInterface)
    //   }
    // })
  }
}
