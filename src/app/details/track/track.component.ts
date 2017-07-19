//Angular2 Specifics
import { Component, Input, OnInit, OnDestroy, ComponentRef} from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Http } from '@angular/http';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Observable';
import { ISubscription, Subscription } from "rxjs/Subscription";

//Services
import { TrackDetailService } from './track.service';
import { ListsService } from '../../shared/lists.service';
import { FilterService } from '../../shared/filter.service';
import { FilterDatesService } from '../../shared/filterDates.service';
import { SortService } from '../../shared/services/sort.service';
import { ExportService } from '../../shared/export.service';

//Constants
import { Globals } from '../../shared/globalVariables';
import { Apollo, ApolloQueryObservable } from 'apollo-angular';
import gql from 'graphql-tag';

//Third-party Libraries
import * as d3 from 'd3';
import * as moment from 'moment';
import * as _ from 'lodash';
import { chain } from 'lodash';

@Component({
    selector: 'trackDetail',
    templateUrl: './track.component.html',
    styleUrls: ['../../../assets/sass/details.component.sass']
})

export class TrackDetailComponent implements OnInit {

    //Subscriptions
    private subscriptionMerge: ISubscription;
    private filterEmit: ISubscription;
    private dateEmit: ISubscription;
    private trackDetailSub: ISubscription;

    private lists: Array<any> = [];
    public filters: any = [];

    public createListGroup: FormGroup;
    public subscription: any;
    public trackCountryNames: any;
    private trackInfo: any;

    private trackCountryRtdData: any;
    private trackCountryData: any;
    private newTrackInfo: any = {};
    private trackRtdData: any;
    private trackOverview: any;
    private trackCountries: any = [];
    private trackCountriesTopFive: any;
    private trackRelatedTracks: any;

    private partnersStreams: any;
    private partnersDigitalTracks: any;
    private partnersDigitalAlbums: any;
    private partnersPhysicalAlbums: any;

    private freePaidPartners: any = [];
    private tracksFreePaidPartners: any = [];

    filteredCountryReports: any[];

    private partnersByMediaType: any;
    private partnersByMediaTypeStreams: any;
    private partnersByMediaTypeDigitalTracks: any;
    private mediaTypeSums: any;

    public bs: any;
    public defaultPeriod: any;
    public defaultDate: any;
    public defaultTerritory: any;

    sortedCountryReports: any[];
    sortedBy: string;
    ready: boolean;
    showRow: boolean = false;

    trackInit: boolean;

    userData = {};

    private overviewTerritory: any;
    private selectedCountry: any;

    private flattenedPartners: any;

    loadDataNumber: number = 0;

    public dataParams: Params;
    public testDataParams: any;
    public ID: number;

    constructor(public trackService: TrackDetailService,
        private globals: Globals,
        private route: ActivatedRoute,
        private location: Location,
        private router: Router,
        private http: Http,
        private ls: ListsService,
        private fsDate: FilterDatesService,
        private fs: FilterService,
        private apollo: Apollo,
        private sortService: SortService,
        private exportService: ExportService) {

        this.dateEmit = this.fsDate.componentMethodCalled$.subscribe(
            () => {
                this.loadData();
            });

        this.filterEmit = fs.TestServiceEmit.subscribe(
            event => this.loadData(),
            err => console.log(err),
            () => console.log('Event Fired!')
        );

        this.userData = JSON.parse(localStorage.getItem('currentUser'));
    }

    ngOnInit(): void {

      this.trackInit = true;
      this.fs.trackInit = this.trackInit;


        this.route.params.subscribe((params: Params) => {
			       this.ID = params['trackID'];
             this.filterArtistUrl();
        });

        this.trackDetailSub = this.route.queryParams.subscribe((params: Params) => {
            this.dataParams = params;
            this.testDataParams = Object.assign({}, this.dataParams);
            console.log('Data Params', this.testDataParams);
            //this.fs.Metadata(this.dataParams);
            this.filterArtistUrl();
        });
        //this.loadData();

        this.bs = false;
        this.fs.bs = this.bs;
        // console.log('trackActiveParams', this.fs.activeParams);

        // this.getLists();

        this.createListGroup = new FormGroup({
            listName: new FormControl('')
        });

		// console.log('newTrackInfo', this.newTrackInfo);

    }

    ngOnDestroy(): void {
        // console.log('Destroyed');
        this.subscriptionMerge.unsubscribe();
        this.filterEmit.unsubscribe();
        this.dateEmit.unsubscribe();
        this.trackDetailSub.unsubscribe();

        this.trackInit = false;
        this.fs.trackInit = this.trackInit;
    }

    // navigateTo(dest:string){
    //     let test = this.location.path().split('?')[1];
    //     let query = dest+'?'+test;
    //     if(test != undefined){
    //         this.router.navigateByUrl(query);
    //     }else{
    //         this.router.navigateByUrl(dest);
    //     }
    //     if(this.compRef){
    //         this.compRef.destroy();
    //     }
    // }

    filterArtistUrl() {

        if (this.location.path().includes('?')) {
            //Splits QueryParams from the baseurl
            let filterString = this.location.path().split('?');
            //Splits the Params into indiviual strings.
            let filters = filterString[1].split('&');
            let unWanted = ['genre', 'partner', 'label', 'labelType', 'rank'];

            // var testPromise = new Promise((resolve, reject) => {

            const keepIDs = filters.map(f => {
                return {
                key: f.split('=')[0],
                id: decodeURI(f.split('=')[1])
            }
            }).filter( f => {
                return unWanted.indexOf(f.key) < 0;
            }).map( f => { return f.id });

            console.log('keepIDs', keepIDs);

            filters = filters.filter(f => {
                const filterKey = f.split('=', 1)[0];
                const valueID = f.split('=', 1)[1];

                if (!(unWanted.indexOf(filterKey) < 0)) {
                    delete this.testDataParams[filterKey];
                    this.fs.activeParams[filterKey].shift();
                }
                return unWanted.indexOf(filterKey) < 0;
            });
            console.log('Before Artist Active Filters', this.fs.activeFilters);
            this.fs.activeFilters = this.fs.activeFilters.filter(f => {
                return keepIDs.indexOf(f.id) >= 0;
            });
            //     resolve();
            // });

            // testPromise.then(resolve => {
                this.fs.Metadata(this.testDataParams);
                console.log('After Artist Active Filters', this.fs.activeFilters);
                console.log('Artist Active Params', this.fs.activeParams);
                console.log('testDataParams', this.testDataParams);
            // });

            this.location.replaceState(filterString[0] + '?' + filters.join('&'));
        } else {
            this.fs.Metadata(this.testDataParams);
        }
    }

    loadData() {
        this.ready = false;
        let tempData;

        if (!this.fs.activeParams.date[0] && !this.fs.activeParams.territory[0]) {
			this.defaultPeriod = "Defaults: " + this.globals.defaultPeriod + " ";
			this.defaultDate = this.globals.defaultDate + ", ";
			this.defaultTerritory = this.globals.defaultTerritory;
        } else if (!this.fs.activeParams.date[0] && this.fs.activeParams.territory[0]) {
			this.defaultPeriod = "Defaults: " + this.globals.defaultPeriod + " ";
			this.defaultDate = this.globals.defaultDate;
			this.defaultTerritory = "";
        } else if (!this.fs.activeParams.territory[0] && this.fs.activeParams.date[0]) {
			this.defaultTerritory = "Defaults: " + this.globals.defaultTerritory;
			this.defaultPeriod = "";
			this.defaultDate = "";
        } else {
			this.defaultPeriod = "";
			this.defaultDate = "";
        }

        // console.log('LoadData fired this many times: ', this.loadDataNumber++);
        // console.log('dataParams', this.dataParams);

        this.newTrackInfo = [];
        this.trackRtdData = [];
        this.trackOverview = [];
        this.trackCountries = [];
        this.trackCountriesTopFive = {};
        this.flattenedPartners = [];

        if (this.fs.activeParams.territory.length > 0) {
            this.overviewTerritory = this.fs.activeParams.territory[0].id;
        } else {
            this.overviewTerritory = null;
        }

        // console.log('overviewTerritory', this.overviewTerritory);

        let source1 = this.trackService.getTrackData(this.ID);
        let source2 = this.trackService.getCountryData(this.ID);
        let source3 = this.trackService.getRelatedTracks(this.ID);
        let source4 = this.trackService.getTrackDataFreePaid(this.ID);

        this.subscription = Observable.forkJoin(source1, source2, source3, source4);

        this.subscriptionMerge = this.subscription.subscribe(
            res => tempData = res,
            err => console.log(err),
            () => {

              console.log('tempDataTrack', tempData);

                //Set new object to track object in raw response.
                this.tracksFreePaidPartners = tempData[3].track;
                this.trackRelatedTracks = tempData[2];
                this.trackCountryData = tempData[1].track;
                this.newTrackInfo = tempData[0].track;
                // console.log('trackRelatedTracks', this.trackRelatedTracks);

                this.trackService.artistName = this.newTrackInfo.artist.name;
                this.trackService.trackName = this.newTrackInfo.name;
                this.fs.trackName = this.newTrackInfo.name;
                this.fs.artistName = this.newTrackInfo.artist.name;

					//Lodash - flatten data object to prepare for ingesiton by the countries tab table.
					this.trackCountries = chain({}).merge(
						chain(this.trackCountryData.rtd)
							.filter(rtd => !!rtd.territory)
							.map(({ adjustedUnits, units, euro, territory }) => ({ adjustedRtdUnits: adjustedUnits, rtdUnits: units, rtdEuro: euro, territory }))
							.groupBy(rtd => rtd.territory.name)
							.value(),
						chain(this.trackCountryData.totals)
							.filter(tot => !!tot.territory)
							.map(({ adjustedUnits, units, euro, territory }) => ({ adjustedTotalUnitsAll: adjustedUnits.all, adjustedTotalUnits: adjustedUnits, totalUnits: units, totalEuro: euro, territory }))
							.groupBy(tot => tot.territory.name)
							.value(),
						chain(this.trackCountryData.previous)
							.filter(prev => !!prev.territory)
							.map(({ adjustedUnits, units, euro, territory }) => ({ adjustedPreviousUnitsAll: adjustedUnits.all, adjustedPreviousUnits: adjustedUnits, previousUnits: units, previousEuro: euro, territory }))
							.groupBy(prev => prev.territory.name)
							.value(),
					)
						.values()
						.flatten()
						.value();

					this.trackCountries = _.sortBy(this.trackCountries, [(x) => { return x.adjustedTotalUnitsAll || '' }], ['desc']).reverse();
          this.exportService.trackCountries = this.trackCountries;

					// this.sortByCountriesThisPeriodWithoutToggling();

          this.selectedCountry = this.trackCountries[0].territory.name;

          this.trackCountryNames = this.trackCountries;

          this.trackService.selectCountry(this.trackCountries[0].territory);
          this.trackService.selectCountryNames(this.trackCountryNames);

					// console.log('trackCountries', this.trackCountries);

					//Lodash - flatten raw data object to prepare for ingestion by partners tab table.
					this.flattenedPartners = chain({}).merge(
						// chain(this.newTrackInfo.rtd)
						// 	.filter(rtd => !!rtd.partner)
						// 	.map(({ adjustedUnits, units, euro, partner }) => ({ adjustedRtdUnits: adjustedUnits, rtdUnits: units, totalRtdEuro: euro, partnerName: partner.name, partner }))
						// 	.groupBy(rtd => rtd.partner.name)
						// 	.value(),
						// chain(this.newTrackInfo.totals)
						// 	.filter(tot => !!tot.partner)
						// 	.map(({ adjustedUnits, units, euro, partner }) => ({ adjustedTotalUnitsAll: adjustedUnits.all, adjustedTotalUnitsStreams: adjustedUnits.streams, adjustedTotalUnits: adjustedUnits, totalUnits: units, totalEuros: euro, partnerName: partner.name, partner }))
						// 	.groupBy(tot => tot.partner.name)
						// 	.value(),
						// chain(this.newTrackInfo.previous)
						// 	.filter(prev => !!prev.partner)
						// 	.map(({ adjustedUnits, units, euro, partner }) => ({ adjustedPreviousUnits: adjustedUnits, previousUnits: units, totalPreviousEuro: euro, partnerName: partner.name, partner }))
						// 	.groupBy(prev => prev.partner.name)
						// 	.value(),
              chain(this.tracksFreePaidPartners.rtd)
                .filter(rtd => !!rtd.partner)
                .map(({ adjustedUnits, units, euro, partner, freeAdjustedUnits, freeUnits, paidAdjustedUnits, paidUnits }) => ({ freeAdjustedRtdUnits: freeAdjustedUnits, freeRtdUnits: freeUnits, paidAdjustedRtdUnits: paidAdjustedUnits, paidRtdUnits: paidUnits, adjustedRtdUnits: adjustedUnits, rtdUnits: units, totalRtdEuro: euro, partnerName: partner.name, partner }))
							.groupBy(rtd => rtd.partner.name)
                .value(),
              chain(this.tracksFreePaidPartners.totals)
                .filter(tot => !!tot.partner)
                .map(({ adjustedUnits, units, euro, partner, freeAdjustedUnits, freeUnits, paidAdjustedUnits, paidUnits }) => ({ freeAdjustedTotalUnits: freeAdjustedUnits, freeTotalUnits: freeUnits, paidAdjustedTotalUnits: paidAdjustedUnits, paidTotalUnits: paidUnits, adjustedTotalUnitsAll: adjustedUnits.all, adjustedTotalUnitsStreams: adjustedUnits.streams, adjustedTotalUnits: adjustedUnits, totalUnits: units, totalEuros: euro, partnerName: partner.name, partner }))
							.groupBy(tot => tot.partner.name)
                .value(),
              chain(this.tracksFreePaidPartners.previous)
                .filter(prev => !!prev.partner)
                .map(({ adjustedUnits, units, euro, partner, freeAdjustedUnits, freeUnits, paidAdjustedUnits, paidUnits }) => ({ freeAdjustedPreviousUnits: freeAdjustedUnits, freePreviousUnits: freeUnits, paidAdjustedPreviousUnits: paidAdjustedUnits, paidPreviousUnits: paidUnits, adjustedPreviousUnits: adjustedUnits, previousUnits: units, totalPreviousEuro: euro, partnerName: partner.name, partner }))
							.groupBy(prev => prev.partner.name)
                .value(),
					)
						.values()
						.flatten()
						.value();

          console.log('freePaid', this.flattenedPartners);

					this.flattenedPartners = _.sortBy(this.flattenedPartners, [(x) => { return x.adjustedTotalUnitsAll || '' }], ['desc']).reverse();

          this.exportService.trackPartnerData = this.flattenedPartners;

					// console.log('flattenedPartners', this.flattenedPartners);

          //Lodash - Data transforms for Streams Overview Section
          this.partnersStreams = chain({}).merge(
              chain(this.newTrackInfo.totals)
                  .filter(tot => !!tot.partner)
                  .map(({ units, partner }) => ({ partnerName: partner.name, tpStreams: units.streams }))
                  .value(),
          )
              .values()
              .flatten()
              .value();
          this.partnersStreams = _.sortBy(this.partnersStreams, 'tpStreams').reverse();
          this.partnersStreams = this.partnersStreams.slice(0, 6);
          // console.log(this.partnersStreams)

          //Lodash - Data transforms for Digital Tracks Overview Section
          this.partnersDigitalTracks = chain({}).merge(
              chain(this.newTrackInfo.totals)
                  .filter(tot => !!tot.partner)
                  .map(({ units, partner }) => ({ partnerName: partner.name, tpDigitalTracks: units.digitalTracks }))
                  .value(),
          )
              .values()
              .flatten()
              .value();
          this.partnersDigitalTracks = _.sortBy(this.partnersDigitalTracks, 'tpDigitalTracks').reverse();
          this.partnersDigitalTracks = this.partnersDigitalTracks.slice(0, 6);

				if (this.overviewTerritory === null) {
					this.trackOverview = chain({}).merge(
						chain(this.newTrackInfo.rtd)
							.filter(rtd => rtd.territory === null && rtd.partner === null)
							.map(({ adjustedUnits, units, euro }) => ({ adjustedRtdUnits: adjustedUnits.all, rtdUnits: units.all, rtdEuro: euro.all, adjustedRtdStreams: adjustedUnits.streams, rtdStreams: units.streams }))
							.value(),
						chain(this.newTrackInfo.totals)
							.filter(tot => tot.territory === null && tot.partner === null)
							.map(({ adjustedUnits, units, euro }) => ({ adjustedTpUnits: adjustedUnits.all, tpUnits: units.all, tpEuro: euro.all, adjustedTpStreams: adjustedUnits.streams, tpStreams: units.streams }))
							.value(),
						chain(this.newTrackInfo.previous)
							.filter(prev => prev.territory === null && prev.partner === null)
							.map(({ adjustedUnits, units, euro }) => ({ adjustedPreviousUnits: adjustedUnits.all, previousUnits: units.all, previousEuro: euro.all }))
							.value(),
					)
						.values()
						.flatten()
						.value();
				} else {
					this.trackOverview = chain({}).merge(
						chain(this.newTrackInfo.rtd)
							.filter(rtd => !!rtd.territory && rtd.territory.id === this.overviewTerritory && rtd.partner === null)
							.map(({ adjustedUnits, units, euro }) => ({ adjustedRtdUnits: adjustedUnits.all, rtdUnits: units.all, rtdEuro: euro.all, adjustedRtdStreams: adjustedUnits.streams, rtdStreams: units.streams }))
							.value(),
						chain(this.newTrackInfo.totals)
							.filter(tot => !!tot.territory && tot.territory.id === this.overviewTerritory && tot.partner === null)
							.map(({ adjustedUnits, units, euro }) => ({ adjustedTpUnits: adjustedUnits.all, tpUnits: units.all, tpEuro: euro.all, adjustedTpStreams: adjustedUnits.streams, tpStreams: units.streams }))
							.value(),
						chain(this.newTrackInfo.previous)
							.filter(prev => !!prev.territory && prev.territory.id === this.overviewTerritory && prev.partner === null)
							.map(({ adjustedUnits, units, euro }) => ({ adjustedPreviousUnits: adjustedUnits.all, previousUnits: units.all, previousEuro: euro.all }))
							.value(),
					)
						.values()
						.flatten()
						.value();
				}
				console.log('trackOverview', this.trackOverview);

        this.trackRelatedTracks = chain({}).merge(
                chain(this.trackRelatedTracks.rtd)
                  .filter(rtd => !!rtd.isrc)
                  .map(({ adjustedUnits, units, isrc }) => ({
                    isrcId: isrc.id, isrc, adjustedRtdUnits: adjustedUnits.all, adjustedRtdStreams: adjustedUnits.streams, adjustedRtdAudioStreams: adjustedUnits.audioStreams, adjustedRtdVideoStreams: adjustedUnits.videoStreams, adjustedRtdDigitalTracks: adjustedUnits.digitalTracks,
                    rtdUnits: units.all, rtdStreams: units.streams, rtdAudioStreams: units.audioStreams, rtdVideoStreams: units.videoStreams, rtdDigitalTracks: units.digitalTracks
                  }))
                              .groupBy(rtd => rtd.isrc.id)
                  .value(),
                          chain(this.trackRelatedTracks.totals)
                              .filter(tot => !!tot.isrc)
                              .map(({ adjustedUnits, units, isrc, track, project }) => ({
                    projectId: isrc.track.project.id, track, isrcId: isrc.id, isrc, isrcName: isrc.name, isrcVersionName: isrc.version, isrcReleaseDate: isrc.earliestReleaseDate, adjustedTotalUnits: adjustedUnits.all, adjustedTotalStreams: adjustedUnits.streams, adjustedTotalAudioStreams: adjustedUnits.audioStreams, adjustedTotalVideoStreams: adjustedUnits.videoStreams, adjustedTotalDigitalTracks: adjustedUnits.digitalTracks,
                    totalUnits: units.all, totalStreams: units.streams, totalAudioStreams: units.audioStreams, totalVideoStreams: units.videoStreams, totalDigitalTracks: units.digitalTracks
                  }))
                              .groupBy(tot => tot.isrc.id)
                              .value(),
                          chain(this.trackRelatedTracks.previous)
                              .filter(prev => !!prev.isrc)
                              .map(({ adjustedUnits, units, isrc }) => ({
                    isrcId: isrc.id, isrc, adjustedPreviousUnits: adjustedUnits.all, adjustedPreviousStreams: adjustedUnits.streams, adjustedPreviousAudioStreams: adjustedUnits.audioStreams, adjustedPreviousVideoStreams: adjustedUnits.videoStreams, adjustedPreviousDigitalTracks: adjustedUnits.digitalTracks,
                    previousUnits: units.all, previousStreams: units.streams, previousAudioStreams: units.audioStreams, previousVideoStreams: units.videoStreams, previousDigitalTracks: units.digitalTracks
                  }))
                              .groupBy(prev => prev.isrc.id)
                              .value(),
                      )
                          .values()
                          .flatten()
                          .value();

        this.trackRelatedTracks = _.sortBy(this.trackRelatedTracks, [(x) => { return x.adjustedTotalUnits || '' }], ['desc']).reverse();

        // this.artistTrackData = _.sortBy(this.artistTrackData, [(x) => { return x.adjustedTotalUnits || '' }], ['desc']).reverse();
        this.exportService.trackRelatedTracks = this.trackRelatedTracks;

        console.log('trackRelatedTracks', this.trackRelatedTracks);

        this.ready = true;

            });
    }

    partner: string = "";

    toggleRow(index: number, partner: string) {
      if (this.partner == partner) {
        this.partner = "";
      } else {
      this.partner = partner;
    }
    }

    toggleAll(){
      this.partner = "";
      this.showRow = !this.showRow;
    }

    // findList(name: string) {
    //     this.lists.filter(function(obj) {
    //         return obj.listName == name;
    //     });
    // }

    // addToList(name: string) {
    //     let obj;
    //     this.ls.getLists().subscribe(
    //         res => {
    //             obj = res.filter(function(obj) {
    //                 return obj.listName == name;
    //             });
    //         },
    //         err => console.log(err),
    //         () => {
    //             console.log(obj);
    //             this.ls.updateList(obj[0]._id, 'artists', 'null', 'add', this.artistInfo[0])
    //                 .subscribe(
    //                 res => { },
    //                 err => console.log(err),
    //                 () => console.log('ADDED TO LIST')
    //                 );
    //         }
    //     );
    // }

    // sortByCountriesRTD() {
    //     this.sortService.toggleOrder();
    //     this.filteredCountryReports = this.sortService.sort('rtd', (a: any, b: any) => (a.adjustedRtdUnits.all > b.adjustedRtdUnits.all) - (a.adjustedRtdUnits.all < b.adjustedRtdUnits.all), this.filteredCountryReports);
    //     this.exportService.artistCountriesData = this.filteredCountryReports;
    // }
    //
    // sortByCountriesName() {
    //     this.sortService.toggleOrder();
    //     this.filteredCountryReports = this.sortService.sort('countryname', (a: any, b: any) => a.territory.name.localeCompare(b.territory.name), this.filteredCountryReports);
    //     this.exportService.artistCountriesData = this.filteredCountryReports;
    // }
    // sortByCountriesThisPeriodWithoutToggling() {
    //     //Must refine. Must bring the null values.
    //     this.filteredCountryReports = this.artistCountries.filter(res => res.adjustedTotalUnitsAll != null);
    //     this.filteredCountryReports = this.sortService.sort('thisperiod', (a, b) => (a.adjustedTotalUnitsAll > b.adjustedTotalUnitsAll) - (a.adjustedTotalUnitsAll < b.adjustedTotalUnitsAll), this.filteredCountryReports);
    //     this.exportService.artistCountriesData = this.filteredCountryReports;
    // }
    // sortByCountriesThisPeriod() {
    //     this.sortService.toggleOrder();
    //     this.filteredCountryReports = this.sortService.sort('thisperiod', (a: any, b: any) => (a.adjustedTotalUnitsAll > b.adjustedTotalUnitsAll) - (a.adjustedTotalUnitsAll < b.adjustedTotalUnitsAll), this.filteredCountryReports);
    //     this.exportService.artistCountriesData = this.filteredCountryReports;
    // }
    // sortByCountriesStreams() {
    //     this.sortService.toggleOrder();
    //     this.filteredCountryReports = this.sortService.sort('streams', (a: any, b: any) => (a.totalUnits.streams > b.totalUnits.streams) - (a.totalUnits.streams < b.totalUnits.streams), this.filteredCountryReports);
    //     this.exportService.artistCountriesData = this.filteredCountryReports;
    // }
    // sortByCountriesDigitalAlbums() {
    //     this.sortService.toggleOrder();
    //     this.filteredCountryReports = this.sortService.sort('digitalAlbums', (a: any, b: any) => (a.totalUnits.digitalAlbums > b.totalUnits.digitalAlbums) - (a.totalUnits.digitalAlbums < b.totalUnits.digitalAlbums), this.filteredCountryReports);
    //     this.exportService.artistCountriesData = this.filteredCountryReports;
    // }
    // sortByCountriesPhyiscalAlbums() {
    //     this.sortService.toggleOrder();
    //     this.filteredCountryReports = this.sortService.sort('physicalAlbums', (a: any, b: any) => (a.totalUnits.physicalAlbums > b.totalUnits.physicalAlbums) - (a.totalUnits.physicalAlbums < b.totalUnits.physicalAlbums), this.filteredCountryReports);
    //     this.exportService.artistCountriesData = this.filteredCountryReports;
    // }
    // sortByCountriesDigitalTracks() {
    //     this.sortService.toggleOrder();
    //     this.filteredCountryReports = this.sortService.sort('digitalTracks', (a: any, b: any) => (a.totalUnits.digitalTracks > b.totalUnits.digitalTracks) - (a.totalUnits.digitalTracks < b.totalUnits.digitalTracks), this.filteredCountryReports);
    //     this.exportService.artistCountriesData = this.filteredCountryReports;
    // }
}
