import { Injectable, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { URLSearchParams } from '@angular/http';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Injectable()

export class GlobalService implements OnInit{

	baseUrl;

	public clearAllToggle: boolean;
	paramsUrlString: string;
	filterDateShow: boolean = false;
	activeParams = {
		genre: [],
		partner: [],
		label: [],
		territory: [],
		start:[],
		end: []
	};

	constructor(private activatedRoute: ActivatedRoute,
				private router: Router,
				private location: Location,
				private modalRef: NgbModalRef){}

	ngOnInit(): void {
		
	}

	paramsUrl(): string{
		let params = new URLSearchParams();
		for(let param in this.activeParams){
			const valueArray = this.activeParams[param];
			for(let i in valueArray){
				params.append(param, valueArray[i].filterCode);
			}
		}
		this.clearAllToggle = true;
		this.paramsUrlString = params.toString();
		return this.baseUrl+'?'+params.toString();
	}

	

}