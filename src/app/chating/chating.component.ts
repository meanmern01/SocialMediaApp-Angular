import { ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { SocketioService } from '../socketio.service';
import {io} from 'socket.io-client';
//  import { environment } from 'src/environments/environment';
import { AuthService } from '../auth.service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import Pusher from 'pusher-js'
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment.prod';
import * as CryptoJS from 'crypto-js';
import { PushNotificationsService } from 'ng-push-ivy';

declare var $: any;
@Component({
  selector: 'app-chating',
  templateUrl: './chating.component.html',
  styleUrls: ['./chating.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ChatingComponent implements OnInit {
  
  socket;
  message: string;
  type: string;
  id: any;
  datas: any;
  name: any;
  showView: boolean = true;
  recieverId: any;
  mergeId: any;
  chat_messages: any = [];
  frdDetails = [];
  usersOnline: any
  ids: any
  users = []
  sessionDesc: any
  currentcaller: any
  room: any
  caller: any
  localUserMedia;
  channel: any;
  check_user: any;
  temp_name: any;
  current_user_id: any;
  chat_userId: any;
  chat_user: any;
  key: any;
  value: any;
  temp_member: any[] = []
  check_msg: any[] = []
  status: any;
  msg_status: boolean;
  msg_typing: String;

  @ViewChildren('messages') messages: QueryList<any>;
  @ViewChild('content') content: ElementRef;
  private pusherClient: Pusher;
  video: HTMLVideoElement;
  constructor(private socketService: SocketioService, public authService: AuthService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public toastr: ToastrService, private _pushNotifications: PushNotificationsService, private cdref: ChangeDetectorRef) {
    this.key = environment.key
      Pusher.logToConsole = true;
    this.pusherClient = new Pusher('91455e0618617fd0e25d',
      {
        cluster: 'ap2',
        authEndpoint: `${environment.apiUrl}/pusher/auth`
      })
      
    // video calling
    const current_login_User = JSON.parse(localStorage.getItem('currentUser'));
    this.current_user_id = current_login_User.data._id
    this.activatedRoute.queryParamMap.subscribe((params: ParamMap) => {
      this.chat_userId = params.get('userId');                    
      this.chat_user = params.get('user')
      if (this.chat_userId !== null && this.chat_user !== null) {
        this.openChat(this.chat_userId, this.chat_user);
      }
    });
    this.channel = this.pusherClient.subscribe("presence-videocall");
    this.router.navigate([], {
      queryParams: {
        'userId': null,
        'user': null,
      },
      queryParamsHandling: 'merge'
    })

    this.channel.bind("pusher:subscription_succeeded", members => {
      //set the member count
      this.usersOnline = members.count;
      this.id = this.current_user_id;
      this.render();
    });

    // User id changes
    this.check_msg = []
    this.channel.bind("client-static", (data:any) => {
      this.check_msg.push(data)
    })

    //end

    this.channel.bind("pusher:member_added", member => {
      // this.users.push(member.id);
      this.render();
    });

    this.channel.bind("pusher:member_removed", member => {
      // for remove member from list:
      
      if (this.users == this.room) {
        this.endCall();
      }
      this.render();
    });

    this.channel.bind("client-candidate", (msg) => {
      if (msg.room == this.room) {
          console.log("candidate received");
          this.caller.addIceCandidate(new RTCIceCandidate(msg.candidate));
      }
    });
    
    this.channel.bind("client-sdp", (msg) => {
      if(msg.room == this.id){
          var answer = confirm("You have a call from: "+ msg.name + " Would you like to answer?");
          if(!answer){
              return this.channel.trigger("client-reject", {"room": msg.room, "rejected":this.id, "name": msg.name});
        }
        if (answer) {
          $("#myModal").modal('show', {
            backdrop: 'static',
            keyboard: false
          });
        }
          this.room = msg.room;
          this.getCam()
          .then(stream => {
              this.localUserMedia = stream;
            this.toggleEndCallButton();
            var myImgsrc3: any = document.getElementById("selfview") as HTMLImageElement;
              if (window.URL) {
                // myImgsrc3.src = window.URL.createObjectURL(stream);
                myImgsrc3.src = window.URL.createObjectURL(this.localUserMedia);
              } else {
                myImgsrc3.src = stream;
              }
              this.caller.addStream(stream);
              var sessionDesc = new RTCSessionDescription(msg.sdp);
              this.caller.setRemoteDescription(sessionDesc);
              this.caller.createAnswer().then((sdp) => {
                  this.caller.setLocalDescription(new RTCSessionDescription(sdp));
                  this.channel.trigger("client-answer", {
                      "sdp": sdp,
                      "room": this.room
                  });
              });
          })
          .catch(error => {
              console.log('an error occured', error);
          })
      }
  });
  this.channel.bind("client-answer", (answer) => {
    if (answer.room == this.room) {
      console.log("answer received");
      this.caller.setRemoteDescription(new RTCSessionDescription(answer.sdp));
    }
  });
  
  this.channel.bind("client-reject", (answer) => {
    if (answer.room == this.room) {
      console.log("Call declined");
      alert("call to " + answer.name + " was politely declined");
      this.endCall();
    }
  });
    
    this.channel.bind("client-endcall", answer => {
      console.log("answer end call", answer)
      if (answer.room == this.room) {
        alert("Call is ended")
        this.endCall();
        $("#myModal").modal('hide');
      }
    })

    //To iron over browser implementation anomalies like prefixes
  this.GetRTCPeerConnection();
  this.GetRTCSessionDescription();
  this.GetRTCIceCandidate();
  //prepare the caller to use peerconnection
  this.prepareCaller();

    this.socket = io(environment.apiUrl);
    
    this.socket.on("notifyTyping", data => {
      if (data) {
        const typing = document.getElementById("typing");
        typing.innerText = data.user + " " + data.message;
        this.type = data.user + " " + data.message;
      }
    });
    
      this.authService.getProfileforAbout(this.current_user_id).subscribe(res => {
        this.datas = res.data;
        this.name = res.data.name
      })

    this.authService.getFriends(this.current_user_id).subscribe(res => {
      if(res.success)
      {
        for(let i = 0; i < res.userInfo.length; i++){
          this.frdDetails.push(res.userInfo[i])
        }
      }
    })

    //show message
    
  }

  ngOnInit(): void {
    this.setupSocketConnection();
    this.cdref.detectChanges();
      this.scrollToBottom();
      this.messages.changes.subscribe(this.scrollToBottom);
  }

  // ngAfterViewInit() {
  //   // setTimeout(() => {
  //     this.cdref.detectChanges();
  //     this.scrollToBottom();
  //     this.messages.changes.subscribe(this.scrollToBottom);
  //   // }, 1000)
  // }

  // ngAfterContentChecked() {
  //   // setTimeout(() => {
  //     this.cdref.detectChanges();
  //     this.scrollToBottom();
  //     this.messages.changes.subscribe(this.scrollToBottom);
  //   // }, 1000)
  // }

  // video calling

  render() {
    this.check_user = this.users[0]
  }

  
  GetRTCIceCandidate() {
    window.RTCIceCandidate =
      window.RTCIceCandidate
  
    return window.RTCIceCandidate;
  }
  
  GetRTCPeerConnection() {
    window.RTCPeerConnection =
      window.RTCPeerConnection 
    return window.RTCPeerConnection;
  }
  
  GetRTCSessionDescription() {
    window.RTCSessionDescription =
      window.RTCSessionDescription 
    return window.RTCSessionDescription;
  }
  prepareCaller() {
    //Initializing a peer connection
    this.caller = new window.RTCPeerConnection();
    //Listen for ICE Candidates and send them to remote peers
    this.caller.onicecandidate = (evt) => {
      if (!evt.candidate) return;
      console.log("onicecandidate called");
      this.onIceCandidate(this.caller, evt);
    };
    //onaddstream handler to receive remote feed and show in remoteview video element
    console.log("call")
    this.caller.onaddstream = (evt) => {
      console.log("onaddstream called");
      var myImgsrc =  <HTMLVideoElement>(document.querySelector("#remoteview"));
      if (window.URL) {
        myImgsrc.srcObject = evt.stream;
      } else {
        myImgsrc.srcObject = evt.stream;
      }
    };
  }

  onIceCandidate(peer, evt) {
    if (evt.candidate) {
        this.channel.trigger("client-candidate", {
            "candidate": evt.candidate,
            "room": this.room
        });
    }
  }
  
  getCam() {
    return navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
  }

  Audio_Change(i: number) {
    if (i == 0) {
      $("#audio_off").css("display", "block")
      $("#audio_on").css("display", "none")
      this.localUserMedia.getAudioTracks()[0].enabled = !(this.localUserMedia.getAudioTracks()[0].enabled);
    } else {
      $("#audio_off").css("display", "none")
      $("#audio_on").css("display", "block")
      this.localUserMedia.getAudioTracks()[0].enabled = !(this.localUserMedia.getAudioTracks()[0].enabled);
    }
  }

  Video_Change(i: number) {
    if (i == 0) {
      $("#video_off").css("display", "block")
      $("#video_on").css("display", "none")
      this.localUserMedia.getVideoTracks()[0].enabled = !(this.localUserMedia.getVideoTracks()[0].enabled);
    } else {
      $("#video_off").css("display", "none")
      $("#video_on").css("display", "block")
      this.localUserMedia.getVideoTracks()[0].enabled = !(this.localUserMedia.getVideoTracks()[0].enabled);
    }
  }
  //Create and send offer to remote peer on button click
  callUser(user) {
    console.log("call", user)
    this.getCam()
      .then(stream => {
        this.video = <HTMLVideoElement>(document.querySelector("#selfview"));
        if (window.URL) {
          this.video.srcObject = stream;
        } else {
          this.video.srcObject = stream;
        }
        this.toggleEndCallButton();
        this.caller.addStream(stream);
        this.localUserMedia = stream;
        this.caller.createOffer().then((desc) => {
          this.caller.setLocalDescription(new RTCSessionDescription(desc));
          this.channel.trigger("client-sdp", {
            sdp: desc,
            room: user,
            from: this.id,
            name: this.name
          });
          this.room = user;
        });
      })
      .catch((err) => {
        //log to console first 
        if (err.name == "NotFoundError" || err.name == "DevicesNotFoundError") {
            //required track is missing 
            this.toastr.info('Device is not found. Please check your mic and webcam is connected properly.')
        } else if (err.name == "NotReadableError" || err.name == "TrackStartError") {
            //webcam or mic are already in use 
          this.toastr.info('Your webcam or mic are already used in other application. Please turn off there.')
        } else if (err.name == "OverconstrainedError" || err.name == "ConstraintNotSatisfiedError") {
            //constraints can not be satisfied by avb. devices 
          this.toastr.info('Your device is not meet with our criteria.')
        } else if (err.name == "NotAllowedError" || err.name == "PermissionDeniedError") {
            //permission denied in browser 
          this.toastr.info('Permission is denied by browser. Please allow to access mic or webcam.')
        } else if (err.name == "TypeError" || err.name == "TypeError") {
            //empty constraints object 
          this.toastr.info('Please allow any one to access mic or webcam.')
        } else {
            //other errors 
          this.toastr.info('We having problem with connecting your device. Please check your device is connected properly or check that your device is not running in another application.')
        }
    });
  }
  toggleEndCallButton() {
    if (document.getElementById("endCall").style.display == "block") {
      document.getElementById("endCall").style.display = "none";
    } else {
      document.getElementById("endCall").style.display = "block";
    }
  }
  endCall() {
    this.room = undefined;
    this.caller.close();
    for (let track of this.localUserMedia.getTracks()) {
      track.stop();
    }
    this.prepareCaller();
    this.toggleEndCallButton();
  }

  endCurrentCall() {
    this.channel.trigger("client-endcall", {
      room: this.room,
      name: this.temp_name
    });
    this.endCall();
  }

  scrollToBottom = () => {
    try {
      this.content.nativeElement.scrollTop = this.content.nativeElement.scrollHeight;
    } catch (err) {}
  }

  setupSocketConnection() {
    // this.socket.emit('login', {userId: this.current_user_id})
      let messageInput = document.getElementById("message");
      let typing = document.getElementById("typing");
    this.socket.on('my broadcast', (data: string) => {
      console.log("data", data)
       let value = [this.current_user_id, this.recieverId]
       value.sort((a, b) => b.localeCompare(a))
       this.mergeId = value.join()
      this.authService.showMsg(this.mergeId).subscribe(res => {
      if (res['success']) {
          this.chat_messages = res.userData
          for (let i = 0; i < res.userData.length; i++){
            this.value = this.Decrypt_chat(res.userData[i].message)
            this.chat_messages[i].message = this.value
          }
          this.authService.getUserProfile(this.current_user_id).subscribe(res => {
            if (res.data.chatStatus == 1) {
              setTimeout(() => {
                this.refreshChat(this.current_user_id, this.recieverId)
              }, 1500)
              }
            })
          }
        })
    });

    this.authService.showstatusMsg().subscribe(res => {
      var msg = 0
      setTimeout(() => {
        this.frdDetails.forEach((item, index) => {
          for (var i = 0; i < res.data.length; i++) {
            if (item._id == res.data[i].senderID) {
              msg += 1;
              item.msg = msg
            }
          }
        })
      }, 1500)
    })

    
    // if (messageInput) {
    //   messageInput.addEventListener('keypress', () => {
    //     console.log("call")
    //     this.socket.emit("typing", { user: this.name, message: "is typing..." });
    //   });
    // }
    this.socket.on("notifyTyping", data => {
        console.log("data", data)
        typing.innerText = data.user + " " + data.message;
        this.type = data.user + " " + data.message;
      });
      
      //stop typing
    if (messageInput) {
      messageInput.addEventListener("keyup", () => {
        this.socket.emit("stopTyping", "");
      });
    }
      this.socket.on("notifyStopTyping", () => {
        typing.innerText = "";
      });
    
    this.socket.on('notifyStart', (data) => {
      console.log("data", data)
      if (data.recieverId == this.current_user_id) {
        this.msg_status = true
        this.msg_typing = data.user + ' is typing....'
      }
    })

    this.socket.on('notifyStop', (data) => {
      console.log("call")
      if (data.recieverId == this.current_user_id) {
        this.msg_status = false
      }
    })
  }

  NotifyMessage(message, e) {
    var data = { user: String, id: Number, recieverId: Number };
    data.user = this.name
    data.id = this.current_user_id
    data.recieverId = this.recieverId
    this.socket.emit("typing", data);
    var lastTypingTime = (new Date()).getTime();
    setTimeout(() => {
      var typingTimer = (new Date()).getTime();
      var timeDiff = typingTimer - lastTypingTime;
      if (timeDiff >= 500) {
          this.socket.emit("notifyStop", data);
      }
  }, 500);
  }

  SendMessage() {
    if (this.message !== '') {
      this.socket.emit('my message', this.message);
      var push_data: any = { 'msg': this.message, 'user': this.recieverId, 'name': this.name, 'sender': this.current_user_id }
      this.socket.emit('push_data', push_data)
    const element = document.createElement('li');
    let value = [this.current_user_id, this.recieverId]
    value.sort((a, b) => b.localeCompare(a))
      this.mergeId = value.join()
      
      if (this.message !== undefined) {
        // crypto encrypted
        var key = CryptoJS.enc.Utf8.parse(this.key);
        var iv = CryptoJS.enc.Utf8.parse(this.key);
        var encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(this.message.toString()), key,
        {
          keySize: 128 / 8,
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
          });
        // end
        this.authService.getFriends(this.current_user_id).subscribe(res => {
          if (res.success) {
            for (let i = 0; i < res.userInfo.length; i++) {
              if (res.userInfo[i]._id == this.recieverId) {
                    if (res.userInfo[i].chatStatus == 1) {
                      this.status = 1
                      this.authService.insertMsg(encrypted.toString(), this.name, this.current_user_id, this.recieverId, this.mergeId, this.status).subscribe(res => {
                        this.openChat(this.recieverId, this.name)
                      })
                    } else {
                      this.status = 0
                      this.authService.insertMsg(encrypted.toString(), this.name, this.current_user_id, this.recieverId, this.mergeId, this.status).subscribe(res => {
                        this.openChat(this.recieverId, this.name)
                      })
                    }
                  }
            }
          }
        })
        
    } else {
      this.toastr.info("Please write something in message field.")
      }
    
    this.authService.showMsg(this.mergeId).subscribe(res => {
      if (res['success']) {
        this.chat_messages = res.userData
        for (let i = 0; i < res.userData.length; i++){
          this.value = this.Decrypt_chat(res.userData[i].message)
          this.chat_messages[i].message = this.value
        }
      }
    })
    
      this.message = '';
    } else {
      this.toastr.info("Please write something in message field.")
    }
    
  }
  
  Decrypt_chat(value) {
    var key = CryptoJS.enc.Utf8.parse(this.key);
        var iv = CryptoJS.enc.Utf8.parse(this.key);
    var decrypted = CryptoJS.AES.decrypt(value.toString(), key, {
          keySize: 128 / 8,
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
  view_chat_list() {
    this.showView = true
    $(".left").removeClass("mobile_view");
    $(".viewProfile").addClass("mobile_view");
    $('.chat_panel').css('background', '#c3c3c3');
  }

  openChat(id, name) {
    $(".left").addClass("mobile_view");
    $('.chat_panel').css('background', '#c3c3c3');
    $(`.main_${id}`).css('background', '#FFFFFF');
    const current_login_User = JSON.parse(localStorage.getItem('currentUser'));
    this.current_user_id = current_login_User.data._id
    this.temp_name = name
    this.recieverId = id
    this.showView = false;
    let value = [this.current_user_id, this.recieverId]
    value.sort((a, b) => b.localeCompare(a))
    this.mergeId = value.join()
    this.authService.showMsg(this.mergeId).subscribe(res => {
      if (res['success']) {
        
        this.chat_messages = res.userData
        for (let i = 0; i < res.userData.length; i++){
          if (res.userData[i].status == 0 && this.current_user_id == res.userData[i].recieverID) {
            this.authService.updateMsg(res.userData[i]._id).subscribe(res => { })
          }
          this.value = this.Decrypt_chat(res.userData[i].message)
          this.chat_messages[i].message = this.value
        }
      }
    })

    this.frdDetails.forEach((item, index) => {
        if (item._id == this.recieverId) {
          item.msg = 0;
        }
    })
    // this.setupSocketConnection()
    
    setTimeout(() => {
      this.channel.trigger("client-static", {
        "id": this.current_user_id,
        "rec_id": id
      })
      this.users.push(id ? id : this.chat_userId);
      if (this.users.length >= 2) {
        var index = this.users.indexOf(this.users[0]);
        this.users.splice(index, 1);
      }
      this.render();
    }, 2000);
    if (this.chat_userId == id && this.chat_user == name) {    
      setTimeout(() => {
        $(`.main_${id}`).css('background', '#FFFFFF');
      }, 2000);
    }
  }
  
  refreshChat(id, recieve) {
    this.current_user_id = id
    this.recieverId = recieve
    let value = [this.current_user_id, this.recieverId]
    value.sort((a, b) => b.localeCompare(a))
    this.mergeId = value.join()
    this.authService.showMsg(this.mergeId).subscribe(res => {
      if (res['success']) {
        this.chat_messages = res.userData
        for (let i = 0; i < res.userData.length; i++){
          this.value = this.Decrypt_chat(res.userData[i].message)
          this.chat_messages[i].message = this.value
        }
      }
    })
  } 
}
