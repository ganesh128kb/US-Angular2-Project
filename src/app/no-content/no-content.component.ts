import { Component } from '@angular/core';
import { Globals } from '../shared/globalVariables';

@Component({
	selector: 'no-content',
  styleUrls: ['../../assets/sass/app.component.sass'],
	template: `
    <div class="text-center">
    <div class="text-center margin-top-3 brand-color">
      <i class="fa fa-music fa-5x"></i>
      <i class="fa fa-music fa-4x"></i>
      <i class="fa fa-music fa-3x"></i>
      <i class="fa fa-music fa-2x"></i>
      <i class="fa fa-music fa-lg"></i>
    </div>
      <h1 class="text-center margin-top-2">404: page missing or data error</h1>
      <div class="text-center margin-top-2 brand-color">{{ globals.apolloError }}</div>
      <div class="margin-top-2 margin-bottom">Either this page is missing, or the data requested does not exist. Please clear all custom filters before proceeding and try again.<br/>If the error persists, please contact us to report a bug.</div>
      <button type="button" class="margin-top-3 btn umg__button--submit">Report Bug</button>
    </div>
  `
})
export class NoContentComponent {

	constructor(private globals: Globals) {

	}
}
