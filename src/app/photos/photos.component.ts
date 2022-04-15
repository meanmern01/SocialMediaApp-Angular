import { Component, HostListener, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PostModalComponent } from '../post-modal/post-modal.component';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize } from 'rxjs/operators';
declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-photos',
  templateUrl: './photos.component.html',
  styleUrls: ['./photos.component.css'],
})
export class PhotosComponent implements OnInit {
  slideIndex = 1;
  token = '';
  urls = [];
  album_urls = [];
  totalImg = 0;
  id = '';
  user = '';
  album_id: any;
  album_name: String;
  album_show: boolean;
  shows: any;
  album: any;
  public frd_datas: any = [];

  public datas;
  totalDisplay: number;
  height: number;

  constructor(
    public authService: AuthService,
    public router: Router,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    public toastr: ToastrService,
    public cookieService: CookieService,
    private spinner: NgxSpinnerService
  ) {
    this.token = localStorage.getItem('currentUser');
    this.id = this.activatedRoute.parent.params['value']['id'];
    this.totalDisplay = 3;
    this.height = 1000;
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.user = currentUser.data._id;

    if (
      this.router.url ===
      '/friends/' + this.activatedRoute.parent.params['value']['id'] + '/photos'
    ) {
      this.spinner.show();
      this.album_show = false;
      this.authService
        .getAllPhotos(this.cookieService.get('friendId'))
        .pipe(finalize(() => this.spinner.hide()))
        .subscribe((res) => {
          if (res['success']) {
            console.log('res', res);
            for (let i = 0; i < res.data.length; i++) {
              if (
                res.data[i].image.split('.').pop() !== 'mp4' &&
                'mkv' &&
                res.data[i].status === 0
              ) {
                this.urls.push(res.data[i]);
              }
            }
          } else {
            this.shows = res.message;
          }
        });
      this.authService
        .getAllAlbumsPhotos(localStorage.getItem('friendId'))
        .pipe(finalize(() => this.spinner.hide()))
        .subscribe((res) => {
          console.log('res', res);
          if (res['success']) {
            for (let i = 0; i < res.data.length; i++) {
              if (res.data[i].status === 0) {
                this.album_urls.push(res.data[i]);
              }
            }
          } else {
            this.album = res.message;
          }
        });
    } else {
      this.cookieService.delete('friendId');
      localStorage.removeItem('friendId');
      this.album_show = true;
      this.spinner.show();
      this.authService
        .getAllPhotos(this.id)
        .pipe(finalize(() => this.spinner.hide()))
        .subscribe((res) => {
          if (res['success']) {
            for (let i = 0; i < res.data.length; i++) {
              if (res.data[i].image.split('.').pop() !== 'mp4') {
                this.urls.push(res.data[i]);
                this.urls.reverse();
              }
            }
          } else {
            this.shows = res.message;
          }
        });
      this.authService
        .getAllAlbumsPhotos(this.id)
        .pipe(finalize(() => this.spinner.hide()))
        .subscribe((res) => {
          if (res['success']) {
            for (let i = 0; i < res.data.length; i++) {
              this.album_urls.push(res.data[i]);
            }
          }
        });
    }
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    if (this.bottomReached()) {
      this.totalDisplay += 3;
      this.height += 150;
    }
  }

  bottomReached(): boolean {
    return window.innerHeight + window.scrollY >= this.height;
  }

  delAlbum(album_id: any, album_name: any) {
    if (confirm(`Are you sure you want to delete this ${album_name} album ?`)) {
      this.authService.DeletePost(album_id).subscribe((res) => {
        if (res['success']) {
          this.toastr.success('Album is deleted successfully');
          location.reload();
        } else {
          this.toastr.error('Oops some error occur. Please try again later');
        }
      });
    }
  }

  openTextDialog(event: any) {
    //Multipul Image upload
    if (event.target.files && event.target.files[0]) {
      var filesAmount = event.target.files.length;
      for (let i = 0; i < filesAmount; i++) {
        var reader = new FileReader();

        reader.onload = (event: any) => {
          this.images.push(event.target.result);
        };
        reader.readAsDataURL(event.target.files[i]);
        this.files_data.push(event.target.files[i]);
      }
    }
  }

  fileData: File = null;
  previewUrl: any = null;
  images = [];
  files_data: any = [];
  openDialog(event: any): void {
    //Multipul Image upload
    if (event.target.files && event.target.files[0]) {
      var filesAmount = event.target.files.length;
      for (let i = 0; i < filesAmount; i++) {
        var reader = new FileReader();

        reader.onload = (event: any) => {
          this.images.push(event.target.result);
        };
        reader.readAsDataURL(event.target.files[i]);
        this.files_data.push(event.target.files[i]);
      }
    }
    const dialogRef = this.dialog.open(PostModalComponent, {
      width: '550px',
      panelClass: 'custom-dialog-container',
      data: { id: this.id, images: this.images, file: this.files_data },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.images = [];
      this.files_data = [];
    });
  }

  ngOnInit(): void {}
}
