import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, tap, throwError } from 'rxjs';
import { User } from './user.model';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  user = new BehaviorSubject<User | null>(null);

  constructor(private http: HttpClient, private router: Router) {}

  signup(name: string, email: string, phone: string, password: string) {
    return this.http
      .post('http://localhost:4000/v1/users/signup', {
        name,
        email,
        phone,
        password,
      })
      .pipe(
        catchError((errRes) => {
          let errorMess = 'An Error Occured';
          if (!errRes.error) {
            return throwError(errorMess);
          }
          return throwError(errRes.error.status_message);
        }),
        tap((resData: any) => {
          //   localStorage.setItem('userData', JSON.stringify(resData.data));
        })
      );
  }

  login(email: string, password: string) {
    return this.http
      .post('http://localhost:4000/v1/users/login', {
        email,
        password,
      })
      .pipe(
        catchError((errRes) => {
          let errorMess = 'An Error Occured';
          if (!errRes.error) {
            return throwError(errorMess);
          }
          return throwError(errRes.error.status_message);
        }),
        tap((resData: any) => {
          //   localStorage.setItem('userData', JSON.stringify(resData.data));
          const { name, email, phone } = resData.data.user;
          this.handleAuthentication(name, email, phone, resData.data.token);
          console.log('user from authService', this.user);
        })
      );
  }

  autoLogin() {
    const userData: {
      name: string;
      email: string;
      phone: string;
      token: string;
    } = JSON.parse(localStorage.getItem('userData')!);

    if (!userData) {
      return;
    }
    const loadedUser = new User(
      userData.name,
      userData.email,
      userData.phone,
      userData.token
    );
    if (loadedUser.accessToken) {
      this.user.next(loadedUser);
    }
  }

  handleAuthentication(
    name: string,
    email: string,
    phone: string,
    token: string
  ) {
    const user = new User(name, email, phone, token);
    this.user.next(user);
    localStorage.setItem('userData', JSON.stringify(user));
  }

  logout() {
    this.user.next(null);
    this.router.navigate(['auth']);
    localStorage.removeItem('userData');
  }
}
