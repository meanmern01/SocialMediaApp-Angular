import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  id= '';
  chat: boolean = false
  notif_data: any[] = [];
  toggle: boolean = false;
  constructor(public authService: AuthService, private router: Router) { 
    this.router.events.subscribe((event: any) =>{
      if(event instanceof NavigationEnd){
        event.url.split('/')[1] == 'chating' ? this.chat = true : this.chat = false
      }
    })
  }

  ngOnInit(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.id = currentUser.data._id
    this.authService.getNotifications(this.id).subscribe(res => {
      if(res['success']){
        this.notif_data = res['message']
      } else {
        this.notif_data = []
      }
    })
  }

  logout() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.id = currentUser.data._id
    let status = 0;
    // this.authService.updateStatus(this.id, status).subscribe(res => {})
    
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('friendId');
    window.location.replace('');
  }

  chatting(){
    this.router.navigate(['chating/', this.id])
    this.chat = !this.chat
  }

  onClickedOutside(event: any){
    $('#collapseExample').toggle(false)
  }
  toggleDetect(){
    $('#collapseExample').toggle(true)
  }
}