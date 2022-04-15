import {
  Component,
  OnInit,
  Inject,
  ViewChild,
  ElementRef,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '../auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize } from 'rxjs/operators';
import { NgxImageCompressService } from 'ngx-image-compress';
import { NgxMasonryOptions } from 'ngx-masonry';
declare var jQuery: any;
declare var $: any;

export class PostModalComponent implements OnInit {
  name = '';
  parentRouteId: any = '';
  smallProfile = '';
  userId = '';
  token = '';
  fileData: Array<File> = [];
  fileCovToReturn: Array<File> = [];
  images = [];
  last_images = '';
  add_files = [];
  sec_img_width = '';
  arrayfile: any = [];
  total = false;
  sum = 0;
  twowidth = '100%';
  height = '';
  firstwidth = '';
  twoimg = false;
  threeimg = false;
  fourimg = false;
  fiveimg = false;
  closeDialog = false;
  shows: boolean = false;
  temp_images: any = [];
  status: any;
  postMsgDoc: any = '';

  @ViewChild('postMsg') postMesssgeElement: any;
  @ViewChildren('postImage') postImageElement: QueryList<ElementRef>;
  textOnlylength: number;
  friendId: any;

  constructor(
    private dialogRef: MatDialogRef<PostModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public authService: AuthService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private imageCompress: NgxImageCompressService
  ) {
    this.authService.getProfileforAbout(data.id).subscribe((res) => {
      this.name = res.data.name;
      this.smallProfile = res.data.profileImgURl;
    });
    this.fileData.push(
      data.file.filter(
        (a, i) => data.file.findIndex((s) => a.name === s.name) === i
      )
    );
    this.images = data.images.filter(
      (a, i) => data.images.findIndex((s) => a === s) === i
    );
    if (data.event) {
      this.openByButton(data.event);
    }
    // this.openNewDialog(data.event)
    if (data.images && data.files != '') {
      if (Object.keys(this.fileData[0]).length === 2) {
        this.twoimg = true;
        this.threeimg = false;
        this.fourimg = false;
        this.fiveimg = false;
        this.shows = true;
      } else if (Object.keys(this.fileData[0]).length == 3) {
        this.threeimg = true;
        this.twoimg = false;
        this.fourimg = false;
        this.fiveimg = false;
        this.shows = true;
      } else if (Object.keys(this.fileData[0]).length == 4) {
        this.threeimg = false;
        this.twoimg = false;
        this.fourimg = true;
        this.fiveimg = false;
        this.shows = true;
      } else if (Object.keys(this.fileData[0]).length > 4) {
        this.threeimg = false;
        this.twoimg = false;
        this.fourimg = false;
        this.fiveimg = true;
        this.shows = true;
      }
    }
  }

  ngOnInit(): void {}

  showEmojiPicker = false;

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event) {
    this.postMsgDoc += event.emoji.native;
  }

  onFocus() {
    this.showEmojiPicker = false;
  }

  public gridOptions: NgxMasonryOptions = {
    gutter: 20,
    resize: !20,
    initLayout: !0,
    fitWidth: !0,
  };

  public Close() {
    this.dialogRef.close();
  }
  cancel() {
    while (this.temp_images.length > 0) {
      this.temp_images.pop();
    }
    while (this.data.file.length > 0) {
      this.data.file.pop();
    }
    while (this.images.length > 0) {
      this.images.pop();
    }
    while (this.arrayfile.length > 0) {
      this.arrayfile.pop();
    }
    $('.set_view_more').css('display', 'none');
    this.shows = false;
    this.toastr.info('All media are removed.');
  }

  postSave() {
    this.token = localStorage.getItem('token');
    this.friendId = localStorage.getItem('friendId');
    if (this.postImageElement.length !== 0) {
      if (this.fileData[0] !== undefined) {
        this.arrayfile = this.fileData[0];
      } else {
        this.arrayfile = this.fileData;
      }
      let arrayRemoveNull = this.arrayfile.filter(
        (a, i) => this.arrayfile.findIndex((s) => a.name === s.name) === i
      );
      console.log('check image file', this.arrayfile);
      if (arrayRemoveNull[0].name.split('.').pop() !== 'png') {
        this.spinner.show();
        for (let i = 0; i < arrayRemoveNull.length; i++) {
          this.fileCovToReturn.push(
            this.base64ToFile(this.images[i], arrayRemoveNull[i].name)
          );
          var reader = new FileReader();
          reader.readAsDataURL(this.fileCovToReturn[i]);
        }
      } else {
        this.toastr.info(
          'png format is not supported used other format like jpg or jpeg'
        );
      }
      reader.onload = async (_event) => {
        console.log('this.status', this.status);
        let message = await linkify(
          this.postMesssgeElement.nativeElement.value
        );
        console.log('message', message);
        this.authService
          .newPost(
            this.token,
            message,
            this.fileCovToReturn,
            this.status ? this.status : 0
          )
          .pipe(finalize(() => this.spinner.hide()))
          .subscribe((res) => {
            if (window.location.href.split('/')[3] == 'home') {
              window.location.replace(
                'home/' + window.location.href.split('/')[4]
              );
            } else {
              window.location.replace(
                'profile/' + window.location.href.split('/')[4]
              );
            }
          });
      };
    } else {
      this.toastr.info('Please add images to post');
      if (this.postMesssgeElement.nativeElement.value == '') {
        this.toastr.info('You are not set description!');
      } else if (this.postMesssgeElement.nativeElement.value.valid !== '') {
        let message = linkify(this.postMesssgeElement.nativeElement.value);
        this.authService.newtextPost(this.token, message).subscribe((res) => {
          if (window.location.href.split('/')[3] == 'home') {
            window.location.replace(
              'home/' + window.location.href.split('/')[4]
            );
          } else {
            window.location.replace(
              'profile/' + window.location.href.split('/')[4]
            );
          }
        });
      }
    }
  }

  base64ToFile(data, filename) {
    const arr = data.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  openNewDialog(event: any): void {
    console.log('check event', event);
    for (var i = 0; i < event.target.files.length; i++) {
      if (i === event.target.files.length - 1) {
        this.textOnlylength = i;
      }
    }
    this.shows = true;
    if (this.images.length === 1 || this.textOnlylength === 1) {
      // this.shows = true
      this.twoimg = true;
      this.threeimg = false;
      this.fourimg = false;
      this.fiveimg = false;
    } else if (this.images.length === 2 || this.textOnlylength === 2) {
      // this.shows = true
      this.threeimg = true;
      this.twoimg = false;
      this.fourimg = false;
      this.fiveimg = false;
    } else if (this.images.length === 3 || this.textOnlylength === 3) {
      // this.shows = true
      this.fourimg = true;
      this.threeimg = false;
      this.twoimg = false;
      this.fiveimg = false;
    } else if (this.images.length >= 4 || this.textOnlylength >= 4) {
      // this.shows = true
      this.fourimg = false;
      this.threeimg = false;
      this.twoimg = false;
      this.fiveimg = true;
    }
    if (this.images !== undefined) {
      this.images;
    } else {
      this.images = [];
    }
    // Multipul Image upload
    if (event.target.files && event.target.files[0]) {
      var filesAmount = event.target.files.length;
      if (this.fileData[0] == undefined || this.fileData[0] == null) {
        for (let i = 0; i < filesAmount; i++) {
          this.fileData.push(event.target.files[0]);
          var reader = new FileReader();
          reader.onload = (event: any) => {
            this.images.push(event.target.result);
            this.images.sort((img1, img2) =>
              img1.length > img2.length ? 1 : -1
            );
          };
          reader.readAsDataURL(event.target.files[i]);
          this.arrayfile.splice(
            Object.keys(this.fileData[0]).length,
            0,
            event.target.files[i]
          );
          this.arrayfile.sort((fileA, fileB) =>
            fileA.size > fileB.size ? 1 : -1
          );
        }
        this.arrayfile = this.fileData.filter((item) => item);
      } else {
        this.arrayfile = this.fileData[0];
        var orientation = -1;
        for (let i = 0; i < filesAmount; i++) {
          var reader = new FileReader();

          reader.onload = (event: any) => {
            // console.log("image", event.target.result)
            if (
              event.target.result.split(';')[0] == 'data:video/mp4' ||
              event.target.result.split(';')[0] == 'data:video/avi'
            ) {
              this.temp_images.push({
                data: 'video',
                src: event.target.result,
              });
              this.images.push(event.target.result);
            } else {
              this.temp_images.push({ data: 'img', src: event.target.result });
              this.imageCompress
                .compressFile(event.target.result, orientation, 75, 50)
                .then((result) => {
                  console.warn(
                    'Size in bytes is now:',
                    this.imageCompress.byteCount(result)
                  );
                  this.images.push(result);
                });
            }
            this.images.sort((img1, img2) =>
              img1.length > img2.length ? 1 : -1
            );
          };
          reader.readAsDataURL(event.target.files[i]);
          this.arrayfile.splice(
            Object.keys(this.fileData[0]).length,
            0,
            event.target.files[i]
          );
          this.arrayfile.sort((fileA, fileB) =>
            fileA.size > fileB.size ? 1 : -1
          );
        }
      }
    }
  }

  openByButton(event: any): void {
    var filesAmount = event.target.files.length;
    this.arrayfile = this.fileData[0];
    var orientation = -1;
    for (let i = 0; i < filesAmount; i++) {
      var reader = new FileReader();

      reader.onload = (event: any) => {
        if (
          event.target.result.split(';')[0] == 'data:video/mp4' ||
          event.target.result.split(';')[0] == 'data:video/avi'
        ) {
          this.temp_images.push({ data: 'video', src: event.target.result });
          this.images.push(event.target.result);
        } else {
          this.temp_images.push({ data: 'img', src: event.target.result });
          this.imageCompress
            .compressFile(event.target.result, orientation, 75, 50)
            .then((result) => {
              console.warn(
                'Size in bytes is now:',
                this.imageCompress.byteCount(result)
              );
              this.images.push(result);
            });
        }
        this.images.sort((img1, img2) => (img1.length > img2.length ? 1 : -1));
      };
      reader.readAsDataURL(event.target.files[i]);
      this.arrayfile.splice(
        Object.keys(this.fileData[0]).length,
        0,
        event.target.files[i]
      );
      this.arrayfile.sort((fileA, fileB) => (fileA.size > fileB.size ? 1 : -1));
    }
  }

  trackByFn(index, item) {
    return item.id;
  }
}

// URL Detector
function linkify(inputText) {
  var replacedText, replacePattern1, replacePattern2, replacePattern3;

  //URLs starting with http://, https://, or ftp://
  replacePattern1 =
    /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
  replacedText = inputText.replace(
    replacePattern1,
    '<a href="$1" target="_blank">$1</a>'
  );

  //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
  replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
  replacedText = replacedText.replace(
    replacePattern2,
    '$1<a href="http://$2" target="_blank">$2</a>'
  );

  //Change email addresses to mailto:: links.
  replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
  replacedText = replacedText.replace(
    replacePattern3,
    '<a href="mailto:$1">$1</a>'
  );

  return replacedText;
}
