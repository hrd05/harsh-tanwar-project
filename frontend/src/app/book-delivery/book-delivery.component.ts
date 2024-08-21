import { Component, OnInit } from '@angular/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { AddressService } from '../address-form/address.service';
import { MatRadioChange } from '@angular/material/radio';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

interface DeliveryDetail {
  pickup_location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  delivery_location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  fare?: number;
  isImmediate: boolean;
  scheduled_time?: Date;
}

@Component({
  selector: 'app-fare-summary',
  templateUrl: './book-delivery.component.html',
  styleUrls: ['./book-delivery.component.css'],
})
export class BookDeliveryComponent implements OnInit {
  fareAmount: number = 0;
  paymentMode: string = 'cash';
  isImmediate = true;
  scheduledDate: Date | null = null;
  scheduledTime: string = '';
  isLoading = false;
  selectedOption = 'immediate';

  constructor(
    private addService: AddressService,
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Retrieve the fare amount from a service or route state if needed
    this.fareAmount = this.addService.fare;
    // console.log(this.addService.pickupAddress);
  }

  onDeliveryOptionChange(event: MatRadioChange) {
    if (event.value === 'immediate') {
      this.scheduledDate = null;
      this.scheduledTime = '';
      this.isImmediate = true;
    } else if (event.value === 'schedule') {
      this.isImmediate = false;
    }
  }

  bookDelivery() {
    this.isLoading = true;
    let deliveryDetails: any = {
      pickup_location: {
        address: this.addService.pickupAddress?.address,
        latitude: this.addService.pickupAddress?.position.latitude,
        longitude: this.addService.pickupAddress?.position.longitude,
      },
      delivery_location: {
        address: this.addService.deliveryAddress?.address,
        latitude: this.addService.deliveryAddress?.position.latitude,
        longitude: this.addService.deliveryAddress?.position.longitude,
      },
      fare: this.fareAmount,
      isImmediate: this.isImmediate,
    };

    if (!this.isImmediate) {
      deliveryDetails.scheduled_time = this.getDateTime();
    }

    console.log(deliveryDetails.pickup_location.address);
    if (
      !deliveryDetails.pickup_location.address ||
      !deliveryDetails.delivery_location.address ||
      deliveryDetails.fare === 0
    ) {
      this.isLoading = false;
      this.snackBar.open(
        'Incomplete delivery details, Please add delivery address',
        'Close',
        {
          duration: 1500,
          verticalPosition: 'top',
          horizontalPosition: 'right',
        }
      );
      return;
    }

    this.http
      .post('http://localhost:4000/v1/delivery/book-delivery/', deliveryDetails)
      .subscribe(
        (res: any) => {
          this.isLoading = false;
          this.snackBar.open(res.status_message, 'Close', {
            duration: 1500,
            verticalPosition: 'top',
            horizontalPosition: 'right',
          });
          console.log(res);
          this.removeFromLocalStorage();
          this.router.navigate(['/order-history']);
        },
        (err) => {
          this.isLoading = false;
          this.snackBar.open(
            err.error.status_message + '. Try again after some time.',
            'Close',
            {
              duration: 1500,
              verticalPosition: 'top',
              horizontalPosition: 'right',
            }
          );
          console.log(err);
        }
      );
  }

  removeFromLocalStorage() {
    localStorage.removeItem('fare');
    localStorage.removeItem('pickup_address');
    localStorage.removeItem('delivery_address');
  }

  getDateTime() {
    let scheduledDateTime: string | null = null;

    if (!this.isImmediate && this.scheduledDate && this.scheduledTime) {
      const date = new Date(this.scheduledDate);

      // Extract the hours and minutes from the time input
      const [hours, minutes] = this.scheduledTime.split(':').map(Number);

      // Set the hours and minutes to the Date object
      date.setHours(hours, minutes);

      // Convert the Date object to the desired ISO 8601 format
      scheduledDateTime = date.toISOString();
    }
    return scheduledDateTime;
  }
}
