import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// import { jwt_decode } from 'jwt-decode';
// import * as jwt_decode from "jwt-decode";
import { JwtHelperService } from '@auth0/angular-jwt';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.css'],
})
export class ResetComponent implements OnInit {
  resetForm: FormGroup;
  token: string;
  mail: string;
  isSubmitted = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService,
    public dialog: MatDialog,
    public toastr: ToastrService,
    public router: Router
  ) {}

  ngOnInit() {
    const helper = new JwtHelperService();
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'];
    });

    this.mail = helper.decodeToken(this.token).sub;
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confpassword: [''],
    });
  }

  get password() {
    return this.resetForm.get('password');
  }
  get formControls() {
    return this.resetForm.controls;
  }
  get confpassword() {
    return this.resetForm.get('confpassword');
  }

  onForget() {
    if (this.password.value == this.confpassword.value) {
      this.isSubmitted = true;
      if (!this.resetForm.valid) {
        return;
      }
      this.authService
        .resetPassword(this.token, this.password.value)
        .subscribe(() => {
          if (this.authService.isLoggedIn) {
            this.router.navigateByUrl('/');
            this.toastr.success(
              'Your password successfully updated. Please login with your new password'
            );
          } else {
            this.toastr.error(
              'Oops some error occured. Please try again later'
            );
          }
        });
    } else {
      this.toastr.info(
        'Password is not matched. Please enter your valid password'
      );
    }
  }
}
