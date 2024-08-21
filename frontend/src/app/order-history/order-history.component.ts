import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, scheduled } from 'rxjs';
import { MatTable } from '@angular/material/table';
import { RiderDetailsDialogComponent } from '../rider-details-dialog/rider-details-dialog.component';
import { ConfirmCancelDialogComponent } from '../confirm-cancel-dialog/confirm-cancel-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

const date = new Date('2024-08-21 13:00:00');
console.log(date.toISOString());

interface Rider {
  id: number;
  name: string;
  phone: string;
  latitude: string;
  longitude: string;
}

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css'],
})
export class OrderHistoryComponent implements OnInit {
  @Output() cancelbtn = new EventEmitter();
  orders: any = [];
  displayedColumns: string[] = ['id', 'status', 'date', 'action'];
  rider!: Rider;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.fetchOrders().subscribe(
      (res) => {
        console.log(res.data);
        this.orders = res.data.sort((a: any, b: any) => {
          // Sorting by 'created_at' in ascending order
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });
      },
      (err) => {
        console.log(err);
      }
    );
  }

  openOrderDetails(order: any): any {
    const rider_id: any = order.rider_id;

    const openDialog = (rider: Rider | null) => {
      this.dialog.open(RiderDetailsDialogComponent, {
        data: {
          pickupAddress: order.pickup_address,
          deliveryAddress: order.delivery_address,
          fare: order.fare,
          status: order.delivery_status,
          scheduled_time: order.scheduled_time ? new Date(order.scheduled_time).toLocaleString(): null,
          rider: rider ? { name: rider.name, phone: rider.phone } : null,
        },
      });
    };
    if (rider_id) {
      this.getRiderInfo(rider_id).subscribe((res: any) => {
        // this.rider = res.data;
        openDialog(res.data);
      });
    } else {
      openDialog(null);
    }
  }

  getRiderInfo(rider_id: string) {
    return this.http.get(`http://localhost:4000/v1/rider/${rider_id}`);
  }

  cancelDelivery(id: number) {
    console.log('clicked', id);
    const dialogRef = this.dialog.open(ConfirmCancelDialogComponent, {
      data: { message: 'Are you sure you want to cancel this delivery ?' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteOrder(id);
      } else {
        console.log('cancel action aborted', id);
      }
    });

    // this.snackBar.open('Cancel order', 'Close', {
    //   duration: 2000,
    //   verticalPosition: 'top',
    //   horizontalPosition: 'end',
    // });
  }

  deleteOrder(id: number) {
    this.http
      .post('http://localhost:4000/v1/users/cancel-delivery', {
        delivery_id: id,
      })
      .subscribe(
        (res) => {
          console.log(res, 'kajdkla');
          const index = this.orders.findIndex((order: any) => order.id === id);
          if (index >= 0) {
            this.orders[index].delivery_status = 'cancelled';
            this.orders[index].rider_id = null;
            this.snackBar.open('Delivery Cancelled', 'Close', {
              duration: 2000,
              verticalPosition: 'top',
              horizontalPosition: 'end',
            });
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }

  fetchOrders(): Observable<any> {
    return this.http.get('http://localhost:4000/v1/users/deliveries');
  }
}
