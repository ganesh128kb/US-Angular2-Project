//Angular2 Specific
import { Component, Input, OnInit, OnChanges, trigger, EventEmitter, state, style, transition, animate, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { URLSearchParams } from '@angular/http';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { Observable, Operator } from 'rxjs/Rx';
import 'rxjs/Rx';

//Third-party Libraries
import { NgbModule, NgbDatepickerConfig, NgbDateStruct, ModalDismissReasons, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CompleterCmp, CompleterData, CompleterService, CompleterItem } from 'ng2-completer';

//Constants
import { Globals } from './globalVariables';

//Services
import { FilterService } from './filter.service';
import { FilterDatesService } from './filterDates.service';
import { ArtistDetailService } from '../details/artist/artist.service';
import { BestSellerService } from '../bestsellers/bestsellers.service';
import { AuthService } from './user/auth.service';

@Component({
    selector: 'filter',
    styleUrls: ['../../assets/sass/filter.component.sass'],
    templateUrl: './filter.component.html',
    host: { '(window:scroll)': 'track($event)' },
    animations: [
        trigger('toggleState', [
            state('false', style({})),
            state('true', style({ maxHeight: 0, padding: 0, display: 'none', overflow: 'hidden' })),
            transition('* => *', animate('300ms ease')),
        ]),
        trigger('toggleStateMobile', [
            state('false', style({})),
            state('true', style({ maxHeight: 0, padding: 0, display: 'none', overflow: 'hidden' })),
            transition('* => *', animate('300ms ease')),
        ]),
        trigger('clearAllToggle', [
            state('false', style({})),
            state('true', style({ opacity: 1, display: 'inline-block', visibility: 'visible' })),
            transition('* => *', animate('200ms ease')),
        ])
    ]
})

export class FilterComponent implements OnInit {

    @Input() shouldToggle;

    public daterange: any = {};
    public clearAllToggle: boolean = this.fs.clearAllToggle;
    private hideFilterDropdown;
    private hideFilterDropdownMobile;

    public searchStr: string;
    public dataService: CompleterData;
    public dataServicePartners: CompleterData;

    //activeFilters: Array<string> = [];
    entriesCount: number = 0;
    public territories: any;
    regions: any;
    countries: any;
    genres: any;
    genreCodeToName: any;
    partners: any;
    segments: any;
    closeResult: string;
    dateForm: any;
    dateFilters: any;
    artistName: any;
    //labelFamilies: any;

    public defaultPeriod: any;
    public defaultDate: any;
    public defaultTerritory: any;

    private isOpen: boolean = false;
    private isOpenShadow: boolean = false;
    private isOpenPartners: boolean = false;
    private isOpenPartnersShadow: boolean = false;

    ready: any = true;

    userData = {};

	@ViewChild("territoriesDropdown") private territoriesDropdown: CompleterCmp;
	@ViewChild("partnersDropdown") private partnersDropdown: CompleterCmp;

	@ViewChild("territoriesDropdownShadow") private territoriesDropdownShadow: CompleterCmp;
	@ViewChild("partnersDropdownShadow") private partnersDropdownShadow: CompleterCmp;

    public mr: any;

    public mobileFilters: any;

    private hideMobile: boolean;

    constructor(private artistService: ArtistDetailService,
        private globals: Globals,
        private bestSellers: BestSellerService,
        private fs: FilterService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private location: Location,
        private ref: ChangeDetectorRef,
        private modalService: NgbModal,
        private filterDatesService: FilterDatesService,
        private auth: AuthService,
        private completerService: CompleterService) {

		//filter component is not reinitializing on login, so user data is not updated until refresh.
		// this.userData = {};
		// this.userData = JSON.parse(localStorage.getItem('currentUser'));

		// console.log(navigator.userAgent);

        //   filterDatesService.CloseModal.subscribe(
        //     event => {this.close();},
        // );
    }

    public onOpened(isOpen: boolean) {
        this.isOpen = isOpen;
    }

    public onOpenedShadow(isOpenShadow: boolean) {
        this.isOpenShadow = isOpenShadow;
    }

    public onOpenedPartners(isOpenPartners: boolean) {
        this.isOpenPartners = isOpenPartners;
    }

    public onOpenedPartnersShadow(isOpenPartnersShadow: boolean) {
        this.isOpenPartnersShadow = isOpenPartnersShadow;
    }

    public onToggle() {
        if (this.isOpen) {
            this.territoriesDropdown.close();
        } else {
            this.territoriesDropdown.open();
            this.territoriesDropdown.focus();
        }
    }

    public onToggleShadow() {
        if (this.isOpenShadow) {
            this.territoriesDropdownShadow.close();
        } else {
            this.territoriesDropdownShadow.open();
            this.territoriesDropdownShadow.focus();
        }
    }

    public onTogglePartners() {
        if (this.isOpenPartners) {
            this.partnersDropdown.close();
        } else {
            this.partnersDropdown.open();
            this.partnersDropdown.focus();
        }
    }

    public onTogglePartnersShadow() {
        if (this.isOpenPartnersShadow) {
            this.partnersDropdownShadow.close();
        } else {
            this.partnersDropdownShadow.open();
            this.partnersDropdownShadow.focus();
        }
    }

    private formatDate(date: any) {
        return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    }

    clearAll(): any {
        this.fs.activeFilters = [];
        for (let x in this.fs.activeParams) {
			this.fs.activeParams[x] = [];
        }
        this.fs.clearAllToggle = false;
        this.fs.TestServiceEmit.emit();
        this.location.replaceState(this.fs.baseUrl);
        this.fs.TestServiceEmit.emit();
    }

    disabledLabelMenu(): boolean {
        return this.fs.activeParams.territory.length != 1 || this.segments === undefined || this.segments.length <= 0;
    }

    disabledDetailsButton(): boolean {
        if(this.router.url.toString().includes('/bestsellers/artists') || this.fs.detailCheck == "artist" || this.fs.detailCheck == "track" || this.fs.detailCheck == "project"){
            return true;
        } else {
            return false;
        }
    }

    disabledDetailsButtonPartner(): boolean {
        if (this.fs.detailCheck == "artist" || this.fs.detailCheck == "track" || this.fs.detailCheck == "project") {
            return true;
        } else {
            return false;
        }
    }

    ngOnInit(): void {

		this.defaultPeriod = this.globals.defaultPeriod;
		this.defaultDate = this.globals.defaultDate;
		this.defaultTerritory = this.globals.defaultTerritory;

        this.artistName = this.artistService.artistName;

        this.dateFilters = this.fs.dateFilters;
        this.dateForm = this.filterDatesService.dateForm;

        //On initialization populate the activeParams and activeFilters from given url parameters.
        this.activatedRoute.queryParams.subscribe((params: Params) => {
            this.shouldToggle = false;
        });

        // console.log('filterUserData', this.auth.userData);
    }

    catalogueToggle() {
		this.globals.catalogueToggle = !this.globals.catalogueToggle;
		// console.log('catalogueToggle');
		this.fs.TestServiceEmit.emit();
    }

    //ADD FILTER TO THE ACTIVE FILTERS AND ACTIVE PARAMS ARRAYS
    addFilter(filterType: string, parent: any) {
        switch (filterType) {
            case "genres":
                if (this.fs.activeParams.genre.length > 0) {
                    this.fs.activeFilters = this.fs.activeFilters.filter(x => {
                        return x.id != this.fs.activeParams.genre[0].id;
                    });
                    this.fs.activeParams.genre = [];
                    this.checkArrayValues(parent.name, this.fs.activeFilters, 'filter', parent);
                    this.checkArrayValues(parent.id, this.fs.activeParams.genre, 'genre', parent);
                    this.location.replaceState(this.fs.paramsUrl(this.fs.baseUrl));

                } else {
                    this.checkArrayValues(parent.name, this.fs.activeFilters, 'filter', parent);
                    this.checkArrayValues(parent.id, this.fs.activeParams.genre, 'genre', parent);
                }
                break;
            case "partners":

				if (parent) {
					parent = parent.originalObject;
					if (this.fs.activeParams.partner.length > 0) {
						this.fs.activeFilters = this.fs.activeFilters.filter(x => {
							return x.id != this.fs.activeParams.partner[0].id;
						});
						this.fs.activeParams.partner = [];
						this.checkArrayValues(parent.name, this.fs.activeFilters, 'filter', parent);
						this.checkArrayValues(parent.id, this.fs.activeParams.partner, 'partner', parent);
						this.location.replaceState(this.fs.paramsUrl(this.fs.baseUrl));
					} else {
						this.checkArrayValues(parent.name, this.fs.activeFilters, 'filter', parent);
						this.checkArrayValues(parent.id, this.fs.activeParams.partner, 'partner', parent);
					}
				} else {
					event.preventDefault();
					parent = '';
				}
                break;
            case "labels":
                if (this.fs.activeParams.label.length > 0) {
                    this.fs.activeFilters = this.fs.activeFilters.filter(x => {
                        return x.id != this.fs.activeParams.label[0].id;
                    });
                    this.fs.activeParams.label = [];
                    this.fs.activeParams.labelType = [];
                    this.checkArrayValues(parent.name, this.fs.activeFilters, 'filter', parent);
                    this.checkArrayValues(parent.id, this.fs.activeParams.label, 'label', parent);
                    this.checkArrayValues(parent.type, this.fs.activeParams.labelType, 'labelType', parent);
                    this.location.replaceState(this.fs.paramsUrl(this.fs.baseUrl));
                } else {
                    this.checkArrayValues(parent.name, this.fs.activeFilters, 'filter', parent);
                    this.checkArrayValues(parent.id, this.fs.activeParams.label, 'label', parent);
					//   if(!this.auth.userData['internal']) {
					//     this.checkArrayValues(parent.type, this.fs.activeParams.labelType, 'labelType', parent);
					// } else {
					this.checkArrayValues(parent.type, this.fs.activeParams.labelType, 'labelType', parent);
					// }
                }
                break;
            case "territories":

				// console.log(parent);

				if (parent) {
					parent = parent.originalObject;

					if (parent.id === "13") {
						this.fs.activeFilters = this.fs.activeFilters.filter(f => {
							return f.id != this.fs.activeParams.territory[0].id;
						});
						this.fs.activeParams.territory[0] = [];
						this.fs.activeParams.area[0] = [];
					}

					if (this.fs.activeParams.territory.length <= 0 && this.fs.activeParams.label.length != 1) {
						this.checkArrayValues(parent.name, this.fs.activeFilters, 'filter', parent);
						this.checkArrayValues(parent.type, this.fs.activeParams.area, 'area', parent);
						this.checkArrayValues(parent.id, this.fs.activeParams.territory, 'territory', parent);
						this.segments = [];
						// this.partners = [];
						this.disabledLabelMenu();

						if (parent.type === 'Country') {
							if (parent.segments.length > 0) {
								//Populate the labels menu
								this.segments = parent.segments;
								// this.partners = parent.partners;
							}
							else {
								//Disable the list and the menu
								this.segments = [];
								// this.partners = [];
								this.disabledLabelMenu();
							}
						}
					}
					else {
						this.fs.activeFilters = this.fs.activeFilters.filter(x => {
							return x.id != this.fs.activeParams.territory[0].id;
						});
						this.fs.activeParams.territory = [];
						this.fs.activeParams.area = [];
						this.checkArrayValues(parent.name, this.fs.activeFilters, 'filter', parent);
						this.checkArrayValues(parent.type, this.fs.activeParams.area, 'area', parent);
						this.checkArrayValues(parent.id, this.fs.activeParams.territory, 'territory', parent);
					}
				} else {
					event.preventDefault();
					parent = '';
				}
                break;
        }
		// console.log('ActiveParams', this.fs.activeParams);
		// console.log('Active Filters', this.fs.activeFilters);
        this.fs.clearAllToggle = true;
        this.fs.TestServiceEmit.emit();
    }

    // private selectedDate(value: any) {

    //     this.daterange.start = value.start;
    //     this.daterange.end = value.end;

    //     if (this.fs.activeFilters.indexOf('Custom Date') === -1) {

    //         let startDate = {
    //             filterName: 'Custom Date',
    //             filterCode: this.formatDate(new Date(this.daterange.start._d))
    //         }
    //         let endDate = {
    //             filterName: 'Custom Date',
    //             filterCode: this.formatDate(new Date(this.daterange.end._d))
    //         }

    //         this.checkArrayValues('Custom Date', this.fs.activeFilters, 'filter', this.daterange);
    //         //this.checkArrayValues('Custom Date', this.fs.activeParams.start, 'start', startDate);
    //         //this.checkArrayValues('Custom Date', this.fs.activeParams.end, 'end', endDate);
    //         this.fs.paramsUrl(this.fs.baseUrl);
    //     }
    //     //let dateFormatTest = dateTest.toLocaleDateString('en-US', {formatMatcher: 'basic'}).replace(/\//g, '-');
    //     //let dateFormatted = dateTest.getFullYear() + '-' + (dateTest.getMonth() + 1) + '-' +  dateTest.getDate();
    // }

    //Check if the Array has the value.
    checkArrayValues(value, arrayParent, filterType, parent) {
        //Checks whether or not the given array contains the given value.
        if (!arrayParent.includes(value)) {
            //If the arrayParent does not include the value given, it pushes it to the array.
            arrayParent.push(parent);
        }
        this.location.replaceState(this.fs.paramsUrl(this.fs.baseUrl));
    }

    removeFilter(param: any) {
        console.log(param);

        //Resets dateform object
        if(param == 'Custom Date'){
            this.filterDatesService.dateForm = [];
        }

        //If the param is inside of activeFilters, remove it.
        //this.removeActiveFilter(param);
        let index = this.fs.activeFilters.indexOf(param);
        if (index > -1) {
            this.fs.activeFilters.splice(index, 1);
        }
        //If country or region is removed and applied label is a Segment then remove it as well
        if(param.type == 'Country' || param.type == 'Region'){
            if(this.fs.activeParams.label.length > 0 && this.fs.activeParams.label[0].type == 'Segment'){
                //this.removeActiveFilter(this.fs.activeParams.label[0]);
                let index = this.fs.activeFilters.indexOf(this.fs.activeParams.label[0]);
                if (index > -1) {
                    this.fs.activeFilters.splice(index, 1);
                }
                this.fs.activeParams.label = [];
                this.fs.activeParams.labelType = [];
            }
        }

        //For loop runs through each array in the activeParams object.
        for (let filterType in this.fs.activeParams) {
            //childArray references the current array.
            const childArray = this.fs.activeParams[filterType];
            //childIndex checks for the location of the given param to remove.
            const childIndex = childArray.findIndex(x => x.name === param.name);
            //If the param exists splice it from the current childArray.
            if (childIndex > -1) {
                childArray.splice(childIndex, 1);
            }
        }
        if (this.fs.activeFilters.length == 0) {
            this.fs.clearAllToggle = false;
            this.location.replaceState(this.fs.baseUrl);
        } else {
            this.location.replaceState(this.fs.paramsUrl(this.fs.baseUrl));
        }

        this.fs.TestServiceEmit.emit();
    }

    // removeActiveFilter(obj){
    //     let index = this.fs.activeFilters.indexOf(obj);
    //     if (index > -1) {
    //         this.fs.activeFilters.splice(index, 1);
    //     }
    // }

    track($event: Event) {
        let scrollPos = document.body.scrollTop;
        let scrollPosMobile = document.body.scrollTop;

        if (scrollPos >= 93) {
            this.hideFilterDropdown = true;
        }
        else {
            this.hideFilterDropdown = false;
        }

        if (scrollPosMobile >= 93) {
            this.hideFilterDropdownMobile = true;
        }
        else {
            this.hideFilterDropdownMobile = false;
        }
    }

    open(content) {
        this.mr = this.modalService.open(content);
        // this.modalService.open(content).result.then((result) => {
        //     this.closeResult = `Closed with: ${result}`;
        // }, (reason) => {
        //     this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        // });
    }

    openMobile(mobileFilters) {
  			this.mobileFilters = this.modalService.open(mobileFilters);
  	}

  	closeMobile() {
  			this.mobileFilters.close();
  			this.mobileFilters.dismiss();
  	}

    close() {
        this.mr.close();
        this.mr.dismiss();
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

}
