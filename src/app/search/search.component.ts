import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { NgxSpinnerService } from "ngx-spinner";
import { finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class SearchComponent implements OnInit {
  name = '';
  id = '';
  search_id = '';
  profileImg = '';
  user_profile = '';
  allUsers = [];
  friend_id:any = []
  search_by_name = false;
  search_data: Array<any> = [];
  frd_request_count = 0;
  hideme=[]
  user_post = 0;
  count_frd = 0;
  accept_hideme=[]
  noRecord = '';
  countSuggest = 0
  keyword = 'name';

  @ViewChild('searchText') searchTextElement: any;

  constructor(
    public authService: AuthService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    private spinner: NgxSpinnerService,
    public toastr: ToastrService
  ) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    this.authService.getProfileforAbout(this.id).subscribe(res => {
      this.name = res.data.name
      this.user_profile = res.data.profileImgURl
    })
    this.spinner.show()
    this.authService.getAllFriends(localStorage.getItem("token")).pipe(finalize(() => this.spinner.hide())).subscribe(res => {
      this.allUsers = res.AllUser[0]
    })
    this.authService.getFriendData(this.id).subscribe(res => {
      this.frd_request_count = res.list.length
      if (this.frd_request_count !== 0) {  
        $(".badges_for_fr").addClass("show_count");
      } 
    })
    this.authService.getProfilePost(this.id).subscribe(res => {
      if(res.code == 404){
        this.user_post = 0
      }else{
        this.user_post = res.length
      }
    })
    this.authService.getFriends(this.id).subscribe(res => {
      if(res['success']){
        this.count_frd = res.userInfo.length
      }
    })
    this.authService.getSuggestUser(this.id).subscribe(res => {
      this.countSuggest = res['data'].length
      if (this.countSuggest !== 0) { 
        $(".badges_for_pymk").addClass("show_know_friend");
      } 
    })
    this.authService.setRequestSend(localStorage.getItem('token')).subscribe(res => {
      this.friend_id = res.list.map((id) => id.friendId)
    })
  }

  ngOnInit(): void {
  }
  searchFrd(){
    if(this.searchTextElement.nativeElement.value === ''){
      this.search_by_name = false
    }else{
      this.search_by_name = true
      this.authService.getSearchUser(this.searchTextElement.nativeElement.value).subscribe(res => {
        if(res['success'] == true){
          this.search_data = res.data;
        }else{
          this.noRecord = res.data;
        }
      })
    }
  }

  sendRequest(requestId: any, name: any) {
    this.authService.sendFriendRequest(this.id, requestId).subscribe(res => { })
    this.toastr.success('Friend Request send to ' + name)
  }

  reject_request(reject_id: any) {
    if (confirm('Are you sure you want to cancel this request ?')) {
      this.authService.rejectFriendRequest(reject_id, this.id).subscribe(res => {
      })
      location.reload();
    }
  }
}
