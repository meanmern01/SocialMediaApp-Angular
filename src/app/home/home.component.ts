import { ChangeDetectorRef, Component, HostListener, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, NavigationStart, NavigationEnd, Event, NavigationCancel, 
  NavigationError, RouteConfigLoadStart, RouteConfigLoadEnd } from '@angular/router';
import { MatDialog} from  '@angular/material/dialog';
import { PostModalComponent } from '../post-modal/post-modal.component';
import { AuthService } from '../auth.service';
 import { NgImageSliderComponent } from 'ng-image-slider';
import { ToastrService } from 'ngx-toastr';
import { ThemeService } from '../../theme/theme.service';
import { NgxSpinnerService } from "ngx-spinner";
import { finalize, tap } from 'rxjs/operators';
import {io} from 'socket.io-client';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import 'web-social-share';
declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit {
  name = '';
  id = '';
  profileImg = '';
  post_profileImg = '';
  param = '';
  frd_request_count = 0;

  // posts
  description = '';
  url = [];
  token = '';
  user_post = 0;
  count_frd = 0;
  countSuggest = 0;
  postlikeId = [];
  likes = [];
  shares = [];
  alreadyLike = '';
  postlikeuserId = [];
  objVal = [];
  comments = 0;
  toggle = [];
  current_user = '';
  allUsers = [];
  friends = [];
  keyword = 'name';
  showbasicProfile = [];
  showbasicProfile2 = [];
  showbasicProfile3 = [];
  showLikes = [];
  share_display: boolean = false;
  show_more: boolean = false;

  checkPostsId: any;
  commentsForm: FormGroup;
  twoimg = false;
  oneimg = false;
  urls = [];
  viewImgdatas = [];
  postId = [];
  viewImg = [];
  public slideIndex = 1;
  imageObject = []
  ready = false

  public datas;
  public likess;
  u_country: any;
  u_state: any;
  public temp;
  public showLoadingIndicator: boolean = true;

  postImageData = {}
  showMore: boolean;
  u_city: any;
  loadingRouteConfig: boolean;
  socket;
  @ViewChild('nav') slider: NgImageSliderComponent;
  count_cmt: any;
  check_temp: boolean;
  totalDisplayed: any;
  show_load_more: boolean = true;
  sharess: any;
  cookieValue: string;
  ids: any;
  totalDisplay: number;
  bodyHeight: number;
  message: any;
  frdDetails = [];
  notAnyFrd: any;
  comment_length: number = 3;
  increase_comment: number = 5;

  @HostListener("window:scroll")
  onScroll(e: Event): void {
    if (this.bottomReached()) {
      this.totalDisplay += 5;
      this.bodyHeight += 500;
    }
  }

  constructor(
    public authService: AuthService,
    public  dialog:  MatDialog,
    private activatedRoute: ActivatedRoute,
    public formBuilder: FormBuilder,
    public router: Router,
    private route: ActivatedRoute,
    public toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private cdr: ChangeDetectorRef
  ) {
    this.totalDisplay = 3;
    this.bodyHeight = 1000;
    this.socket = io(environment.apiUrl);
    const current_login_User = JSON.parse(localStorage.getItem('currentUser'));
    this.ids = current_login_User.data._id
    $(".hide_theme").css("display", "none");

    $(document).ready(function(){
      setTimeout(function(){
         $(".load_more").show();
       }, 5000);
    });
// bottom to top btn

$(window).scroll(function() {
  if ($(window).scrollTop() > 300) {
    $("#button_top").addClass("show");
  } else {
    $("#button_top").removeClass('show');
  }
});

    // end here
    
    let id = this.activatedRoute.snapshot.paramMap.get('id');
    
    this.authService.getUserHome(id).subscribe(res => {
      this.id = res.data._id
      this.name =  res.data.name
      this.profileImg = res.data.profileImgURl
    })

    this.token = localStorage.getItem('token')
    this.current_user = JSON.parse(localStorage.getItem('currentUser'))
    this.spinner.show();
    this.authService.getAllFriendPost(this.token).pipe(finalize(() => { this.spinner.hide(); Notification.requestPermission() })).subscribe(res => {
      if (res['success'] && res.posts) {
        this.datas = res.posts
        for(let i = 0; i < this.datas.length; i++){
          const images = []
          this.shares = this.datas[i].share.length
          this.description = this.datas[i].description;
          this.likes = this.datas[i].like
          this.comments = this.datas[i].comment.length
          this.url.push(this.datas[i].imageUrl)
          this.datas[i].state =  this.datas[i].state
          this.datas[i].city = this.datas[i].city
          this.authService.getHomePostProfile(this.datas[i].userId).subscribe(res => {
            this.datas[i].post_user_designation = res.data.designation
            this.datas[i].post_user_email = res.data.emailId
            this.datas[i].post_profileImg = res.data.profileImgURl
            this.datas[i].post_user = res.data.name
          })

          if (this.comments > 4) {
            $('.comments_container').css('height', '40vh');
            $('.comments_container').css('overflow-y', 'scroll');
          }

          if(this.likes.length > 0){
            for(let j = 0; j < this.datas[i].like.length; j++){
              this.postlikeuserId.push(this.datas[i].like[j]['userId'])
              if(this.postlikeuserId.includes(id)){
                this.postlikeId.push(this.datas[i]._id)
              }
            }
            this.postlikeuserId = Array.from(new Set(this.postlikeuserId)) //For Uniquee fetch
          }
        }
        return this.datas
      } else {
        this.message = res.message;
      }
    })

    this.authService.getAllFriends(localStorage.getItem("token")).subscribe(res => {
      if(res.success){
        this.allUsers = res.AllUser[0]
      }
    })

    this.authService.getFriendData(id).subscribe(res => {
      if(res.success){
        this.frd_request_count = res.list.length
        if (this.frd_request_count !== 0) {  
          $(".badges_for_fr").addClass("show_count");
        } 
      }
    })

    this.authService.getProfilePost(id).subscribe(res => {
      if(res.code == 404){
        this.user_post = 0
      }else{
        this.user_post = res.length
      }
    })

    this.authService.getSuggestUser(id).subscribe((res:any) => {
      if(res.success){
        this.countSuggest = res['data'].length
        if (this.countSuggest !== 0) { 
          $(".badges_for_pymk").addClass("show_know_friend");
        }
      }
    })

    this.commentsForm= this.formBuilder.group({
      newcomment: ['']
    })

    this.socket.on('User_status', (data) => {
      this.frdDetails.filter((e) => e._id == data ? this.update_status() : '')
    })
  }
  get formControls() { return this.commentsForm.controls }

  ngOnInit(): void {
    let id = this.activatedRoute.snapshot.paramMap.get('id');
    this.toggle = this.toggle
      this.authService.getFriends(id).subscribe(res => {
        this.frdDetails = []
        if(res.success){
          this.friends = res.userInfo
          this.count_frd = res.userInfo.length
          for(let i = 0; i < res.userInfo.length; i++){
            this.frdDetails.push(res.userInfo[i])
          }
        }else{
          this.notAnyFrd = res.message
        }
    })
  }
  ngAfterViewInit() { this.ready = true; this.cdr.detectChanges();}
  
  update_status() {
    this.authService.getFriends(this.id).subscribe(res => {
      this.frdDetails = []
      this.friends = res.userInfo
      if(res.success){
        for(let i = 0; i < res.userInfo.length; i++){
          this.frdDetails.push(res.userInfo[i])
        }
      }else{
        this.notAnyFrd = res.message
      }
    })
  }

  open_comments(postId){
    $(`.comments_container_${postId}`).toggle();
  }
  bottomReached(): boolean {
    return (window.innerHeight + window.scrollY * 1.1) >= this.bodyHeight;
  }
  share(postId) { 
    $(`.sharing_container_${postId}`).toggle();
  }

  logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('friendId');
    window.location.replace('');
  }

  openTextDialog(event: any){

    //Multipul Image upload
    if (event.target.files && event.target.files[0]) {
      var filesAmount = event.target.files.length;
      for (let i = 0; i < filesAmount; i++) {
        var reader = new FileReader();

        reader.onload = (event:any) => {
           this.images.push(event.target.result);
        }
        reader.readAsDataURL(event.target.files[i]);
        this.files_data.push(event.target.files[i]);
      }
    }

    const dialogRef = this.dialog.open(PostModalComponent, {
      width: '550px',
      panelClass: 'custom-dialog-container',
      data: { id: this.id, images: this.images, file: this.files_data }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.images = [];
      this.files_data = [];
    });
  }

  fileData: File = null;
  previewUrl: any = null;
  images = [];
  files_data: any = [];
  openDialog(event: any): void{
    //Multipul Image upload
    if (event.target.files && event.target.files[0]) {
      var filesAmount = event.target.files.length;
      for (let i = 0; i < filesAmount; i++) {
        var reader = new FileReader();

        reader.onload = (event:any) => {
           this.images.push(event.target.result);
        }
        reader.readAsDataURL(event.target.files[i]);
        this.files_data.push(event.target.files[i]);
      }
    }
    const dialogRef = this.dialog.open(PostModalComponent, {
      width: '550px',
      panelClass: 'custom-dialog-container',
      data: { id: this.id, images: this.images, file: this.files_data, event: event }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.images = [];
      this.files_data = [];
    });
  }

  temLike = 0;
  checkTem = false
  
  view_more(postId) {
    this.show_more = true;
    // $(`#view_more_${postId}`).css('display', 'none');
    // $(`#view_less_${postId}`).css('display', 'block');
    $(`#view_${postId}`).css('display', 'block');
    $(`#sview_${postId}`).css('display', 'none');
    document.getElementById(`main_post_contents_${postId}`).scrollIntoView({
      behavior: 'smooth'
    });
  }

  view_less(postId) {
    this.show_more = false;
    // $(`#view_more_${postId}`).css('display', 'block');
    // $(`#view_less_${postId}`).css('display', 'block');
    $(`#view_${postId}`).css('display', 'none');
    $(`#sview_${postId}`).css('display', 'block');
    document.getElementById(`main_post_contents_${postId}`).scrollIntoView();
  }

  view_more_comment(value){
    // console.log("value", value)
  }

  tempLikePostId = ''
  temCntLike: any = []
  like_name: any = [];
  like_length: any;
  data: any = []
  divHide: any = [];

  likeIt(postId: string) {
    this.authService.sendLikePost(postId).subscribe(res => {
      if(res['success'])
      {
          this.data = res['data']
          this.divHide = document.getElementById('like_' + postId);
          this.like_length = this.data.length
          this.checkTem = true
          if(document.getElementById(postId).classList[2] === 'fa-thumbs-up' || document.getElementById(postId).classList[1] === 'fa-thumbs-up')
          {
            document.getElementById(postId).classList.remove('fa-thumbs-up')
            document.getElementById(postId).classList.add('fa-thumbs-o-up')
            if (this.datas.map((id) => id._id).includes(postId)) {
              this.tempLikePostId = postId
              this.temCntLike--;
              document.getElementById('like_' + postId).innerHTML = "";
              for(let i = 0; i < this.data.length; i++){
              this.like_name = this.data[i].name
              document.getElementById('like_' + postId).innerHTML += "<p>" + this.like_name + "</p>"
              
              }
            }
          }else {
            document.getElementById(postId).classList.add('fa-thumbs-up')
            if (this.datas.map((id) => id._id).includes(postId)) {
              this.tempLikePostId = postId
              this.temCntLike++;
              this.like_name = []
              document.getElementById('like_' + postId).innerHTML = "";
              for(let i = 0; i < this.data.length; i++){

              this.like_name = this.data[i].name
              document.getElementById('like_' + postId).innerHTML += "<p>" + this.like_name + "</p>"
            }
            }
          }
      }
    })
  }

  showProfile(){
    window.location.replace('profile/' + this.id);
  }

  sharing(postId, post_user) { 
    if (confirm("You are sharing "+ `${post_user}` +" post with your timeline!")) {
      this.authService.sharingPosts(this.token, postId, this.id).subscribe(res => { 
        this.toastr.success("You are successfully shared the post!");
        window.location.reload();
      })
    }
  }

  loadMore() {
    this.totalDisplayed += 10;
    if (this.totalDisplayed >= this.datas.length) {
      this.show_load_more = false
    }
  };

  temCmnt: any = [];
  tryCmnt: any = [];
  tempPostId = '';
  tempProfile = '';
  tempName = '';
  modalopen = false;
  next_img = false;
  totalImg = 0;

  addComments(postId, userName, profilePic){
    this.objVal = Object.keys(this.commentsForm.value).map(key => ({ type: key, value: this.commentsForm.value[key] }))
  
    if (this.objVal[0].value !== '') {
      this.authService.sendPostComment(postId, this.objVal[0].value).subscribe(res => {
        if (res['success']) {
          $(`.comments_container_${postId}`).css('display', 'block');
          if (this.datas.map((id) => id._id).includes(postId)) {
            this.count_cmt = res['data']
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
    } else {
      this.toastr.info("You can't submit empty comment")
    }
  }
}
