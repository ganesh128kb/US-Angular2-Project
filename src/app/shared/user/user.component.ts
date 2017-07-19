import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthGuard } from './authguard.service';
import { AuthService } from './auth.service';

import { Globals } from '../../shared/globalVariables';

@Component({
    templateUrl: './user.component.html',
    styleUrls: ['../../../assets/sass/app.component.sass]']
})

export class UserComponent implements OnInit {

    model: any = {};
    loading = false;
    currentUser: any;
    returnUrl: string;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        private globals: Globals
	) {

        this.authService.loggedIn = !!localStorage.getItem('currentUser');

        if (this.authService.loggedIn) {
			this.router.navigate(['/bestsellers/artists']);
        } else {
			this.router.navigate(['/login']);
        }
	}

    ngOnInit() {
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }
    login() {
		this.loading = true;
		this.authService.login(this.model.username)
			.subscribe(
			data => {
        console.log("user logged in srikanth");
				if (this.authService.userData != null && this.authService.userData['internalInfo'] != null && this.authService.userData['internalInfo']['defaultLabel'] != null && this.authService.userData['internal']) {
					this.router.navigate(['/bestsellers/artists'], {
            queryParams: { label: this.authService.userData['internalInfo']['defaultLabel']['id'],
            labelType: this.authService.userData['internalInfo']['defaultLabel']['type'],
            territory: this.authService.userData['defaultTerritory']['id']} });
				} else if (this.authService.userData != null && this.authService.userData['externalInfo'] && this.authService.userData['externalInfo']['defaultLabel'] != null && this.authService.userData['externalInfo']['defaultLabel']) {
					this.router.navigate(['/bestsellers/artists'], { queryParams: { label: this.authService.userData['externalInfo']['defaultLabel']['id'],
          labelType: this.authService.userData['externalInfo']['defaultLabel']['type'],
          territory: this.authService.userData['defaultTerritory']['id']} });
				} else if (this.authService.userData != null && this.authService.userData['defaultTerritory'] != null) {
          this.router.navigate(['/bestsellers/artists'], { queryParams: { territory: this.authService.userData['defaultTerritory']['id']} });
				} else {
          this.router.navigate(['/bestsellers/artists']);
        }
			},
			error => {
				//  this.alertService.error(error);
				this.loading = false;
			},
			() => {
				console.log('User Data', this.authService.userData);
			}
    );
	}
}
