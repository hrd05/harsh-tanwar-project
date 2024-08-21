import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-rider-details-dialog',
  templateUrl: './rider-details-dialog.component.html',
  styleUrls: ['./rider-details-dialog.component.css'],
})
export class RiderDetailsDialogComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {}
}
