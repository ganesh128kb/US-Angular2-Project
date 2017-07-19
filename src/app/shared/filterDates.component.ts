//Angular2 Specifics
import { Component, Input, Output, OnInit, trigger, state, style, transition, animate, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

//Libraries
import { NgbModule, NgbDatepickerConfig, NgbDateStruct, ModalDismissReasons, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';

//Constants
import { Globals } from './globalVariables';

//Services
import { FilterDatesService } from './filterDates.service';
import { FilterService } from './filter.service';

import { BestSellerService } from '../bestsellers/bestsellers.service';


@Component({
    selector: 'filter-dates',
    styleUrls: ['../../assets/sass/filter.component.sass'],
    templateUrl: './filterDates.component.html',
    animations: [
        trigger('toggleState', [
            state('false', style({})),
            state('true', style({ maxHeight: 0, padding: 0, display: 'none', overflow: 'hidden' })),
            transition('* => *', animate('300ms ease')),
        ])
    ]
})

export class FilterDatesComponent implements OnInit {

    // public model: NgbDateStruct;
    // public date: { year: number, month: number };

    dateYear: any;
    dateMonth: any;
    dateQuarter: any;
    encapsulation: ViewEncapsulation.None;

    months = this.filterDatesService.months;
    quarters: string[] = [];
    years = this.filterDatesService.years;
    submit: boolean = false;

    @Input() shouldToggle;
    @Output() CloseModal = new EventEmitter();
    private hideFilterDropdown;

    constructor(private modalService: NgbModal,
        private filterDatesService: FilterDatesService,
        private fs: FilterService,
        private bs: BestSellerService,
        private location: Location,
        private route: ActivatedRoute) {
    }

    ngOnInit(): void {
        this.filterDatesService.getYear();
        this.filterDatesService.getMonth();
        this.quarters = this.filterDatesService.getQtr();

        this.dateYear = this.filterDatesService.yy;
        this.dateMonth = this.filterDatesService.mm;
        this.dateQuarter = moment().format('Y-0Q');
    }

    model: NgbDateStruct;

    isWeekend(date: NgbDateStruct) {
        const d = new Date(date.year, date.month - 1, date.day);
        return d.getDay() === 0 || d.getDay() === 6;
    }

    isDisabled(date: NgbDateStruct, current: { month: number }) {
        return date.month !== current.month;
    }

    public onSubmit(formValue) {
        this.CloseModal.emit();
        //console.log('DateFormValue', formValue);
        var dateObj,
            dateUrlFilter;
        this.submit = true;
        this.filterDatesService.dateFilterSubmit(formValue);
        switch (formValue.period) {
        case "Week":
            var date = formValue.week.year+'-'+formValue.week.month+'-'+formValue.week.day;
            var week = moment(date, "YYYY-MM-DD").isoWeek();
            var year = formValue.week.year;
            dateUrlFilter = year+':'+week;
            dateObj = {
                week: moment(date, "YYYY-MM-DD").isoWeek(),
                month: formValue.week.month,
                day: formValue.week.day,
                year: formValue.week.year,
                period: formValue.period,
                id: dateUrlFilter,
                name: 'Week ' + week + ", " + year,
                dateString: 'Week ' + week + ", " + year
            }
            console.log(dateUrlFilter);
            console.log(date);
            break;
        case "Month":
            var month = formValue.month;
            var year = formValue.year;
            dateUrlFilter = year+':'+month;
            dateObj = {
                month: formValue.month,
                year: formValue.year,
                period: formValue.period,
                id: dateUrlFilter,
                name: moment(month, 'MM').format('MMMM')+', '+year,
                dateString: moment(month, 'MM').format('MMMM')+', '+year
            }
            console.log(dateUrlFilter);
            break;
        case "Quarter":
            var quarter = formValue.quarter.split('-')[1];
            var year = formValue.quarter.split('-')[0];
            dateUrlFilter = year+':'+quarter;
            dateObj = {
                quarter: formValue.quarter.split('-')[1],
                year: formValue.quarter.split('-')[0],
                period: formValue.period,
                id: dateUrlFilter,
                name: 'Q'+quarter+', '+year,
                dateString: 'Q'+quarter+', '+year
            }
            console.log(dateUrlFilter);
            break;
        case "Year":
            var year = formValue.year;
            dateUrlFilter = year;
            dateObj = {
                year: year,
                period: formValue.period,
                id: dateUrlFilter,
                name: year,
                dateString: year
            }
            break;
        default:
            break;
        }

        if(this.fs.activeParams.date.length <= 0){
            if(this.fs.activeFilters.indexOf('Custom Date') <= -1){
                this.fs.activeFilters.push(dateObj);
            }
            this.fs.activeParams.period.push({ id: dateObj.period, name: dateObj.dateString, dateString: dateObj.dateString});
            this.fs.activeParams.date.push(dateObj);

            this.location.replaceState(this.fs.paramsUrl(this.fs.baseUrl));
            this.callMethod();
        }
        else{
            this.fs.activeFilters = this.fs.activeFilters.filter(x => {
                return x.id != this.fs.activeParams.date[0].id;
            });
            this.fs.activeParams.date = [];
            this.fs.activeParams.period = [];

            if(this.fs.activeFilters.indexOf('Custom Date') <= -1){
                this.fs.activeFilters.push(dateObj);
            }

            this.fs.activeParams.period.push({ id: dateObj.period, name: dateObj.dateString, dateString: dateObj.dateString});
            this.fs.activeParams.date.push(dateObj);

            this.fs.clearAllToggle = true;
            this.location.replaceState(this.fs.paramsUrl(this.fs.baseUrl));
            this.callMethod();
        }
    }

    callMethod = function () {
        this.filterDatesService.callComponentMethod();
    }

}
