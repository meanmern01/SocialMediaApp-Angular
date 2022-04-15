import { Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-account-setting',
  templateUrl: './account-setting.component.html',
  styleUrls: ['./account-setting.component.css'],
  encapsulation: ViewEncapsulation.None
})
  
export class AccountSettingComponent implements OnInit {
  profileForm: FormGroup;
  id: any
  datas: any = [];
  name: any;
  user: any;
  name_shows: boolean = true;
  edit_name: boolean = false;
  user_shows: boolean = true;
  edit_user: boolean = false;

  @ViewChild('nameText') nameTextElement: any;
  token: string;
  constructor(
    public authService: AuthService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public formBuilder: FormBuilder,
    public toastr: ToastrService
  ) {
    this.id = this.activatedRoute.parent.params['value']['id'];
      this.authService.getProfileforAbout(this.id).subscribe(res => {
        this.datas = res.data;
        this.name = res.data.name
        this.user = res.data.userName
      })
  }

  edit_names() {
    this.edit_name = true;
    this.name_shows = false;
  }

  save_names(name) {
    this.authService.updateName(this.id, name).subscribe((res) => {
      if (!res.result) {
        this.edit_name = false
        this.name_shows = true
        this.toastr.success("Your name has been updated successfully.");
      } else {
        this.toastr.error("Some error occurs. Please try again later.");
      }
    })
  }

  cancel_names() { 
    this.edit_name = false;
    this.name_shows = true;
  }

  edit_users() {
    this.edit_user = true;
    this.user_shows = false;
  }

  save_users(user) {
    this.authService.updateUsername(this.id, user).subscribe((res) => {
      if (!res.result) {
        this.edit_user = false
        this.user_shows = true
        this.toastr.success("Your username has been updated successfully.");
      } else {
        this.toastr.error("Oops error occurs. Please try again later.");
      }
    })
  }

  cancel_users() { 
    this.edit_user = false;
    this.user_shows = true;
  }

  ngOnInit(): void {
  }

}
