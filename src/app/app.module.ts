import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ImageCropperModule } from 'ngx-image-cropper';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { NgImageSliderModule } from 'ng-image-slider';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AuthInterceptor } from './auth.interceptor';
import { LoginComponent } from './login/login.component';
import { SigninComponent } from './signin/signin.component';
import { ForgetComponent } from './forget/forget.component';
import { AuthComponent } from './auth/auth.component';
import { ResetComponent } from './reset/reset.component';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { SearchComponent } from './search/search.component';
import { PhotosComponent } from './photos/photos.component';
import { FriendsComponent } from './friends/friends.component';
import { OverviewComponent } from './overview/overview.component';
import { RequestFriendsComponent } from './request-friends/request-friends.component';
import { PeopleKnowComponent } from './people-know/people-know.component';
import { NgxGalleryModule } from 'ngx-gallery-9';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { VideosComponent } from './videos/videos.component';
import { TimeagoModule } from 'ngx-timeago';
import { NotificationsComponent } from './notifications/notifications.component';
// Emoji
import { PickerModule } from '@ctrl/ngx-emoji-mart';
// toast message
import { ToastrModule } from 'ngx-toastr';
import { AccountSettingComponent } from './account-setting/account-setting.component';
import { ThemeComponent } from './theme/theme.component';
import { SecurityComponent } from './security/security.component';
import { AccountComponent } from './account/account.component';

// Themes
import { ThemeModule } from '../theme/theme.module';
import { lightTheme } from '../theme/light-theme';
import { darkTheme } from '../theme/dark-theme';
import { CookieModule } from 'ngx-cookie';
import { CookieService } from 'ngx-cookie-service';

//Lazy loader
import {
  LazyLoadImageModule,
  LAZYLOAD_IMAGE_HOOKS,
  ScrollHooks,
} from 'ng-lazyload-image';
import { NguiInComponent } from './ngui-in/ngui-in.component';
import { ChatingComponent } from './chating/chating.component';
import { SocketioService } from './socketio.service';
import { BnNgIdleService } from 'bn-ng-idle'; // import bn-ng-idle service
//socketio
import { ConnectionServiceModule } from 'ng-connection-service';

import { NgIdleKeepaliveModule } from '@ng-idle/keepalive'; // this includes the core NgIdleModule but includes keepalive providers for easy wireup
import { MomentModule } from 'angular2-moment'; // optional, provides moment-style pipes for date formatting
import { ModalModule } from 'ngx-bootstrap/modal';
//ng-push-notification
import { PushNotificationsModule } from 'ng-push-ivy';
import { NgxImageCompressService } from 'ngx-image-compress';
import { ClickOutsideModule } from 'ng-click-outside';
// import { ClickOutsideModule } from 'ng2-click-outside';
//ngx-spinner
import { NgxSpinnerModule } from 'ngx-spinner';
import { UpdateModalComponent } from './update-modal/update-modal.component';
//post-image grid package
import { NgxMasonryModule } from 'ngx-masonry';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';

// social-share
import { ShareButtonsModule } from 'ngx-sharebuttons/buttons';
import { ShareIconsModule } from 'ngx-sharebuttons/icons';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SigninComponent,
    ForgetComponent,
    AuthComponent,
    ResetComponent,
    HomeComponent,
    HeaderComponent,
    SearchComponent,
    PhotosComponent,
    FriendsComponent,
    OverviewComponent,
    RequestFriendsComponent,
    PeopleKnowComponent,
    VideosComponent,
    NotificationsComponent,
    AccountSettingComponent,
    ThemeComponent,
    SecurityComponent,
    AccountComponent,
    NguiInComponent,
    ChatingComponent,
    UpdateModalComponent,
    // TimeAgoPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatDialogModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    ImageCropperModule,
    AutocompleteLibModule,
    NgImageSliderModule,
    NgxGalleryModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatNativeDateModule,
    MatInputModule,
    TimeagoModule.forRoot(),
    PickerModule,
    ToastrModule.forRoot(),
    ThemeModule.forRoot({
      themes: [lightTheme, darkTheme],
      active: 'light',
    }),
    ConnectionServiceModule,
    CookieModule.forRoot(),
    LazyLoadImageModule,
    NgIdleKeepaliveModule.forRoot(),
    MomentModule,
    ModalModule.forRoot(),
    PushNotificationsModule,
    NgxSpinnerModule,
    ClickOutsideModule,
    NgxMasonryModule,
    // ShareButtonsModule,
    // ShareIconsModule,
  ],

  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: LAZYLOAD_IMAGE_HOOKS,
      useClass: ScrollHooks,
    },
    CookieService,
    SocketioService,
    BnNgIdleService,
    NgxImageCompressService,
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
    JwtHelperService,
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
