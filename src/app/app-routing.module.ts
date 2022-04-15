import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule, CanActivate } from '@angular/router';
import { ForgetComponent } from './forget/forget.component';
import { ResetComponent } from './reset/reset.component';
import { AuthComponent } from './auth/auth.component';
import { HomeComponent } from './home/home.component';
import { SearchComponent } from './search/search.component';
import { PhotosComponent } from './photos/photos.component';
import { OverviewComponent } from './overview/overview.component';
import { FriendsComponent } from './friends/friends.component';
import { RequestFriendsComponent } from './request-friends/request-friends.component';
import { PeopleKnowComponent } from './people-know/people-know.component';

import { AuthGuard } from './auth.guard';
import { VideosComponent } from './videos/videos.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { AccountSettingComponent } from './account-setting/account-setting.component';
import { ThemeComponent } from './theme/theme.component';
import { SecurityComponent } from './security/security.component';
import { AccountComponent } from './account/account.component';
import { ChatingComponent } from './chating/chating.component';

const routes: Routes = [
  { path: '', component: AuthComponent },
  { path: 'forget', component: ForgetComponent },
  { path: 'photos', component: PhotosComponent },
  { path: 'videos', component: VideosComponent },
  { path: 'friends', component: FriendsComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: '', redirectTo: 'timeline', pathMatch: 'full' },
  { path: 'reset', component: ResetComponent },
  {
    path: 'friends/:id',
    component: RequestFriendsComponent,
    canActivate: [AuthGuard],
    // { path: 'friends/:id', loadChildren: () => import('./request-friends/request-friends.module').then(m => m.RequestFriendsModule), canActivate:[AuthGuard],
    children: [
      { path: 'photos', component: PhotosComponent },
      { path: 'videos', component: VideosComponent },
      { path: 'friends', component: FriendsComponent },
      { path: 'notifications', component: NotificationsComponent },
      // { path: '', redirectTo:'friends/:id', pathMatch:"full" }
    ],
  },
  // { path: 'home/:id', component: HomeComponent, canActivate:[AuthGuard]},
  {
    path: 'home/:id',
    loadChildren: () => import('./home/home.module').then((m) => m.HomeModule),
    canActivate: [AuthGuard],
  },
  { path: 'search/:id', component: SearchComponent, canActivate: [AuthGuard] },
  {
    path: 'peopleknow/:id',
    component: PeopleKnowComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'account/:id',
    component: AccountComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'account-setting', component: AccountSettingComponent },
      { path: 'security_and_login', component: SecurityComponent },
      { path: '', redirectTo: 'account-setting', pathMatch: 'full' },
    ],
  },
  { path: 'theme', component: ThemeComponent },
  { path: 'chating/:id', component: ChatingComponent },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, ReactiveFormsModule, RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
export const routingComponents = [ForgetComponent];
