/*
 * Angular 2 decorators and services
 */
import {
	Component,
	OnInit,
	ViewEncapsulation
} from '@angular/core';

import {
	Router
} from '@angular/router';

import { AppState } from './app.service';

import { Globals } from './shared/globalVariables';

@Component({
	selector: 'app',
	encapsulation: ViewEncapsulation.None,
	styleUrls: [
		'../assets/sass/app.component.sass'
	],
	templateUrl: './app.component.html'
})

export class AppComponent implements OnInit {

	// public isMobile: any;
	public mobile: boolean;

	constructor(
		public appState: AppState,
		public router: Router,
		public globals: Globals
	) {

		var isMobile = {
			Android: function() {
				// console.log('Android', navigator.userAgent.match(/Android/i));
				return navigator.userAgent.match(/Android/i);
			},
			iOS: function() {
				// console.log('iOS', navigator.userAgent.match(/iPhone|iPad|iPod/i));
				return navigator.userAgent.match(/iPhone|iPad|iPod/i);
			},
			BlackBerry: function() {
				// console.log('BlackBerry', navigator.userAgent.match(/BlackBerry/i));
				return navigator.userAgent.match(/BlackBerry/i);
			},
			Opera: function() {
				// console.log('Opera', navigator.userAgent.match(/Opera Mini/i));
				return navigator.userAgent.match(/Opera Mini/i);
			},
			Windows: function() {
				// console.log('Windows', navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i));
				return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
			},
			any: function() {
				return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
			}
		};

		var mobile: boolean;

		if (!isMobile.any()) {
			// console.log("not mobile");
			this.mobile = false;
			this.globals.isMobile = this.mobile;
		}

		if (isMobile.any()){
			// console.log("mobile");
			this.mobile = true;
			this.globals.isMobile = this.mobile;
		}

		// console.log('mobile', isMobile.any());
	}

	public ngOnInit() {
		// console.log('Initial App State', this.appState.state);

	}

}
