import { Component, OnInit, HostListener, ViewChild, TemplateRef, ElementRef, AfterViewInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ResolveEnd, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ThemeService } from '../theme/theme.service';
import { BnNgIdleService } from 'bn-ng-idle'; // import it to your component
import { ConnectionService } from 'ng-connection-service';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import Pusher from 'pusher-js';
// import { environment } from 'src/environments/environment';
import { SocketioService } from './socketio.service';
import {io} from 'socket.io-client';
import { PushNotificationsService } from 'ng-push-ivy';
import { environment } from 'src/environments/environment.prod';
declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'Social Share'
  // display: any;
  id: any;
  duration: number;
  timer: number;
  minutes: number;
  seconds: number;
  sessionUser = false;
  show: boolean = false;
  isConnected = true;  
  noInternetConnection: boolean; 
  idleState = 'Not started.';
  timedOut = false;
  lastPing?: Date = null;
  channel: any;
  socket
  chat: boolean;

  public modalRef: BsModalRef;
  private pusherClient: Pusher;
  video: HTMLVideoElement;
  @ViewChild('childModal', { static: false }) childModal: ModalDirective;
  current_user_id: any;
  usersOnline: any;

  constructor( private titleService: Title, public authService: AuthService, private router: Router, private themeService: ThemeService, private bnIdle: BnNgIdleService, private connectionService: ConnectionService, private idle: Idle, private keepalive: Keepalive, private modalService: BsModalService, private socketService: SocketioService,private _pushNotifications: PushNotificationsService) {
    if (this.authService.isLoggedIn()) {
      const current_login_User = JSON.parse(localStorage.getItem('currentUser'));
      this.current_user_id = current_login_User.data._id
      this.socket = io(environment.apiUrl);
      var status = 1
      this.chat = true
      this.socket.emit('login', {userId: this.current_user_id, status: status})
      this.router.events.subscribe((routerData) => {
        if(routerData instanceof ResolveEnd){ 
          if(routerData.url === '/chating/' + this.current_user_id || window.location.search){
            //Do something
            var status = 1
            this.authService.changechatStatus(this.current_user_id, status).subscribe(res => { })
            $('.main_float').removeClass('chat_float')
          } else {
            $('.main_float').addClass('chat_float')
            var status = 0
            this.authService.getUserProfile(this.current_user_id).subscribe(res => {
              if (res.data.chatStatus == 1) {
                this.authService.changechatStatus(this.current_user_id, status).subscribe(res => { })
              }
            })
          }
        }
      })

      // chat push message
      this.socket.on('notify', (data) => {
        if (this.router.url == '/chating/' + this.current_user_id || window.location.search) {
        } else {
          if (data.user == this.current_user_id) {
            this._pushNotifications.requestPermission();
            this._pushNotifications.create('You got a new message from ' + data.name, { body: data.msg }).subscribe(
              res => {
                if (res.event.type === 'click') {
                  const url = 'chating/' + this.current_user_id
                  this.router.navigate([url], {queryParams: {userId: data.userId, user: data.post_user}})
                  res.notification.close();
                }
              },
              err => console.log(err)
            )
          }
        }
      })

      // sets an idle timeout of 5 seconds, for testing purposes.
      idle.setIdle(600);
      // sets a timeout period of 5 seconds. after 10 seconds of inactivity, the user will be considered timed out.
      idle.setTimeout(300);
      // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
      idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

      idle.onIdleEnd.subscribe(() => {
        this.idleState = 'No longer idle.'
        this.reset();
      });
    
      idle.onTimeout.subscribe(() => {
        this.childModal.hide();
        this.idleState = 'Timed out!';
        this.timedOut = true;
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.id = currentUser.data._id
        let status = 0;
        // this.authService.updateStatus(this.id, status).subscribe(res => { })
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        localStorage.removeItem('friendId');
        window.location.replace('');
      });
    
      idle.onIdleStart.subscribe(() => {
        this.idleState = 'You\'ve gone idle!'
        this.childModal.show();
      });
    
      idle.onTimeoutWarning.subscribe((countdown) => {
        this.idleState = 'You will time out in ' + countdown + ' seconds!'
      });

      // sets the ping interval to 15 seconds
      keepalive.interval(150);

      keepalive.onPing.subscribe(() => this.lastPing = new Date());

      if (this.authService.isLoggedIn() !== true) {
        idle.watch()
        this.timedOut = false;
      } else {
        idle.stop();
      }
      var status = 0
      // this.socket.emit('disconnect', {userId: this.current_user_id, status: status})

      this.reset();
    } else {
      this.chat = false
    }

  }

  ngOnInit() {
  }

  hideChildModal(): void {
    this.childModal.hide();
  }

  stay() {
    this.childModal.hide();
    this.reset();
  }

  reset() {
    this.idle.watch();
    // this.idleState = 'Started.';
    this.timedOut = false;
  }
  get isLoggedIn() { return this.authService.isLoggedIn(); }

  setPageTitle(title: string) {
    this.titleService.setTitle(title);
  }

  logout(){
    this.childModal.hide();
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('friendId');
    window.location.replace('');
  }
  

  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    location.reload();
  }
}
