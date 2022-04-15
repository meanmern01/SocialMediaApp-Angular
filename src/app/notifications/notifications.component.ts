import { Component, OnInit, ViewChild, ViewEncapsulation, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';
declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
  // encapsulation: ViewEncapsulation.None
})
export class NotificationsComponent implements OnInit {

  notif_data: any = [];
  id: any = [];
  show: any;
  totalDisplay: number;
  bodyHeight: number;

  @HostListener("window:scroll")
  onScroll(e: Event): void {
    if (this.bottomReached()) {
      this.totalDisplay += 6;
      this.bodyHeight += 400;
    }
  }


  constructor(
    public authService: AuthService,
    private activatedRoute: ActivatedRoute,
  ) {
    this.bodyHeight = 1000;
    this.totalDisplay = 12;
    const current_login_User = JSON.parse(localStorage.getItem('currentUser'));
    this.id = current_login_User.data._id

    this.authService.getNotifications(this.id).subscribe(res => {
      if (res['success']) {
        this.notif_data = res['message']
      } else {
        this.show = res['message'];
      }

    })  
   }

  ngOnInit(): void {
  }
  bottomReached(): boolean {
    return (window.innerHeight + window.scrollY * 1.1) >= this.bodyHeight;
  }

}
