import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ThemeService } from '../../theme/theme.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css'],
})
export class SigninComponent implements OnInit {
  registerForm: FormGroup;
  isSubmitted = false;

  constructor(
    public formBuilder: FormBuilder,
    public authService: AuthService,
    public router: Router,
    public dialog: MatDialog,
    public toastr: ToastrService,
    private themeService: ThemeService
  ) {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', Validators.required],
      uname: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    const active = this.themeService.getActiveTheme();
    let theme = active.name;
    let themes = localStorage.getItem('theme')
      ? localStorage.getItem('theme')
      : theme;
    localStorage.setItem('theme', themes);
  }

  get formControls() {
    return this.registerForm.controls;
  }

  registerUser() {
    this.isSubmitted = true;
    if (!this.registerForm.valid) {
      return;
    }
    this.authService.register(this.registerForm.value).subscribe((res) => {
      if (res.status == 'OK') {
        this.registerForm.reset();
        this.toastr.success(
          'Congratulation now you are a member of social share'
        );
        this.isSubmitted = false;
      } else {
        this.toastr.error(res.message);
      }
    });
  }
}
