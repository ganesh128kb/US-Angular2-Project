//Angular2 Specifics
import { Component, Input, Output, OnInit, Injectable, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { URLSearchParams } from '@angular/http';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { Observable, Operator, Subject } from 'rxjs/Rx';

//Libraries
import { NgbModule, NgbDatepickerConfig, NgbDateStruct, ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import * as _ from 'lodash';
import { chain } from 'lodash';

//Constants
import { Globals } from './globalVariables';
const now = new Date();

@Injectable()
export class FilterDatesService {

	//@Output() CloseModal = new EventEmitter();
	public radioModel: string;

	public model: NgbDateStruct;
	public date: { year: number, month: number };

	public mm: any;
	public years: number[] = [];
	public yy: number;
	public dateForm: any[] = [];
	public formValueWeek: any;
	public formValuePeriod: any;

	public months = [
			{ val: '01', name: 'January' },
			{ val: '02', name: 'February' },
			{ val: '03', name: 'March' },
			{ val: '04', name: 'April' },
			{ val: '05', name: 'May' },
			{ val: '06', name: 'June' },
			{ val: '07', name: 'July' },
			{ val: '08', name: 'August' },
			{ val: '09', name: 'September' },
			{ val: '10', name: 'October' },
			{ val: '11', name: 'November' },
			{ val: '12', name: 'December' }
	];

	// Observable string sources
	private componentMethodCallSource = new Subject<any>();

	// Observable string streams
	componentMethodCalled$ = this.componentMethodCallSource.asObservable();

	// Service message commands
	callComponentMethod() {
		this.componentMethodCallSource.next();
	}

	constructor(
		private config: NgbDatepickerConfig,
		private location: Location,
        private route: ActivatedRoute) {


			// customize default values of datepickers used by this component tree.
			config.minDate = { year: now.getFullYear() - 4, month: now.getMonth(), day: now.getDate() };
			config.maxDate = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() + 2 }; //needs to be fixed to end of TH of that week.

			// days that don't belong to current month and week numbers are visible.
			config.outsideDays = 'hidden';
			config.showWeekNumbers = false;

			// all days except for Thursdays (end of release week) are disabled.
			config.markDisabled = (date: NgbDateStruct) => {
					const d = new Date(date.year, date.month - 1, date.day);
					return d.getDay() === 0 || d.getDay() === 1 || d.getDay() === 2 || d.getDay() === 3 || d.getDay() === 5 || d.getDay() === 6;

			};
	}

	dateFilterSubmit(formValue: any){
		this.dateForm = [];
		this.dateForm = formValue;
	}

	getYear() {
			let today = new Date();
			this.yy = today.getFullYear();
			if(this.years.length <= 0){
				for (var i = (this.yy - 4); i <= this.yy; i++) {
						this.years.push(i);
				}
			}
	}

	getMonth() {
			let today = new Date();
			this.mm = today.getMonth() + 1;
			if (this.mm < 10) {
					this.mm = '0' + this.mm
			}
	}

	getQtr() {
			let qtrNumbs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
			let quarters = qtrNumbs.map(i => moment().subtract(i, 'Q').format('Y-0Q'));
			return quarters;
	}

}
