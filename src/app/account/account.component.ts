import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AccountComponent implements OnInit {
  id: any;

  @ViewChild('nameText') nameTextElement: any;
  constructor(
  ) {
  }
  ngOnInit(): void {
  }


}
