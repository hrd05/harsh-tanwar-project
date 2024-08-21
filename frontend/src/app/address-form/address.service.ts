import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { tap } from 'rxjs';

interface userAdd {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
}

@Injectable({ providedIn: 'root' })
export class AddressService {
  pickupAddress?: {
    address: string;
    position: { latitude: number; longitude: number };
  };
  deliveryAddress?: {
    address: string;
    position: { latitude: number; longitude: number };
  };
  fare: number = 0;
  // userPickupAddress:

  constructor(private http: HttpClient, private authService: AuthService) {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage() {
    const storedPickup = localStorage.getItem('pickup_address');
    const storedDelivery = localStorage.getItem('delivery_address');
    const storedFare = localStorage.getItem('fare');

    if (storedPickup) this.pickupAddress = JSON.parse(storedPickup);
    if (storedDelivery) this.deliveryAddress = JSON.parse(storedDelivery);
    if (storedFare) this.fare = parseFloat(storedFare);
  }

  saveAdd(
    address: string,
    position: { latitude: number; longitude: number },
    type: string
  ) {
    return this.http.post(`http://localhost:4000/v1/users/${type}-address`, {
      address,
      latitude: position.latitude!,
      longitude: position.longitude!,
    });
  }

  getUserPickupAdds() {
    return this.http.get('http://localhost:4000/v1/users/pickup-address');
  }

  getUserDeliveryAdds() {
    return this.http.get('http://localhost:4000/v1/users/delivery-address');
  }

  calculateFare() {
    return this.http.post('http://localhost:4000/v1/users/calculate-fare', {
      pickup_pos: this.pickupAddress?.position,
      delivery_pos: this.deliveryAddress?.position,
    });
  }

  async getLatAndLng(address: string, type: string) {
    const geocoder = new google.maps.Geocoder();
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address: address }, (res: any, status) => {
        if (status === 'OK' && res[0]) {
          const location = res[0].geometry.location;

          if (type === 'pickup') {
            this.pickupAddress = {
              address,
              position: {
                latitude: location.lat(),
                longitude: location.lng(),
              },
            };
            localStorage.setItem(
              'pickup_address',
              JSON.stringify(this.pickupAddress)
            );
          } else if (type === 'delivery') {
            this.deliveryAddress = {
              address,
              position: {
                latitude: location.lat(),
                longitude: location.lng(),
              },
            };
            localStorage.setItem(
              'delivery_address',
              JSON.stringify(this.deliveryAddress)
            );
          }

          resolve(location); // Resolving the Promise with the location
        } else {
          console.error(
            'Geocode was not successful for the following reason: ' + status
          );
          reject(status); // Rejecting the Promise in case of an error
        }
      });
    });
  }
}
