import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
declare var jQuery: any;
declare var $: any;


@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit {
  name = '';
  u_designation = '';
  u_state = '';
  u_country = '';
  u_city = '';
  u_number ='';
  u_address = '';
  u_website = '';
  u_religious = '';
  u_status = '';
  u_gender = '';
  u_birthdate = '';
  id: string;
  friendid: string;

  constructor(
    public authService: AuthService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public cookieService: CookieService
  ) {
    if (this.router.url == '/friends/' + this.activatedRoute.parent.parent.params['value']['id'] + '/about/overview') {
      // this.friendid = localStorage.getItem('friendId')
      this.friendid = this.cookieService.get('friendId')
      this.authService.getProfileforAbout(this.friendid).subscribe(res => {
        this.u_designation = res.data.designation
        this.u_country = res.data.country
        this.u_state = res.data.state
        this.u_city = res.data.city
          this.authService.getAllData(this.friendid).subscribe(other_res => {
            if (other_res['success']) {
              this.u_number = other_res.userData[0].mobileNumber;
              this.u_address = other_res.userData[0].address;
              this.u_website = other_res.userData[0].website;
              this.u_religious = other_res.userData[0].basicInfo;
              this.u_status = other_res.userData[0].relationshipStatus;
              this.u_gender = other_res.userData[0].gender;
              this.u_birthdate = other_res.userData[0].birthDate
            }
          })
      })  
    } else {
      localStorage.removeItem('friendId')
      this.cookieService.delete('friendId')
      this.id = this.activatedRoute.parent.parent.params['value']['id'];
      this.authService.getProfileforAbout(this.id).subscribe(res => {
        this.u_designation = res.data.designation
        this.u_country = res.data.country
        this.u_state = res.data.state
        this.u_city = res.data.city
        this.authService.getAllData(this.id).subscribe(other_res => {
        if (other_res['success']) {
          this.u_number = other_res.userData[0].mobileNumber;
          this.u_address = other_res.userData[0].address;
          this.u_website = other_res.userData[0].website;
          this.u_religious = other_res.userData[0].basicInfo;
          this.u_status = other_res.userData[0].relationshipStatus;
          this.u_gender = other_res.userData[0].gender;
          this.u_birthdate = other_res.userData[0].birthDate
          }
        })
      })          
    }
  }

  ngOnInit(): void {
  }
}
