import { Injectable, Input, Output, EventEmitter, OnInit, trigger, state, style, transition, animate, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Params, Router} from '@angular/router';
import { Location } from '@angular/common';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

//Services
import { FilterDatesService } from './filterDates.service';
import { ArtistDetailService } from '../details/artist/artist.service';
import { BestSellerService } from '../bestsellers/bestsellers.service';
import { Globals } from './globalVariables';
import { AuthService } from './user/auth.service';
import { CompleterCmp, CompleterData, CompleterService, CompleterItem } from 'ng2-completer';

//Third-party Libraries
import { Apollo, ApolloQueryObservable } from 'apollo-angular';
import { ApolloClient, ApolloQueryResult } from 'apollo-client';
import gql from 'graphql-tag';
import * as moment from 'moment';
import Details from '../queries/artistDetail.graphql';
import * as _ from 'lodash';
import { chain } from 'lodash';

//GraphQL queries
import FilterDropdownData from '../queries/filterDropdownData.graphql';

class FilterId {
    name: string;
    id: string;
}

@Injectable()
export class FilterService {
	//This object maps the genreCode to the genreCodeToNameMap.

	@Output() TestServiceEmit = new EventEmitter();
    //@Output() openModalEmit = new EventEmitter();

	public paramsUrlString;
	public baseUrl: string;
	public filterUrl: string;
	public detailCheck: string;
	changeCallBack: (() => void) = function() { };
	public clearAllToggle: boolean = false;
	public dateFilters: any;
	public artistName: any;

	public trackName: any;
	public projectName: any;
	public bs: any;

	public topArtists: boolean;
	public topProjects: boolean;
	public topTracks: boolean;

	public dataService: CompleterData;
  public dataServicePartners: CompleterData;

	public artistInit: any;
	public trackInit: any;
	public projectInit: any;

  public BStype: string;

	partner: any;
	genre: any;
	regions: any;
	countries: any;
	segments: any;
	family: any;
	territories: any;

	userData = {};

	activeFilters: Array<any> = [];
	activeParams = {
		territory: [],
		area: [],
		partner: [],
		genre: [],
		label: [],
		labelType: [],
		date: [],
		rank: [],
		period: []
		// start:[],
		// end: [],
	};

	codeToNameMap: any = {
		'genre': {},
		'label': {},
		'family': {},
		'segments': {},
		'partner': {},
		'territory': {},
		'regions': {},
		'countries': {}
	};

	constructor(private http: Http,
		private apollo: Apollo,
		private router: Router,
        private globals: Globals,
		private route: ActivatedRoute,
		private filterDatesService: FilterDatesService,
        private location: Location,
        private auth: AuthService,
        private completerService: CompleterService
	) {

        auth.clearOnLogOut.subscribe(
            event => this.clearFilters(),
            err => console.log(err),
            () => console.log('done')
        );

		this.router.events.subscribe(res => {
			this.detailCheck = res.url.toString().split('/')[1];
			this.baseUrl = res.url.toString().split('?')[0];
            this.userData = JSON.parse(localStorage.getItem('currentUser'));
		});
	}

    Metadata(params): any {
        let tempData;

        this.getFilterDropdownData().subscribe(
            res => tempData = res,
            err => console.log(err),
            () => {

				// if(this.userData.internal == true)

                this.partner = tempData.metadata.partners;
                this.partner = _(this.partner).chain().sortBy(function(obj) {
					return obj.name;
				}).reverse().sortBy(function(obj) {
					return parseInt(obj['priorityPartner'], 10);
				}).reverse().value();
                // console.log(this.partner);
                this.genre = tempData.metadata.genres;
                this.regions = tempData.metadata.territories.regions;
                this.countries = tempData.metadata.territories.countries;
                this.territories = this.regions.concat(this.countries);
                // this.territories = _.sortBy(this.territories, 'order');
                this.territories = _.sortBy(this.territories, function(obj) {
                    return parseInt(obj['order'], 10);
                });
                // console.log(this.territories);
                this.segments = tempData.metadata.labels.segments;
                this.family = tempData.metadata.labels.families;
                this.amendCodeToNameMap(tempData.metadata.genres, this.codeToNameMap['genre']);
                this.amendCodeToNameMap(tempData.metadata.partners, this.codeToNameMap['partner']);
                this.amendCodeToNameMap(tempData.metadata.territories.regions, this.codeToNameMap['regions']);
                this.amendCodeToNameMap(tempData.metadata.territories.countries, this.codeToNameMap['countries']);
                this.amendCodeToNameMap(tempData.metadata.labels.families, this.codeToNameMap['family']);
                this.amendCodeToNameMap(tempData.metadata.labels.segments, this.codeToNameMap['segments']);

                console.log('MetaData', tempData.metadata)
                this.parseParams(params);

                this.dataService = this.completerService.local(this.territories, 'name', 'name');
                this.dataServicePartners = this.completerService.local(this.partner, 'name', 'name');
            }
        );
    }

    clearFilters() {
        this.activeFilters = [];
        for (let x in this.activeParams) {
			this.activeParams[x] = [];
        }
    }

    // filterArtistUrl() {
    //     if (this.location.path().includes('?')) {
    //         let filterString = this.location.path().split('?');
    //         let filters = filterString[1].split('&');
    //         console.log('Filters', filters);
    //         for (let filter in filters) {
    //             let value = filters[filter];
    //             let valueArray = value.split('=')[0];
    //             console.log('filterNumber', parseInt(filter));
    //             if (valueArray == 'genre' || valueArray == 'partner' || valueArray == 'label' || valueArray == 'labelType' || valueArray == 'rank') {
    //                 filters.splice(parseInt(filter), 1);
    //                 console.log(valueArray+' Filter ', this.activeParams[valueArray]);
    //             }
    //         }

    //         this.location.replaceState(filterString[0] + '?' + filters.join('&'));
    //     }
    // }

    getFilterDropdownData(): Observable<ApolloQueryResult<Object>> {
        return this.apollo.query({ query: FilterDropdownData })
            .map(({data}) => data);
    }

    paramsObj(id: number = 0, previousDate: boolean = false, territoryAll: boolean = false, periodAll: boolean = false): any {

        //console.log('Date Form', this.filterDatesService.dateForm);
        //console.log('Date ActiveParams', this.activeParams.date[0]);
        const today = new Date();
        let obj: any = {};

        let prevMonth;
        let prevWeek;
        let prevQuarter;

        let date = "";
        //const dateForm = this.filterDatesService.dateForm;
        const dateForm = this.activeParams.date[0] ? this.activeParams.date[0] : [];

        if (id != 0) {
            obj.id = id;
        }

        if (periodAll == false) {
            obj.period = dateForm.period;
        } else {
            obj.period = "All";
        }

        obj.date = {};
        obj.prevDate = {};

        switch (obj.period) {
            case "All":
                obj.period = "All";
                break;
            case "Year":
                obj.date.year = dateForm.year;
                if (previousDate == true) {
                    obj.prevDate.year = moment(dateForm.year).utc().subtract(1, 'year').format("YYYY");
                }
                break;
            case "Quarter":
                obj.date.year = dateForm.year;
                obj.date.quarter = dateForm.quarter;
                if (previousDate == true) {
                    prevQuarter = moment(dateForm.year + "/" + dateForm.quarter, "YYYY/0Q").utc().subtract(1, 'quarter').format('YYYY-0Q');
                    obj.prevDate.quarter = prevQuarter.split('-')[1];
                    obj.prevDate.year = prevQuarter.split('-')[0];
                }
                break;
            case "Month":
                prevMonth = moment(dateForm.year + "/" + dateForm.month, "YYYY/MM").utc().subtract(1, 'month').format('YYYY-MM');
                obj.date.year = dateForm.year;
                obj.date.month = dateForm.month;
                if (previousDate == true) {
					obj.prevDate.year = prevMonth.split('-')[0];
					obj.prevDate.month = prevMonth.split('-')[1];
                }
                break;
            case "Week":
                date = dateForm.year + '-' + dateForm.month + '-' + dateForm.day;
                prevWeek = moment(date).utc().subtract(6, 'days');
                obj.date.year = dateForm.year;
                obj.date.week = dateForm.week;
                // console.log(moment(date, "YYYY-MM-DD").isoWeek());
                if (previousDate == true) {
                    obj.prevDate.week = moment(prevWeek, "YYYY-MM-DD").isoWeek();
                    obj.prevDate.year = moment(prevWeek, "YYYY-MM-DD").year();
                    // console.log(moment(prevWeek, "YYYY-MM-DD").isoWeek());
                    // console.log(moment(prevWeek, "YYYY-MM-DD").year());
                }
                break;
            default:
                // let prevMonth = moment().month("12").subtract(1, 'months').format('MM');
                if (previousDate == false) {
                    obj.period = "Week";
                    obj.date.year = "2016";
                    obj.date.week = "52";
                } else {
                    obj.period = "Week";
                    obj.date.year = "2016";
                    obj.date.week = "52";
                    obj.prevDate.year = "2016";
                    obj.prevDate.week = "51";
                }
                break;

        }
        obj.sort = "TotalUnits";
        obj.paging = {};
        obj.filters = {};

        if (this.globals.catalogueToggle) {
			obj.filters.catalogue = "Yes";
		} else {
			obj.filters.catalogue = "No";
		}

        if (this.activeParams.rank.length > 0) {
            obj.paging.skip = this.activeParams.rank[0].id.split(':')[0];
            obj.paging.limit = this.activeParams.rank[0].id.split(':')[1];
        } else {
            obj.paging.skip = 0;
            obj.paging.limit = 25;
        }

        if (this.activeParams.partner.length > 0) {
            obj.filters.partners = this.activeParams.partner[0].id;
        } else {
            obj.filters.partners = [];
        }

        if (this.activeParams.territory.length > 0 && territoryAll == false) {
            obj.filters.territories = {};
            obj.filters.territories.type = this.activeParams.territory[0].type;
            obj.filters.territories.id = this.activeParams.territory[0].id;
        } else {
            obj.filters.territories = [];
        }


        // if(this.auth.userData['internal'] == false && this.activeParams.label.length <= 0){
        //     obj.filters.labels = {};
        //     obj.filters.labels.type = 'Family';
        //     obj.filters.labels.id = this.auth.userData['externalInfo']['familyLabel']['id'];
        // }else
        if (this.activeParams.label.length > 0) {
            obj.filters.labels = {}
            obj.filters.labels.type = this.activeParams.label[0].type;
            obj.filters.labels.id = this.activeParams.label[0].id;
        } else {
            obj.filters.labels = [];
        }

        // if (this.activeParams.familyLabel.length > 0) {
        //     obj.filters.labels = {}
        //     obj.filters.labels.type = "Family";
        //     obj.filters.labels.id = this.activeParams.familyLabel[0].id;
        // } else {
        //     obj.filters.labels = [];
        // }

        if (this.activeParams.genre.length > 0) {
            obj.filters.genres = this.activeParams.genre[0].id;
        } else {
            obj.filters.genres = [];
        }

        this.dateFilters = obj;

        // console.log('generalParamsObj', obj);

        return obj;
    }

    lineChartParamsObj(id: number = 0): any {

        let weekPrecisionStart;
        let dayPrecisionStart;
        let dataStart;
        let endDate;

        let obj: any = {};

        obj.filters = {};
        obj.filters.partners = [];

        if (this.activeParams.territory.length > 0) {
            obj.filters.territories = {};
            obj.filters.territories.type = this.activeParams.territory[0].type;
            obj.filters.territories.id = this.activeParams.territory[0].id;
        } else {
            obj.filters.territories = [];
        }

        const dateForm = this.activeParams.date[0] ? this.activeParams.date[0] : [];

        if (id != 0) {
            obj.id = id;
        }

        let period = dateForm.period;
        obj.startDate = {};
        obj.endDate = {};

        switch (period) {
            case "Week":
                // endDate = dateForm.week.year + '-' + dateForm.week.month + '-' + dateForm.week.day;
                // endDate = "2016-12-31";

                // if (moment(endDate).isAfter(dayPrecisionStart, 'day')) {
                //     obj.precision = "Day";
                //
                //     obj.startDate.year = dayPrecisionStart.split('-')[0];
                //     obj.startDate.month = dayPrecisionStart.split('-')[1];
                //     obj.startDate.day = dayPrecisionStart.split('-')[2];
                //
                //     obj.endDate.year = endDate.split('-')[0];
                //     obj.endDate.month = endDate.split('-')[1];
                //     obj.endDate.day = endDate.split('-')[2];
                // } else {
				endDate = "2016-12-31";
                weekPrecisionStart = moment(endDate).utc().subtract(20, "weeks").format("YYYY-WW");
				obj.precision = "Week";

				obj.startDate.year = weekPrecisionStart.split('-')[0];
				obj.startDate.week = weekPrecisionStart.split('-')[1];

				obj.endDate.year = endDate.split('-')[0];
				obj.endDate.week = moment(endDate, "YYYY-MM-DD").isoWeek();
                // };

                break;
            case "Month":
                // let test = dateForm.year + '-' + dateForm.month + '-' + moment(dateForm.month).endOf('month').format('DD');
                endDate = "2016-12-31";

                dataStart = moment(endDate).utc().subtract(6, "months").format("YYYY-MM-DD");

                // console.log(dateForm.year);
                // console.log(dateForm.month);
                // console.log(moment(dateForm.month).endOf('month').format('DD').toString());
                obj.precision = "Month";

                obj.startDate.year = dataStart.split('-')[0];
                obj.startDate.month = dataStart.split('-')[1];
                obj.startDate.day = dataStart.split('-')[2];

                obj.endDate.year = endDate.split('-')[0];
                obj.endDate.month = endDate.split('-')[1];
                obj.endDate.day = endDate.split('-')[2];
                break;
            case "Quarter":
                endDate = "2016-04";
                dataStart = moment(endDate, "YYYY-0Q").utc().subtract(1, "quarters").format("YYYY-0Q");

                obj.precision = "Quarter";

                obj.startDate.year = dataStart.split('-')[0];
                obj.startDate.quarter = dataStart.split('-')[1];

                obj.endDate.year = endDate.split('-')[0];
                obj.endDate.quarter = moment(endDate, "YYYY-0Q").format("0Q");

                break;
            case "Year":

                endDate = moment(dateForm.year).utc().endOf('year').format('YYYY-MM');
                dataStart = moment(endDate).utc().subtract(6, "months").format("YYYY-MM");

                obj.precision = "Month";

                obj.startDate.year = dataStart.split('-')[0];
                obj.startDate.month = dataStart.split('-')[1];

                obj.endDate.year = endDate.split('-')[0];
                obj.endDate.month = endDate.split('-')[1];

                break;
            default:

                endDate = "2016-12-31";
                dayPrecisionStart = moment(endDate).utc().subtract(4, "months").format("YYYY-MM-DD");
                weekPrecisionStart = moment(endDate).utc().subtract(20, "weeks").format("YYYY-WW");

                if (moment(endDate).isAfter(dayPrecisionStart, 'day')) {
                    obj.precision = "Day";

                    obj.startDate.year = dayPrecisionStart.split('-')[0];
                    obj.startDate.month = dayPrecisionStart.split('-')[1];
                    obj.startDate.day = dayPrecisionStart.split('-')[2];
                } else {
                    obj.precision = "Week";

                    obj.startDate.year = weekPrecisionStart.split('-')[0];
                    obj.startDate.month = weekPrecisionStart.split('-')[1];
                    obj.startDate.day = weekPrecisionStart.split('-')[2];
                };

                obj.endDate.year = endDate.split('-')[0];
                obj.endDate.month = endDate.split('-')[1];
                obj.endDate.day = endDate.split('-')[2];
                break;
        }

        // console.log('lineChartParamsObj', obj);
        return obj;
    }

    eightWeekChartParamsObj(id: number = 0): any {

        let endDate;
        let startDate;
        let day;
        let obj: any = {};

        obj.startDate = {};
        obj.endDate = {};

        if (id != 0) {
            obj.id = id;
        }

        const dateForm = this.activeParams.date[0] ? this.activeParams.date[0] : [];
        let period = dateForm.period;

        switch (period) {
            case "Year":
				obj.precision = "Week";
				endDate = moment(dateForm.year).utc().endOf('year').format("YYYY-MM-DD");

				startDate = moment(endDate).utc().subtract(7, "weeks").format("YYYY-MM-DD");
				//
				//
				obj.startDate.year = startDate.split('-')[0];
				obj.startDate.week = moment(startDate, "YYYY-MM-DD").isoWeek().toString();
				//
				obj.endDate.year = endDate.split('-')[0];
				obj.endDate.week = moment(endDate, "YYYY-MM-DD").isoWeek().toString();
				break;
            case "Quarter":

				obj.precision = "Week";

				day = moment(dateForm.year + '/' + dateForm.quarter, "YYYY/0Q").endOf('quarter').format("MM-DD");
				endDate = dateForm.year + '-' + day;

				startDate = moment(endDate).utc().subtract(7, "weeks").format("YYYY-MM-DD");

				obj.startDate.year = startDate.split('-')[0];
				obj.startDate.week = moment(startDate, "YYYY-MM-DD").isoWeek().toString();
				//
				obj.endDate.year = endDate.split('-')[0];
				obj.endDate.week = moment(endDate, "YYYY-MM-DD").isoWeek().toString();

				break;
            case "Month":

				obj.precision = "Week";
				day = moment(dateForm.year + '/' + dateForm.month).endOf('month').format("DD");
				endDate = dateForm.year + '-' + dateForm.month + '-' + day;

				startDate = moment(endDate).utc().subtract(7, "weeks").format("YYYY-MM-DD");

				obj.startDate.year = startDate.split('-')[0];
				obj.startDate.week = moment(startDate, "YYYY-MM-DD").isoWeek().toString();

				obj.endDate.year = endDate.split('-')[0];
				obj.endDate.week = moment(endDate, "YYYY-MM-DD").isoWeek().toString();
				break;
            case "Week":

				endDate = dateForm.year + '-' + dateForm.month + '-' + dateForm.day;
				startDate = moment(endDate).utc().subtract(7, "weeks").format("YYYY-MM-DD");

				obj.precision = "Week";

				obj.startDate.year = startDate.split('-')[0];
				obj.startDate.week = moment(startDate, "YYYY-MM-DD").isoWeek().toString();

				obj.endDate.year = endDate.split('-')[0];
				obj.endDate.week = moment(endDate, "YYYY-MM-DD").isoWeek().toString();

                break;
            default:

				endDate = "2016-12-31";
				startDate = moment(endDate).utc().subtract(7, "weeks").format("YYYY-MM-DD");

				obj.precision = "Week";

				obj.startDate.year = startDate.split('-')[0];
				obj.startDate.week = moment(startDate, "YYYY-MM-DD").isoWeek().toString();

				obj.endDate.year = endDate.split('-')[0];
				obj.endDate.week = moment(endDate, "YYYY-MM-DD").isoWeek().toString();

				break;
        }

		obj.filters = {};
		obj.filters.partners = [];

		obj.filters.territories = [];

		// console.log('eightWeekChartParamsObj', obj);
        return obj;

    }

    parseParams(params) {
        let period = params.period;
        let date = params.date;
        let dateObj: any;
        console.log('Params', params);
        for (let key in params) {
            this.clearAllToggle = true;
            const valueArray = this.activeParams[key];
            const values = params[key];

            if (key != 'area' && key != 'labelType' && valueArray.length <= 0) {
                    let name = 'Custom Date';

                    //If the filter is Genre or Partner use this.
                    if (key != 'end' && key != 'start' && key != 'date' && key != 'period') {
                        name = this.codeToName(key, values);
                    }
                    //Territories
                    if(key == 'territory'){
                        if(params.area == 'Region'){
                            name = this.codeToName('regions', values);
                            this.activeParams[key].unshift({ id: values, name: name, type: "Region" });
                            if (this.activeFilters.indexOf(name) <= -1) {
                                console.log('IndexOf', this.activeFilters.indexOf(name));
                                this.activeFilters.push({ id: values, name: name, type: "Region" });
                            }
                        }else{
                            name = this.codeToName('countries', values);
                            this.activeParams[key].unshift({ id: values, name: name, type: "Country" });
                            if (this.activeFilters.indexOf(name) <= -1) {
                                this.activeFilters.push({ id: values, name: name, type: "Country" });
                            }
                        }
                    }
                    //Labels
                    if(key == 'label' && params.territory){
                        if(params.labelType == 'Segment'){
                            name = this.codeToName('segments', values);
                            this.activeParams[key].unshift({ id: values, name: name, type: "Segment" });
                            this.activeFilters.push({ id: values, name: name, type: "Segment" });
                        }else{
                            name = this.codeToName('family', values);
                            this.activeParams[key].unshift({ id: values, name: name, type: "Family" });
                            this.activeFilters.push({ id: values, name: name, type: "Family" });
                        }
                    }else if(key == 'label' && !params.territory){
                        let filterString = this.location.path().split('?');
                        //Splits the Params into indiviual strings.
                        let filters = filterString[1].split('&');
                        let unWanted = ['label', 'labelType'];
                        filters = filters.filter(f => {
                            const filterKey = f.split('=', 1)[0];
                            const valueID = f.split('=', 1)[1];

                            return unWanted.indexOf(filterKey) < 0;
                        });
                        this.location.replaceState(filterString[0] + '?' + filters.join('&'));
                    }

                    //Date
                    if(key == 'date'){
                        switch (period) {
                            case "Week":
                                dateObj = {
                                    week: date.split(':')[1],
                                    day: moment(date.split(':')[0] + "/" + date.split(':')[1], "YYYY/WW").isoWeekday("Thursday").utc().format("DD"),
                                    month: moment(date.split(':')[0] + "/" + date.split(':')[1], "YYYY/WW").isoWeekday("Thursday").utc().format("MM"),
                                    year: date.split(':')[0],
                                    period: period,
                                    id: date,
                                    name: 'Week ' + date.split(':')[1] + ", " + date.split(':')[0],
                                    dateString: 'Week ' + date.split(':')[1] + ", " + date.split(':')[0]
                                }
                                if (this.activeFilters.indexOf(name) <= -1) {
                                    this.activeFilters.push(dateObj);
                                }
                                this.activeParams['date'].unshift(dateObj);
                                this.activeParams['period'].unshift(dateObj);
                                break;
                            case "Month":
                                dateObj = {
                                    month: date.split(':')[1],
                                    year: date.split(':')[0],
                                    period: period,
                                    id: date,
                                    name: moment(date.split(':')[1].toString(), 'MM').utc().format('MMMM')+', '+date.split(':')[0],
                                    dateString: moment(date.split(':')[1].toString(), 'MM').utc().format('MMMM')+', '+date.split(':')[0]
                                }
                                if (this.activeFilters.indexOf(name) <= -1) {
                                    this.activeFilters.push(dateObj);
                                }
                                this.activeParams['date'].unshift(dateObj);
                                this.activeParams['period'].unshift(dateObj);
                                break;
                            case "Quarter":
                                dateObj = {
                                    quarter: date.split(':')[1],
                                    year: date.split(':')[0],
                                    period: period,
                                    id: date,
                                    name: 'Q'+date.split(':')[1]+', '+date.split(':')[0],
                                    dateString: 'Q'+date.split(':')[1]+', '+date.split(':')[0]
                                }
                                if (this.activeFilters.indexOf(name) <= -1) {
                                    this.activeFilters.push(dateObj);
                                }
                                this.activeParams['date'].unshift(dateObj);
                                this.activeParams['period'].unshift(dateObj);
                                break;
                            case "Year":
                                dateObj = {
                                    year: date,
                                    period: period,
                                    id: date,
                                    name: 'Year ' + date,
                                    dateString: 'Year ' + date
                                }
                                if (this.activeFilters.indexOf(name) <= -1) {
                                    this.activeFilters.push(dateObj);
                                }
                                this.activeParams['date'].unshift(dateObj);
                                this.activeParams['period'].unshift(dateObj);
                                break;
                            default:
                            break;
					}
				}
                //Everything Else
				if (key != 'territory' && key != 'label' && key != 'date' && key != 'period' && key != 'rank' && key != 'area') {
					if (this.activeFilters.indexOf(name) <= -1) {
						this.activeFilters.push({ id: values, name: name });
					}
					this.activeParams[key].unshift({ id: values, name: name });
				}
			}
		}
		this.TestServiceEmit.emit();
	}

	paramsUrl(base: string): string {
		let params = new URLSearchParams();

		for (let param in this.activeParams) {

			const valueArray = this.activeParams[param];
			if (valueArray.length > 0 && param != 'area' && param != 'labelType') {
				params.append(param, valueArray.map(x => x.id).join(','));
			}
			if (param === 'area' && valueArray.length > 0 || param === 'labelType' && valueArray.length > 0) {
				params.append(param, valueArray.map(x => x.type).join(','));
			}
			// else{
			// 	params.append(param, this.defaults(param));
			// }
		}

		this.clearAllToggle = true;

		this.paramsUrlString = params.toString();
		//this.TestServiceEmit.emit();
		return base + '?' + params.toString();
	}

	dayOfYear(): number {
		const now = new Date();
		const thisYear = now.getFullYear();
		const newYears = new Date(thisYear, 0, 0);
		const ms = now.getTime() - newYears.getTime();
		const s = ms / 1000;
		const m = s / 60;
		const h = m / 60;
		const d = h / 24;
		return d;
	}

	codeToName(name: string, id: string): string {
		if (name in this.codeToNameMap) {
			return this.codeToNameMap[name][id];
		}
		return undefined;
	}

	amendCodeToNameMap(filterIds: Array<FilterId>, map: any): any {
		for (let i in filterIds) {
			let code = filterIds[i].id;
			let name = filterIds[i].name;
			map[code] = name;
		}
	}

	// territorySegments(territoryCode:string): Array<FilterId>{
	// 	return this.segmentLabels[territoryCode];
	// }

	getRankStart(): number {
		if (this.activeParams.rank[0]) {
			return parseInt(this.activeParams.rank[0].id.split(':')[0], 10);
		} else {
			return 0;
		}
	}

	setRankStart(start: number) {
		//this.activeParams.rank[0] = { filterCode: ("00" + start).slice(-2)+':'+("00" + this.getRankEnd()).slice(-2) };
		this.activeParams.rank[0] = { id: start + ':' + this.getRankEnd() };
	}

	getRankEnd(): number {
		if (this.activeParams.rank[0]) {
			return parseInt(this.activeParams.rank[0].id.split(':')[1], 10);
		} else {
			return 25;
		}
	}

	setRankEnd(end: number) {
		//this.activeParams.rank[0] = { filterCode: ("00" + this.getRankStart()).slice(-2)+':'+("00" + end).slice(-2) };
		this.activeParams.rank[0] = { id: this.getRankStart() + ':' + end };
		this.TestServiceEmit.emit();
	}

}
