import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ThemeService } from '../../theme/theme.service';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-themes',
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.css', './theme.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ThemeComponent implements OnInit {
  expiredDate: Date;
  cookieValue: string;
  value: any = ['light'];
  active: import("../../theme/symbols").Theme;
  hide: boolean;
  themeChange: any;
  id: any;
  data: any = [];

  constructor(private themeService: ThemeService, private cookieService: CookieService, private toastr: ToastrService, public authService: AuthService) {
    
    this.themeChange = localStorage.getItem('theme');
    this.data = localStorage.getItem('currentUser');
    const current_login_User = JSON.parse(localStorage.getItem('currentUser'));
    this.id = current_login_User.data._id;
    this.authService.getUserProfile(this.id).subscribe(res => {
      this.cookieValue = res.data.theme ? res.data.theme : localStorage.getItem('theme');
      this.themeService.setTheme(this.cookieValue);
    })
  }
  

  ngOnInit(): void {
  }

  submit(themeChange) {
    this.toastr.success("Theme is updated successfully");
    this.themeService.setTheme(themeChange);
    localStorage.setItem("theme", themeChange);
    this.authService.changeTheme(this.id, themeChange).subscribe(res => {
    })
  }

}
