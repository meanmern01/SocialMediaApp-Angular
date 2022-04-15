import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import {
  MatDialog,
  MatDialogRef,
  MatDialogConfig,
} from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forget',
  templateUrl: './forget.component.html',
  styleUrls: ['./forget.component.css'],
})
export class ForgetComponent implements OnInit {
  forgetForm: FormGroup;
  isSubmitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    public dialog: MatDialog,
    public toastr: ToastrService
  ) {
    this.forgetForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {}

  get formControls() {
    return this.forgetForm.controls;
  }

  forgetUser() {
    this.isSubmitted = true;
    if (!this.forgetForm.valid) {
      return;
    }
    this.authService.forget(this.forgetForm.value).subscribe((res) => {
      if (!res.result) {
        this.forgetForm.reset();
        this.toastr.info(
          'Sent link in your email please check and get back into your account'
        );
      } else {
        this.toastr.error(
          'Email address is not found. Please check your email address'
        );
      }
      this.isSubmitted = false;
    });
  }
}
