import { Component, OnInit, HostListener, ViewEncapsulation } from '@angular/core';
import { AuthService } from '../auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from "ngx-spinner";
import { finalize } from 'rxjs/operators';
declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-videos',
  templateUrl: './videos.component.html',
  styleUrls: ['./videos.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class VideosComponent implements OnInit {

  urls = [];
  token = '';
  id = '';
  shows: any;
  totalDisplay: number;
  bodyHeight: number;

  @HostListener("window:scroll")
  onScroll(e: Event): void {
    if (this.bottomReached()) {
      this.totalDisplay += 3;
      this.bodyHeight += 225;
    }
  }
  constructor(
    public authService: AuthService,
    public router: Router,
    private activatedRoute: ActivatedRoute,
    public cookieService: CookieService,
    private spinner: NgxSpinnerService
  ) { 
    this.bodyHeight = 1000;
    this.totalDisplay = 6;
    this.token = localStorage.getItem('token')
    this.id = this.activatedRoute.parent.params['value']['id'];
    this.spinner.show()
    if(this.router.url === '/friends/' + this.activatedRoute.parent.params['value']['id'] + '/videos'){
      this.authService.getAllPhotos(this.cookieService.get('friendId')).pipe(finalize(() => this.spinner.hide())).subscribe(res => {
        if (res['success']) {
        for (let i = 0; i < res.data.length; i++){ 
          if (res.data[i].image.split('.').pop() !== 'jpg' && res.data[i].image.split('.').pop() !== 'png' && res.data[i].image.split('.').pop() !== 'jpeg' && res.data[i].image.split('.').pop() !== 'undefined' && res.data[i].image.split('.').pop() !== 'JPG' && res.data[i].image.split('.').pop() !== 'gif') { 
              this.urls.push(res.data[i])
            }
          }
          this.urls.reverse();
        } else {
          this.shows = "User not uploaded any videos"
        }
      })
    } else {
      this.cookieService.delete('friendId')
      localStorage.removeItem('friendId')
      this.authService.getAllPhotos(this.id).pipe(finalize(() => this.spinner.hide())).subscribe(res => {
        if (res['success']) {
          for (let i = 0; i < res.data.length; i++){
            if (res.data[i].image.split('.').pop() !== 'jpg' && res.data[i].image.split('.').pop() !== 'png' && res.data[i].image.split('.').pop() !== 'jpeg' && res.data[i].image.split('.').pop() !== 'undefined' && res.data[i].image.split('.').pop() !== 'JPG' && res.data[i].image.split('.').pop() !== 'gif') {
              this.urls.push(res.data[i])
            }
          }
          this.urls.reverse();
      } else {
        this.shows = "User not uploaded any videos"
      }
      })
    }
  }

  ngOnInit(): void {
  }
  bottomReached(): boolean {
    return (window.innerHeight + window.scrollY * 1.1) >= this.bodyHeight;
  }

}
