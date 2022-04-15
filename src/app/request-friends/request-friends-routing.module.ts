import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RequestFriendsComponent } from './request-friends.component';


const routes: Routes = [
  {
    path: '',
    component: RequestFriendsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RequestFriendsRoutingModule { }
