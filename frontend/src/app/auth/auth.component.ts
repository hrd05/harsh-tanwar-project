import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnInit {
  isLoginMode = true;
  authForm!: FormGroup;
  error = null;
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    if (!this.isLoginMode) {
      this.authForm = new FormGroup({
        name: new FormControl(null, Validators.required),
        email: new FormControl(null, [Validators.required, Validators.email]),
        phone: new FormControl(null, [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(10),
        ]),
        password: new FormControl(null, [
          Validators.required,
          Validators.minLength(6),
        ]),
      });
    } else {
      this.authForm = new FormGroup({
        email: new FormControl(null, [Validators.required, Validators.email]),
        password: new FormControl(null, [
          Validators.required,
          Validators.minLength(6),
        ]),
      });
    }
  }

  onChange() {
    this.error = null;
    this.isLoginMode = !this.isLoginMode;
    this.initializeForm();
  }

  onSubmit() {
    if (this.isLoginMode) {
      const { email, password } = this.authForm.value;
      this.isLoading = true;
      this.authService.login(email, password).subscribe(
        (res) => {
          this.isLoading = false;
          this.error = null;
          this.router.navigate(['/add-address']);
        },
        (err) => {
          this.isLoading = false;
          this.error = err;
        }
      );
    } else {
      const { name, email, phone, password } = this.authForm.value;
      this.isLoading = true;
      this.authService.signup(name, email, phone, password).subscribe(
        (res) => {
          this.isLoading = false;
          this.error = null;
          this.isLoginMode = true;
        },
        (err) => {
          this.isLoading = false;
          this.error = err;
        }
      );
    }
  }
}
