import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { BookDeliveryComponent } from './book-delivery/book-delivery.component';
import { AuthGuard } from './auth/auth.guard';
import { DeliveryFormComponent } from './address-form/address-form.component';
import { OrderHistoryComponent } from './order-history/order-history.component';

const routes: Routes = [
  { path: '', redirectTo: '/add-address', pathMatch: 'full' },
  { path: 'auth', component: AuthComponent },
  {
    path: 'add-address',
    canActivate: [AuthGuard],
    component: DeliveryFormComponent,
  },
  {
    path: 'book-delivery',
    canActivate: [AuthGuard],
    component: BookDeliveryComponent,
  },
  {
    path: 'order-history',
    component: OrderHistoryComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
