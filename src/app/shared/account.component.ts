import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';

@Component({
    selector: 'account',
    templateUrl: './account.component.html',
    styleUrls: ['../../assets/sass/app.component.sass']
})

export class AccountComponent {

    userData = {};

    constructor(private route: ActivatedRoute,
        private location: Location) {

            this.userData = JSON.parse(localStorage.getItem('currentUser'));
            
         }

}
