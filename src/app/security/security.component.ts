import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-security',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SecurityComponent implements OnInit {
  id: any;
  data: any = [];
  user_data: any = [];
  pass: any;
  input_pass: boolean = false;
  enter_pass: boolean = true;
  change_pass: boolean = false;
  token: string;

  constructor(public authService: AuthService,
    private activatedRoute: ActivatedRoute, private toastr: ToastrService) { 
    this.id = this.activatedRoute.parent.params['value']['id'];
    this.token = localStorage.getItem('token')
    this.authService.getAllData(this.id).subscribe(res => {
      if(res.success){
        this.data = res.userData[0]
      }
    });

    this.authService.getUserProfile(this.id).subscribe(res => { 
      this.user_data = res.data
    })
  }

  changePass(pass) {
    this.authService.resetPassword(this.token, pass).subscribe((res) => { 
      this.toastr.success("Successfully reset password");
      this.enter_pass = true;
      this.input_pass = false;
      this.change_pass = false;
    })
  }

  enterpass() {
    this.enter_pass = false;
    this.input_pass = true;
    this.change_pass = true;
  }
  cancel_btn() {
    this.enter_pass = true;
    this.input_pass = false;
    this.change_pass = false;
  }

  ngOnInit(): void {
  }

}
