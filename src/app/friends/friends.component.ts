import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../auth.service';
import { NgxSpinnerService } from "ngx-spinner";
import { finalize } from 'rxjs/operators';
declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent implements OnInit {
  profileImg = '';
  u_name = '';
  id = '';
  frdDetails = [];
  notAnyFrd = '';
  friend_id = '';
  allUsers = [];
  hideme = [];
  user = ''
  keyword = 'name';
  url_id: any;
  urls = [];
  friendId: string;
  show_friends = false

  constructor(
    public authService: AuthService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public toastr: ToastrService,
    public cookieService: CookieService,
    private spinner: NgxSpinnerService
  ) {
    let id = this.activatedRoute.parent.params['value']['id'];
    this.url_id = this.activatedRoute.parent.params['value']['id'];
    if (this.cookieService.get('friendId')) {
      this.friendId = this.cookieService.get('friendId')
      this.show_friends = false
      this.authService.getFriends(this.friendId).subscribe(res => {
        this.allUsers = res.userInfo
      })
      this.authService.getUsersFriends(this.friendId).subscribe(res => {
        this.profileImg = res.data.profileImgURl
        this.u_name = res.data.name
      })
    } else {
      this.authService.getFriends(id).subscribe(res => {
        this.allUsers = res.userInfo
      })
      this.authService.getUsersFriends(id).subscribe(res => {
        this.profileImg = res.data.profileImgURl
        this.u_name = res.data.name
      })
    }
    
    this.friend_id = '/profile/' + id + '/friends'
    this.spinner.show()
    if (router.url === '/profile/' + id + '/friends') {
      this.show_friends = true
      this.authService.getFriends(id).pipe(finalize(() => this.spinner.hide())).subscribe(res => {
        if(res.success)
        {
          for(let i = 0; i < res.userInfo.length; i++){
            this.frdDetails.push(res.userInfo[i])
          }
        }else{
          this.notAnyFrd = res.message
        }
      })
    }

    //For friends panel set selected friend friends
    if(router.url === '/friends/'+id+'/friends'){
      this.authService.getFriends(this.cookieService.get('friendId')).pipe(finalize(() => this.spinner.hide())).subscribe(res => {
        if(res.success){
          for(let i = 0; i < res.userInfo.length; i++){
            this.frdDetails.push(res.userInfo[i])
          }
        }else{
          this.notAnyFrd = res.message
        }
      })
    }
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.user = currentUser.data._id 
  }
  
  ngOnInit(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.id = currentUser.data._id    
  }

  reject_request(reject_id, friend_name) {
    if (confirm(`Are you sure you want to unfriend ${friend_name} ?`)) {
      this.authService.unFriendRequest(reject_id, this.id).subscribe(res => {
        this.toastr.success("You successfully unfriended " + friend_name + " from your friends list.");
        location.reload();
      })
    } else {
      // location.reload();
    }
    
  }
}
