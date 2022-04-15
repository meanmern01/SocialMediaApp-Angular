import { Component, OnInit, Inject, ViewChild, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from  '@angular/material/dialog';
import { AuthService } from '../auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { finalize } from 'rxjs/operators';
import {NgxImageCompressService} from 'ngx-image-compress';
import { element } from 'protractor';
declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-update-modal',
  templateUrl: './update-modal.component.html',
  styleUrls: ['./update-modal.component.css']
})
export class UpdateModalComponent implements OnInit {
  name: any;
  smallProfile: any;
  twoimg: boolean = false;
  threeimg: boolean = false;
  fourimg: boolean = false;
  fiveimg: boolean = false;
  temp_images:any = [];
  status: any;
  desc: string;
  fileCovToReturn: Array<File> = [];
  images = [];
  arrayfile: any = [];
  token: string;

  constructor(
    private dialogRef:  MatDialogRef<UpdateModalComponent>,
    @Inject(MAT_DIALOG_DATA) public  data: any,
    public authService: AuthService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private imageCompress: NgxImageCompressService
  ) {
    this.authService.getProfileforAbout(data.id).subscribe(res => {
      this.name =  res.data.name
      this.smallProfile = res.data.profileImgURl
    })
    this.updateImage(data.img)
    this.status = data.status
    this.desc = data.desc
    this.postDataSet(data.img)
    // if (data.img.length > 0) {
    //   if(data.img.length === 2)
    //   {
    //     this.twoimg = true
    //     this.threeimg = false
    //     this.fourimg = false
    //     this.fiveimg = false
    //   }else if(data.img.length == 3){
    //     this.threeimg = true
    //     this.twoimg = false
    //     this.fourimg = false
    //     this.fiveimg = false
    //   }else if(data.img.length == 4){
    //     this.threeimg = false
    //     this.twoimg = false
    //     this.fourimg = true
    //     this.fiveimg = false
    //   }else if(data.img.length > 4){
    //     this.threeimg = false
    //     this.twoimg = false
    //     this.fourimg = false
    //     this.fiveimg = true
    //   }
    // }
    console.log("check data", data)
   }

  ngOnInit(): void {
  }

  public Close() {
    this.dialogRef.close();
  }

  cancel() {
    while(this.temp_images.length > 0) {
      this.temp_images.pop();
  }
    // while(this.data.file.length > 0) {
    //   this.data.file.pop();
    // }
    while(this.images.length > 0) {
      this.images.pop();
    }
    while(this.arrayfile.length > 0) {
      this.arrayfile.pop();
    }
    $(".set_view_more").css('display', 'none');
    this.toastr.info("All media are removed. Please select new ones")
  }

  openNewDialog(event: any): void {
    console.log("check event", event)
    if(event.target.files){
      var orientation = -1;
      for(var i = 0; i < event.target.files.length; i++){
        var reader = new FileReader();

        reader.onload = (event: any) => {
          if (event.target.result.split(';')[0] == 'data:video/mp4' || event.target.result.split(';')[0] == 'data:video/avi') {
            this.temp_images.push({data: 'video', src: event.target.result})
            this.images.push(event.target.result);
          } else {
            this.temp_images.push({data: 'img', src: event.target.result})
            this.imageCompress.compressFile(event.target.result, orientation, 75, 50).then(
              result => {
                console.warn('Size in bytes is now:', this.imageCompress.byteCount(result));
                this.images.push(result);
              });
            }
            this.images.sort((img1, img2) => img1.length > img2.length ? 1 : -1)
            this.postDataSet(this.temp_images)
        }
        reader.readAsDataURL(event.target.files[i]);
        this.arrayfile.splice(event.target.files.length, 0, event.target.files[i])
        this.arrayfile.sort((fileA, fileB) => fileA.size > fileB.size ? 1 : -1)
      }
      console.log("images", this.images, this.arrayfile)

    }
  }

  base64ToFile(data, filename) {
    const arr = data.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
 }

  postSave(){
    this.token = localStorage.getItem('token')
    if(this.images.length > 0){
      this.PostCheck(this.images).then((res) => {
        this.checkPng(res.new).then((status) => {
          console.log("res", res, this.arrayfile, status)
          if(status){
            this.toastr.info("png format is not supported used other format like jpg or jpeg")
          } else {
            this.spinner.show()
            for (let i = 0; i < this.arrayfile.length; i++){
              this.fileCovToReturn.push(this.base64ToFile(
                res.new[i],
                this.arrayfile[i].name,
              ))
              var reader = new FileReader();
              reader.readAsDataURL(this.fileCovToReturn[i]);
            }
            console.log("reader", reader)
            if(reader !== undefined){
              reader.onload = async(_event) => {
                let message = await linkify(this.desc)
                this.authService.updatePost(this.token, message, this.fileCovToReturn, this.status, res.exist, this.data.post_id).pipe(finalize(() => this.spinner.hide())).subscribe((res) => {
                  if(window.location.href.split('/')[3] == "home"){
                    window.location.replace('home/' + window.location.href.split('/')[4]);
                  } else {
                    window.location.replace('profile/' + window.location.href.split('/')[4]);
                  }
                })
              }
            } else {
              let message = linkify(this.desc)
              this.authService.updateWithoutPost(this.token, message, this.status, res.exist, this.data.post_id).pipe(finalize(() => this.spinner.hide())).subscribe((res) => {
                if(window.location.href.split('/')[3] == "home"){
                  window.location.replace('home/' + window.location.href.split('/')[4]);
                } else {
                  window.location.replace('profile/' + window.location.href.split('/')[4]);
                }
              })
            }
          }
        }).catch(err => console.error(err))
      }).catch(err => console.log(err))
    } else {
      if(this.desc == ''){
        this.toastr.info("You are not set description!");
      }else if(this.desc !== ''){
        let message = linkify(this.desc)
        this.authService.updatetextPost(this.token, message, this.status, this.data.post_id).subscribe((res) => {
          if(window.location.href.split('/')[3] == "home"){
            window.location.replace('home/' + window.location.href.split('/')[4]);
          }else{
            window.location.replace('profile/' + window.location.href.split('/')[4]);
          }
        })
      }
    }
  }

  async updateImage(value){
    await value.forEach(element => {
        if(element.image.split('.')[1] == 'mp4' || element.image.split('.')[1] == 'avi'){
          this.temp_images.push({data: 'video', src: element.image})
        } else {
          this.temp_images.push({data: 'img', src: element.image})
        }
        this.images.push(element.image)
    });
  }

  async postDataSet(data){
    console.log("data", data.length)
    if (data.length > 0) {
      if(data.length === 2)
      {
        this.twoimg = true
        this.threeimg = false
        this.fourimg = false
        this.fiveimg = false
      }else if(data.length == 3){
        this.threeimg = true
        this.twoimg = false
        this.fourimg = false
        this.fiveimg = false
      }else if(data.length == 4){
        this.threeimg = false
        this.twoimg = false
        this.fourimg = true
        this.fiveimg = false
      }else if(data.length > 4){
        this.threeimg = false
        this.twoimg = false
        this.fourimg = false
        this.fiveimg = true
      }
    }
  }

  async PostCheck(data){
    let value = { exist: [], new: [] }
    let check = await data.forEach(element => {
        if(element.includes('http')){
          value.exist.push(element)
        } else {
          value.new.push(element)
        }
    });
    console.log("check", check, value)
    return value;
  }

  async checkPng(data){
    var value = false
    await data.forEach(element => {
      if(element.includes("png")){
        console.log("call")
        value = true
      }
    });

    return value
  }

}

// URL Detector
function linkify(inputText) {
  var replacedText, replacePattern1, replacePattern2, replacePattern3;

  //URLs starting with http://, https://, or ftp://
  replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
  replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

  //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
  replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
  replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

  //Change email addresses to mailto:: links.
  replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
  replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

  return replacedText;
}
