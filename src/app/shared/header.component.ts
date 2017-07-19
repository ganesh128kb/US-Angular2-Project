//Angular2 Specific
import { Component, trigger, state, style, transition, animate, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { RouterModule, Routes, Router } from '@angular/router';

//Components
import { FilterComponent } from './filter.component';
import { SearchComponent } from './search.component';

import { Globals } from './globalVariables';

//Service
import { FilterService } from './filter.service';
import { AuthService } from './user/auth.service';
import { BestSellerService } from '../bestsellers/bestsellers.service';

import { NgbModule, NgbDatepickerConfig, NgbDateStruct, ModalDismissReasons, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'header-nav',
	templateUrl: './header.component.html',
	styleUrls: ['../../assets/sass/header.component.sass']
})

export class HeaderComponent {

	constructor(private router: Router,
		private location: Location,
		private fs: FilterService,
		private authService: AuthService,
		private bestSellers: BestSellerService,
	private globals: Globals,
private modalService: NgbModal) { }

		public toggle: boolean;
		public toggleMobile: boolean;
		public isCollapsed: boolean = true;
		    closeResult: string;

		public mobileFilters: any;

		@Output() OpenModal = new EventEmitter();

	onToggleFilters() {
		this.toggle = !this.toggle;
	}

	onToggleMobile() {
		this.OpenModal.emit();
	}

	private getDismissReason(reason: any): string {
			if (reason === ModalDismissReasons.ESC) {
					return 'by pressing ESC';
			} else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
					return 'by clicking on a backdrop';
			} else {
					return `with: ${reason}`;
			}
	}

	navigateTo(dest:string){
        let test = this.location.path().split('?')[1];
        let query = dest+'?'+test;
        if(test != undefined){
            this.router.navigateByUrl(query);
        }else{
            this.router.navigateByUrl(dest);
        }

    }

	public collapsed(event:any):void {
	// console.log(event);
	}

	public expanded(event:any):void {
	// console.log(event);
	}
}
