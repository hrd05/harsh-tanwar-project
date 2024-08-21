import {
  Component,
  ElementRef,
  NgZone,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { AddressService } from './address.service';
import { Router } from '@angular/router';
import { LatLngLiteral } from 'ngx-google-places-autocomplete/objects/latLng';

interface userAdd {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
}

@Component({
  selector: 'app-address-form',
  templateUrl: './address-form.component.html',
  styleUrls: ['./address-form.component.css'],
})
export class DeliveryFormComponent implements OnInit {
  @ViewChild('pickupAddress') pickupAddress!: ElementRef;
  @ViewChild('deliveryAddress') deliveryAddress!: ElementRef;
  @ViewChild('auto') auto!: MatAutocomplete;

  isUserTyping = false;
  map!: google.maps.Map;
  directionService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({
    map: this.map,
    // suppressMarkers: true,
  });
  pickupMarker!: google.maps.Marker;
  deliveryMarker!: google.maps.Marker;
  userSavedPickupAdd!: userAdd[];
  userSavedDeliveryAdd!: userAdd[];
  fare: number = 0;
  showFare = false;
  isLoading = false;
  isLoading2 = false;
  mapOptions: google.maps.MapOptions = {
    center: { lat: 22.998368756934376, lng: 72.60350192543318 },
    zoom: 15,
  };
  marker = {
    position: { lat: 22.998368756934376, lng: 72.60350192543318 },
  };

  constructor(
    private addService: AddressService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.map = new google.maps.Map(
      document.getElementById('map') as HTMLInputElement,
      this.mapOptions
    );

    this.directionsRenderer.setMap(this.map);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          this.marker.position = coords;
          this.mapOptions = { ...this.mapOptions, center: coords };
        },
        (error) => {
          console.error('Error getting location', error);
        }
      );
    } else {
      console.error('Geolocation is not supported in this browser');
    }

    this.addService.getUserPickupAdds().subscribe((res: any) => {
      this.userSavedPickupAdd = res.data;
    });
    this.addService.getUserDeliveryAdds().subscribe((res: any) => {
      this.userSavedDeliveryAdd = res.data;
      console.log(this.userSavedDeliveryAdd);
    });
  }

  onFocus(): void {
    this.isUserTyping = false;
  }

  onInput(type: string): void {
    this.isUserTyping = true;
    if (type === 'pickup') {
      this.initAutocomplete('pickup');
    } else {
      this.initAutocomplete('delivery');
    }
  }

  initAutocomplete(type: string): void {
    const ahmedabadBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(22.8376, 72.4577), // Southwest corner of Ahmedabad
      new google.maps.LatLng(23.1334, 72.6734) // Northeast corner of Ahmedabad
    );

    if (type == 'pickup' && this.pickupAddress) {
      const pickupAutoComplete = new google.maps.places.Autocomplete(
        this.pickupAddress.nativeElement,
        {
          types: ['establishment'],
          componentRestrictions: { country: 'IN' },
          bounds: ahmedabadBounds,
          strictBounds: true,
        }
      );

      pickupAutoComplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          const place = pickupAutoComplete.getPlace();
          if (place.geometry && place.geometry.location) {
            this.marker.position = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            };
            this.mapOptions = {
              ...this.mapOptions,
              center: this.marker.position,
            };
          }
        });
      });
    } else if (type == 'delivery' && this.deliveryAddress) {
      const deliveryAutoComplete = new google.maps.places.Autocomplete(
        this.deliveryAddress.nativeElement,
        {
          types: ['establishment'],
          componentRestrictions: { country: 'IN' },
          bounds: ahmedabadBounds,
          strictBounds: true,
        }
      );

      // console.log(deliveryAutoComplete);

      deliveryAutoComplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          const place = deliveryAutoComplete.getPlace();
          if (place.geometry && place.geometry.location) {
            this.marker.position = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            };
            this.mapOptions = {
              ...this.mapOptions,
              center: this.marker.position,
            };
          }
        });
      });
    }
  }

  displayWith(value: string): string {
    return this.isUserTyping ? '' : value;
  }

  calculateAndDisplayRoute() {
    if (!this.pickupMarker || !this.deliveryMarker) return;

    this.directionService.route(
      {
        origin: this.pickupMarker.getPosition() as google.maps.LatLng,
        destination: this.deliveryMarker.getPosition() as google.maps.LatLng,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          this.directionsRenderer.setDirections(response);
        } else {
          console.error('Directions request failed due to ' + status);
        }
      }
    );
  }

  async calculateFare() {
    if (
      !this.pickupAddress.nativeElement.value ||
      !this.deliveryAddress.nativeElement.value
    ) {
      this.snackBar.open('Add Address to proceed', 'Close', {
        duration: 750,
        verticalPosition: 'bottom',
        horizontalPosition: 'center',
      });
      return;
    }

    this.isLoading = true;

    const pickupLocation: any = await this.addService.getLatAndLng(
      this.pickupAddress.nativeElement.value,
      'pickup'
    );
    this.pickupMarker = new google.maps.Marker({
      position: pickupLocation,
      title: 'Pickup Location',
    });

    const deliveryLocation: any = await this.addService.getLatAndLng(
      this.deliveryAddress.nativeElement.value,
      'delivery'
    );
    this.deliveryMarker = new google.maps.Marker({
      position: deliveryLocation,
      title: 'Delivery Location',
    });

    this.calculateAndDisplayRoute();

    this.addService.calculateFare().subscribe(
      (res: any) => {
        this.isLoading = false;
        console.log(res.data);
        this.fare = res.data.fare;
        this.showFare = true;
        this.addService.fare = res.data.fare;
        localStorage.setItem('fare', res.data.fare);
        // this.router.navigate(['/book-delivery']);
      },
      (err) => {
        this.isLoading = false;
        console.log(err);
      }
    );
  }

  async onConfirmClick() {
    console.log('click');
    this.isLoading2 = true;
    // this.isLoading = true;

    if (this.pickupAddress.nativeElement.value) {
      await this.checkAddAndSave(
        this.pickupAddress.nativeElement.value,
        'pickup'
      );
    }
    if (this.deliveryAddress.nativeElement.value) {
      this.checkAddAndSave(
        await this.deliveryAddress.nativeElement.value,
        'delivery'
      );
    }
    this.isLoading = false;
    // this.isLoading = false;
    this.router.navigate(['/book-delivery']);
  }

  checkAddAndSave(address: string, type: string) {
    if (type === 'pickup') {
      let isSavedPickupAdd = -1;
      if (this.userSavedPickupAdd) {
        isSavedPickupAdd = this.userSavedPickupAdd.findIndex(
          (add) => add.address === address
        );
      }

      if (isSavedPickupAdd < 0) {
        console.log(this.addService.pickupAddress);
        this.addService
          .saveAdd(address, this.addService.pickupAddress!.position, 'pickup')
          .subscribe(
            (res) => {
              console.log(res);
            },
            (err) => {
              console.log(err);
            }
          );
      }
    } else if (type === 'delivery') {
      let isSavedDeliveryAdd = -1;

      if (this.userSavedDeliveryAdd) {
        isSavedDeliveryAdd = this.userSavedDeliveryAdd.findIndex(
          (add) => add.address === address
        );
      }
      if (isSavedDeliveryAdd < 0) {
        this.addService
          .saveAdd(
            address,
            this.addService.deliveryAddress!.position,
            'delivery'
          )
          .subscribe(
            (res) => {
              console.log(res);
            },
            (err) => {
              console.log(err);
            }
          );
      }
    }
  }
}
