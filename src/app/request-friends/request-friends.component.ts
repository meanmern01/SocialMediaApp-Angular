import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from "ngx-spinner";
import { finalize } from 'rxjs/operators';
declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-request-friends',
  templateUrl: './request-friends.component.html',
  styleUrls: ['./request-friends.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class RequestFriendsComponent implements OnInit {
  login_id = '';
  profileImg = '';
  u_name = '';
  description = '';
  url = '';
  showView = false;
  hideme=[]
  accept_hideme=[]
  prf_friend = [];

  // For friends profile view varible
  name = '';
  u_id = '';
  u_designation = '';
  u_state = '';
  u_country = '';
  u_city = '';
  u_hobbies = '';
  u_email = '';
  newDate: Date = null;
  fileDataVal: File = null;
  previewUrl:any = null;
  imageCov:any = 'assets/images/bg.jpg';
  token = '';
  checkclick = 0;
  timeline_hide = true
  clicked = true
  friend_req_hidden = true
  frd_req_get_count = 0

  public datas: any = [];
  public checksendreq: any = [];
  public frd_datas: any = [];
  public frd_profile_datas: any = [];
  check_id_frd_list = [];
  remove_datas = '';
  postlikeId = []
  likes = [];
  objVal = [];
  commentsForm: FormGroup;
  msg: boolean;

  cmntuname = '';
  cmntuprofile = '';
  friend_id:any = []
  showbasicProfile = [];
  showbasicProfile3 = [];

  constructor(
    public authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
    public formBuilder: FormBuilder,
    public toastr: ToastrService,
    private cookieService: CookieService,
    private spinner: NgxSpinnerService
  ) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.login_id = currentUser.data._id
    this.token = localStorage.getItem('token')
    this.commentsForm= this.formBuilder.group({
      newcomment: ['']
    })
    let current_id = this.activatedRoute.snapshot.paramMap.get('id');
    this.authService.getFriendRequest(current_id).subscribe(res => {
      if(res.message == "Not any friend request avilable")
      {
        this.friend_req_hidden = false
      }else{
        if(res.list.length == 0){
          this.friend_req_hidden = false
        }
        this.authService.getFriendData(current_id).subscribe(res => {
          this.frd_profile_datas = res.list
          for(let i = 0; i < this.frd_profile_datas.length; i++){
            this.frd_req_get_count += 1
            this.datas = this.datas.filter(({ _id }) => _id !== this.frd_profile_datas[i]._id)            
          }
        })
      }
    })
  }

  open_comments(postId){
    $(`.comments_container_${postId}`).toggle();
  }

  get formControls() { return this.commentsForm.controls }

  ngOnInit(): void {
    this.authService.getAllFriends(localStorage.getItem('token')).subscribe(res => {
      this.datas = res.AllUser[0]
      this.checkSendReq();
    })

    this.authService.setRequestSend(localStorage.getItem('token')).subscribe(res => {
      this.friend_id = res.list.map((id) => id.friendId)
      this.checkSendReq();
    })
  }
  hide_cancel_req = false
  checkSendReq(){
    for(let i = 0; i < this.datas.length; i++){
      if(this.friend_id.includes(this.datas[i]._id))
      {
        this.hide_cancel_req = true
      }
    }
  }

  view_friend_list() {
    this.showView = false
    $(".left").removeClass("mobile_view");
    $(".viewProfile").addClass("mobile_view");
  }

  openProfile(id){
    this.checkclick += 1
    this.showView = true
    this.frd_datas = []
    $(".left").addClass("mobile_view");
    this.authService.getProfileForFriend(id).subscribe(res => {
      this.u_id = res.data._id
      this.name = res.data.name
      this.u_designation =  res.data.designation
      this.u_country =  res.data.country
      this.u_state =  res.data.state
      this.u_city =  res.data.city
      this.u_hobbies =  res.data.hobbies
      this.profileImg =  res.data.profileImgURl
      this.u_name =  res.data.name
      this.u_email =  res.data.emailId
      this.newDate= new Date(res.data.createdAt);
      this.previewUrl = res.data.profileImgURl
      this.imageCov = res.data.coverImgURl ? res.data.coverImgURl : 'assets/images/bg.jpg'
    })
    this.cookieService.delete('friendId')
    this.cookieService.set('friendId', id, { expires: 2, sameSite: 'None', secure: true })
    localStorage.setItem('friendId', id)
    this.spinner.show()
    this.authService.getFriendPost(id).pipe(finalize(() => this.spinner.hide())).subscribe(res => {
      if (res['success']) {
        this.msg = false;
        this.frd_datas = res.data
        const { image, thumbImage, alt, title } = res;
        for (let i = 0; i < this.frd_datas.length; i++) {
          this.likes = this.frd_datas[i].like
          if (this.likes.length > 0) {
            this.postlikeId.push(this.frd_datas[i]._id)
          }
        }
      } else {
        this.msg = true
      }
    })

    this.authService.getProfileforAbout(this.activatedRoute.snapshot.paramMap.get('id')).subscribe(res => {
      this.cmntuname =  res.data.name
      this.cmntuprofile = res.data.profileImgURl
    })

    this.timeline_hide = true
    this.router.navigate([`friends/${this.login_id}`])
  }

  sendRequest(requestId: any){
    let userId = this.activatedRoute.snapshot.paramMap.get('id');
    this.authService.sendFriendRequest(userId, requestId).subscribe(res => {
      $(`.cancel_friend_${requestId}`).attr('style', 'display: inline !important');
      $(`.add_friend_${requestId}`).css('display','none');
      $(`.remove_friend_${requestId}`).css('display','none');
    })
  }
  share(postId: any) { 
    $(`.sharing_container_${postId}`).toggle();
  }

  confirm_request(confirm_id: any){
    let userId = this.activatedRoute.snapshot.paramMap.get('id');
    this.authService.acceptFriendRequest(userId, confirm_id).subscribe(res => {
      this.toastr.success("Friends Request is Accepted Successfully!");
    })
  }

  reject_request(reject_id: any){
    let userId = this.activatedRoute.snapshot.paramMap.get('id');
    this.authService.rejectFriendRequest(userId, reject_id).subscribe(res => {
      this.toastr.success("Friend Request is Rejected!");
    })
  }

  //Reject for it's own request for already send
  remove_send_request(reject_id: any){
    let userId = this.activatedRoute.snapshot.paramMap.get('id');
    if (confirm('Are you sure you want to cancel this request ?')) { 
      this.authService.removeSendRequest(userId, reject_id).subscribe(res => {
        this.toastr.success("Friend Request is Cancel!");
        if($(`.show_add_friend_${reject_id}`).is(":visible"))
        {
          $(`#add_${reject_id}`).attr('style', 'display: inline !important');
        }else{
          $(`.cancel_friend_${reject_id}`).css('display','none');
          $(`.add_friend_${reject_id}`).attr('style', 'display: inline !important');
          $(`.remove_friend_${reject_id}`).attr('style', 'display: inline !important');
        }
      })
      location.reload();
    }
  }

  sharing(postId: any, post_user: any) { 
    if (confirm("You are sharing "+ `${post_user}` +" post with in your timeline!")) {
      this.authService.sharingPosts(this.token, postId, this.login_id).subscribe(res => { 
        this.toastr.success("You are successfully shared the post!");
        window.location.reload();
      })
    }
  }

  temLike = 0;
  checkTem =  false
  likeIt(postId: any, likeCount: any){
    this.authService.sendLikePost(postId).subscribe(res => {
      if(res['success'])
      {
        this.checkTem = true
        if(document.getElementById(postId).classList[2] === 'fa-thumbs-up' || document.getElementById(postId).classList[1] === 'fa-thumbs-up')
        {
          document.getElementById(postId).classList.remove('fa-thumbs-up')
          document.getElementById(postId).classList.add('fa-thumbs-o-up')
          this.temLike = likeCount - 1
          this.temLike <= 0 ? document.getElementById('count_'+postId).innerHTML = '' : document.getElementById('count_'+postId).innerHTML = String(this.temLike);
        }else {
          document.getElementById(postId).classList.add('fa-thumbs-up')
          this.temLike = likeCount + 1
          if(likeCount < 1){
            this.temLike = this.temLike - 1
          }
          if(this.temLike >= 2){
            this.temLike = this.temLike - 1
          }else{
            this.temLike = this.temLike + 1
          }
          this.temLike <= 0 ? document.getElementById('count_'+postId).innerHTML = '' : document.getElementById('count_'+postId).innerHTML = String(this.temLike);
        }
      }
    })
  }

  temCmnt = [];
  tryCmnt: any = [];
  tempPostId = '';
  tempProfile = '';
  tempName = '';

  addComments(postId: any, userName: any, profilePic: any){
    this.objVal = Object.keys(this.commentsForm.value).map(key => ({type: key, value: this.commentsForm.value[key]}))
    this.authService.sendPostComment(postId, this.objVal[0].value).subscribe(res => {
      if(res['success']){
        $(`.comments_container_${postId}`).css('display','block');
        if(this.frd_datas.map((id) => id._id).includes(postId)){
          this.tempName = userName
       this.tempProfile = profilePic
       this.tempPostId = postId
          this.checkTem = true
          var data = this.objVal[0].value
          this.tryCmnt = { postId, userName, profilePic, data }
          this.temCmnt.push(this.tryCmnt)
        }
      }
    })
    this.commentsForm.reset()
  }

  remove_people(people_id: any){
    $(`.remove_people_${people_id}`).parent().css('display','none');
  }

}


