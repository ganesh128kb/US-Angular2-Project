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
import { ProjectDetailService } from './project.service';
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
    selector: 'projectDetail',
    templateUrl: './project.component.html',
    styleUrls: ['../../../assets/sass/details.component.sass']
})

export class ProjectDetailComponent implements OnInit {

    //Subscriptions
    private subscriptionMerge: ISubscription;
    private filterEmit: ISubscription;
    private dateEmit: ISubscription;
    private projectDetailSub: ISubscription;

    private lists: Array<any> = [];
    public filters: any = [];

    public createListGroup: FormGroup;
    public subscription: any;
    public projectCountryNames: any;
    private artistInfo: any;

    private projectData: any;
    private projectAlbumData: any;
    private projectTrackData: any;
    private newProjectInfo: any = {};
    private projectCountryData: any;
    private projectOverview: any;
    private projectCountries: any;
    private projectCountriesTopFive: any;
    private partnersStreams: any;
    private partnersDigitalTracks: any;
    private partnersDigitalAlbums: any;
    private partnersPhysicalAlbums: any;

    filteredCountryReports: any[];

    private partnersByMediaType: any;
    private partnersByMediaTypeStreams: any;
    private partnersByMediaTypeDigitalTracks: any;
    private partnersByMediaTypeDigitalAlbums: any;
    private partnersByMediaTypePhysicalAlbums: any;
    private mediaTypeSums: any;

    public bs: any;
    public defaultPeriod: any;
    public defaultDate: any;
    public defaultTerritory: any;

    sortedCountryReports: any[];
    sortedBy: string;
    ready: boolean;

    private overviewTerritory: any;

    private selectedCountry: any;

    private flattenedPartners: any;

    loadDataNumber: number = 0;

    public dataParams: Params;
    public testDataParams: any;
    public ID: number;

    userData = {};

    projectInit: boolean;

    constructor(public projectService: ProjectDetailService,
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

        this.dateEmit = fsDate.componentMethodCalled$.subscribe(
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
        this.projectInit = true;
        this.fs.projectInit = this.projectInit;
        // console.log('Project OnInit');
        //removes unaccepted Parameters in the url.
        //this.filterArtistUrl();

        this.route.params.subscribe((params: Params) => {
			this.ID = params['projectID'];
      this.filterArtistUrl();
        });

        this.projectDetailSub = this.route.queryParams.subscribe((params: Params) => {
            this.dataParams = params;
            this.testDataParams = Object.assign({}, this.dataParams);
            console.log('Data Params', this.testDataParams);
            //this.fs.Metadata(this.dataParams);
            this.filterArtistUrl();
        });
        //this.loadData();

        this.bs = false;
        this.fs.bs = this.bs;
        // console.log('artistActiveParams', this.fs.activeParams);

        // this.getLists();

        this.createListGroup = new FormGroup({
            listName: new FormControl('')
        });

    }

    ngOnDestroy(): void {
        // console.log('Destroyed');
        this.subscriptionMerge.unsubscribe();
        this.filterEmit.unsubscribe();
        this.dateEmit.unsubscribe();
        this.projectDetailSub.unsubscribe();

        this.projectInit = false;
        this.fs.projectInit = this.projectInit;
    }

    navigateTo(dest: string) {
        let test = this.location.path().split('?')[1];
        let query = dest + '?' + test;
        if (test != undefined) {
            this.router.navigateByUrl(query);
        } else {
            this.router.navigateByUrl(dest);
        }
    }

    filterArtistUrl() {

        if (this.location.path().includes('?')) {
            //Splits QueryParams from the baseurl
            let filterString = this.location.path().split('?');
            //Splits the Params into indiviual strings.
            let filters = filterString[1].split('&');
            let unWanted = ['genre', 'partner', 'label', 'labelType', 'rank'];

            // var testPromise = new Promise((resolve, reject) => {

            const keepIDs = filters.map(f => {
                let fSplit = f.split('=');
                return {
					key: fSplit[0],
					id: decodeURIComponent(fSplit[1])
				}
            }).filter(f => {
                return unWanted.indexOf(f.key) < 0;
            }).map(f => { return f.id });

            // console.log('keepIDs', keepIDs);

            filters = filters.filter(f => {
                const filterKey = f.split('=', 1)[0];
                const valueID = f.split('=', 1)[1];

                if (!(unWanted.indexOf(filterKey) < 0)) {
                    delete this.testDataParams[filterKey];
                    this.fs.activeParams[filterKey].shift();
                }
                return unWanted.indexOf(filterKey) < 0;
            });
            // console.log('Before Project Active Filters', this.fs.activeFilters);

            this.fs.activeFilters = this.fs.activeFilters.filter(f => {
                return keepIDs.indexOf(f.id) >= 0;
            });
            //     resolve();
            // });

            // testPromise.then(resolve => {
			this.fs.Metadata(this.testDataParams);
			// console.log('After Artist Active Filters', this.fs.activeFilters);
			// console.log('Artist Active Params', this.fs.activeParams);
			// console.log('testDataParams', this.testDataParams);
            // });

            this.location.replaceState(filterString[0] + '?' + filters.join('&'));
        } else {
            this.fs.Metadata(this.testDataParams);
        }
    }

    loadData() {
        this.ready = false;
        let tempData;

        // console.log('LoadData fired this many times: ', this.loadDataNumber++);
        // console.log('dataParams', this.dataParams);

        this.newProjectInfo = [];
        this.projectOverview = [];
        this.projectCountries = {};
        this.projectCountriesTopFive = {};
        this.flattenedPartners = [];

        if (this.fs.activeParams.territory.length > 0) {
            this.overviewTerritory = this.fs.activeParams.territory[0].id;
        } else {
            this.overviewTerritory = null;
        }

        // console.log('overviewTerritory', this.overviewTerritory);

        let source1 = this.projectService.getProjectData(this.ID);
        let source2 = this.projectService.getCountryData(this.ID);
        let source3 = this.projectService.getProjectTrackData(this.ID);
        let source4 = this.projectService.getProjectAlbumData(this.ID);

        this.subscription = Observable.forkJoin(source1, source2, source3, source4);

        this.subscriptionMerge = this.subscription.subscribe(
            res => tempData = res,
            err => console.log(err),
            () => {
                // console.log('tempData', tempData);

                //Set new object to artist object in raw response.
                this.projectAlbumData = tempData[3];
                this.projectTrackData = tempData[2];
                this.projectCountryData = tempData[1].project;
                this.newProjectInfo = tempData[0].project;

                this.projectService.projectName = this.newProjectInfo.name;
                this.fs.projectName = this.newProjectInfo.name;

                console.log('projectAlbumData', this.projectAlbumData);

                if (this.overviewTerritory === null) {
					this.projectOverview = chain({}).merge(
						chain(this.newProjectInfo.rtd)
							.filter(rtd => rtd.territory === null && rtd.partner === null)
							.map(({ adjustedUnits, units, euro }) => ({ adjustedRtdUnits: adjustedUnits.all, rtdUnits: units.all, rtdEuro: euro.all, adjustedRtdStreams: adjustedUnits.streams, rtdStreams: units.streams }))
							.value(),
						chain(this.newProjectInfo.totals)
							.filter(tot => tot.territory === null && tot.partner === null)
							.map(({ adjustedUnits, units, euro }) => ({ adjustedTpUnits: adjustedUnits.all, tpUnits: units.all, tpEuro: euro.all, adjustedTpStreams: adjustedUnits.streams, tpStreams: units.streams }))
							.value(),
						chain(this.newProjectInfo.previous)
							.filter(prev => prev.territory === null && prev.partner === null)
							.map(({ adjustedUnits, units, euro }) => ({ adjustedPreviousUnits: adjustedUnits.all, previousUnits: units.all, previousEuro: euro.all }))
							.value(),
					)
						.values()
						.flatten()
						.value();

                } else {
					this.projectOverview = chain({}).merge(
						chain(this.newProjectInfo.rtd)
							.filter(rtd => !!rtd.territory && rtd.territory.id === this.overviewTerritory && rtd.partner === null)
							.map(({ adjustedUnits, units, euro }) => ({ adjustedRtdUnits: adjustedUnits.all, rtdUnits: units.all, rtdEuro: euro.all, adjustedRtdStreams: adjustedUnits.streams, rtdStreams: units.streams }))
							.value(),
						chain(this.newProjectInfo.totals)
							.filter(tot => !!tot.territory && tot.territory.id === this.overviewTerritory && tot.partner === null)
							.map(({ adjustedUnits, units, euro }) => ({ adjustedTpUnits: adjustedUnits.all, tpUnits: units.all, tpEuro: euro.all, adjustedTpStreams: adjustedUnits.streams, tpStreams: units.streams }))
							.value(),
						chain(this.newProjectInfo.previous)
							.filter(prev => !!prev.territory && prev.territory.id === this.overviewTerritory && prev.partner === null)
							.map(({ adjustedUnits, units, euro }) => ({ adjustedPreviousUnits: adjustedUnits.all, previousUnits: units.all, previousEuro: euro.all }))
							.value(),
					)
						.values()
						.flatten()
						.value();
                }

                //this change happened with latest gql update (06/19/17) -- need to verify why and if the numbers have changed. Object comes back with duplicated entities.
                // this.artistOverview = [this.artistOverview[0]];
                // console.log('projectOverview', this.projectOverview);

                //Lodash - flatten data object to prepare for ingesiton by the countries tab table.
                this.projectCountries = chain({}).merge(
                    chain(this.projectCountryData.rtd)
                        .filter(rtd => !!rtd.territory)
                        .map(({ adjustedUnits, units, euro, territory }) => ({ adjustedRtdUnits: adjustedUnits, rtdUnits: units, rtdEuro: euro, territory }))
                        .groupBy(rtd => rtd.territory.name)
                        .value(),
                    chain(this.projectCountryData.totals)
                        .filter(tot => !!tot.territory)
                        .map(({ adjustedUnits, units, euro, territory }) => ({ adjustedTotalUnitsAll: adjustedUnits.all, adjustedTotalUnits: adjustedUnits, totalUnits: units, totalEuro: euro, territory }))
                        .groupBy(tot => tot.territory.name)
                        .value(),
                    chain(this.projectCountryData.previous)
                        .filter(prev => !!prev.territory)
                        .map(({ adjustedUnits, units, euro, territory }) => ({ adjustedPreviousUnitsAll: adjustedUnits.all, adjustedPreviousUnits: adjustedUnits, previousUnits: units, previousEuro: euro, territory }))
                        .groupBy(prev => prev.territory.name)
                        .value(),
                )
                    .values()
                    .flatten()
                    .value();

                this.projectCountries = _.sortBy(this.projectCountries, [(x) => { return x.adjustedTotalUnitsAll || '' }], ['desc']).reverse();

                this.selectedCountry = this.projectCountries[0].territory.name;

                this.projectCountryNames = this.projectCountries;

                this.projectService.selectCountry(this.projectCountries[0].territory);
                this.projectService.selectCountryNames(this.projectCountryNames);

                // console.log('projectCountries', this.projectCountries);

                //Lodash - flatten raw data object to prepare for ingestion by partners tab table.
                this.flattenedPartners = chain({}).merge(
                    chain(this.newProjectInfo.rtd)
                        .filter(rtd => !!rtd.partner)
                        .map(({ adjustedUnits, units, euro, partner }) => ({ adjustedRtdUnits: adjustedUnits, rtdUnits: units, totalRtdEuro: euro, partnerName: partner.name, partner }))
                        .groupBy(rtd => rtd.partner.name)
                        .value(),
                    chain(this.newProjectInfo.totals)
                        .filter(tot => !!tot.partner)
                        .map(({ adjustedUnits, units, euro, partner }) => ({ adjustedTotalUnitsAll: adjustedUnits.all, adjustedTotalUnitsStreams: adjustedUnits.streams, adjustedTotalUnits: adjustedUnits, totalUnits: units, totalEuros: euro, partnerName: partner.name, partner }))
                        .groupBy(tot => tot.partner.name)
                        .value(),
                    chain(this.newProjectInfo.previous)
                        .filter(prev => !!prev.partner)
                        .map(({ adjustedUnits, units, euro, partner }) => ({ adjustedPreviousUnits: adjustedUnits, previousUnits: units, totalPreviousEuro: euro, partnerName: partner.name, partner }))
                        .groupBy(prev => prev.partner.name)
                        .value(),
                )
                    .values()
                    .flatten()
                    .value();

                this.flattenedPartners = _.sortBy(this.flattenedPartners, [(x) => { return x.adjustedTotalUnitsAll || '' }], ['desc']).reverse();

                // console.log('flattenedPartners', this.flattenedPartners);

                this.partnersByMediaType = chain({}).merge(
                    chain(this.newProjectInfo.rtd)
                        .filter(rtd => !!rtd.partner)
                        .map(({ adjustedUnits, units, euro, partner }) => ({
                            adjustedRtdStreams: adjustedUnits.streams, adjustedRtdDigitalTracks: adjustedUnits.digitalTracks, rtdDigitalAlbums: units.digitalAlbums, rtdPhysicalAlbums: units.physicalAlbums,
                            euroRtdStreams: euro.streams, euroRtdDigitalTracks: euro.digitalTracks, euroRtdDigitalAlbums: euro.digitalAlbums, euroRtdPhysicalAlbums: euro.physicalAlbums, partnerName: partner.name, partner
                        }))
                        .groupBy(rtd => rtd.partner.name)
                        .value(),
                    chain(this.newProjectInfo.totals)
                        .filter(tot => !!tot.partner)
                        .map(({ adjustedUnits, units, euro, partner }) => ({
                            adjustedTotalStreams: adjustedUnits.streams, adjustedTotalDigitalTracks: adjustedUnits.digitalTracks, totalDigitalAlbums: units.digitalAlbums, totalPhysicalAlbums: units.physicalAlbums,
                            euroTotalsStreams: euro.streams, euroTotalsDigitalTracks: euro.digitalTracks, euroTotalsDigitalAlbums: euro.digitalAlbums, euroTotalsPhysicalAlbums: euro.physicalAlbums, partnerName: partner.name, partner
                        }))
                        .groupBy(tot => tot.partner.name)
                        .value(),
                    chain(this.newProjectInfo.previous)
                        .filter(prev => !!prev.partner)
                        .map(({ adjustedUnits, units, euro, partner }) => ({
                            adjustedPreviousStreams: adjustedUnits.streams, adjustedPreviousDigitalTracks: adjustedUnits.digitalTracks, previousDigitalAlbums: units.digitalAlbums, previousPhysicalAlbums: units.physicalAlbums,
                            euroPreviousStreams: euro.streams, euroPreviousDigitalTracks: euro.digitalTracks, euroPreviousDigitalAlbums: euro.digitalAlbums, euroPreviousPhysicalAlbums: euro.physicalAlbums, partnerName: partner.name, partner
                        }))
                        .groupBy(prev => prev.partner.name)
                        .value(),
                )
                    .values()
                    .flatten()
                    .value();

                // console.log('partnersByMediaType', this.partnersByMediaType);

                this.mediaTypeSums = _(this.partnersByMediaType)
                    .groupBy('date')
                    .map((v, k) => ({
                        adjustedUnitsStreamsSum: _.sumBy(v, 'adjustedTotalStreams'),
                        adjustedunitsDigitalTracksSum: _.sumBy(v, 'adjustedTotalDigitalTracks'),
                        unitsDigitalAlbumsSum: _.sumBy(v, 'totalDigitalAlbums'),
                        unitsPhysicalAlbumsSum: _.sumBy(v, 'totalPhysicalAlbums'),
                    })).value();

                // console.log('mediaTypeSums', this.mediaTypeSums);

                this.partnersByMediaTypeStreams = _.sortBy(this.partnersByMediaType, [(x) => { return x.adjustedTotalStreams || '' }], ['desc']).reverse();
                // console.log('partnersByMediaTypeStreams', this.partnersByMediaType);
                this.exportService.partnersByMediaTypeStreamsData = this.partnersByMediaTypeStreams;

                this.partnersByMediaTypeDigitalTracks = _.sortBy(this.partnersByMediaType, [(x) => { return x.adjustedTotalDigitalTracks || '' }], ['desc']).reverse();
                this.exportService.partnersByMediaTypeDigitalTracksData = this.partnersByMediaTypeDigitalTracks;

                this.partnersByMediaTypeDigitalAlbums = _.sortBy(this.partnersByMediaType, [(x) => { return x.totalDigitalAlbums || '' }], ['desc']).reverse();
                this.exportService.partnersByMediaTypeDigitalAlbumsData = this.partnersByMediaTypeDigitalAlbums;

                this.partnersByMediaTypePhysicalAlbums = _.sortBy(this.partnersByMediaType, [(x) => { return x.totalPhysicalAlbums || '' }], ['desc']).reverse();
                this.exportService.partnersByMediaTypePhysicalAlbumsData = this.partnersByMediaTypePhysicalAlbums;

                // console.log('partnersByMediaTypePhysicalAlbums', this.partnersByMediaTypePhysicalAlbums);

                //Lodash - Data transforms for Streams Overview Section
                this.partnersStreams = chain({}).merge(
                    chain(this.newProjectInfo.totals)
                        .filter(tot => !!tot.partner)
                        .map(({ units, partner }) => ({ partnerName: partner.name, tpStreams: units.streams }))
                        .value(),
                )
                    .values()
                    .flatten()
                    .value();
                this.partnersStreams = _.sortBy(this.partnersStreams, 'tpStreams').reverse();
                this.partnersStreams = this.partnersStreams.slice(0, 6);
                // console.log('partnersStreams', this.partnersStreams);

                //Lodash - Data transforms for Digital Tracks Overview Section
                this.partnersDigitalTracks = chain({}).merge(
                    chain(this.newProjectInfo.totals)
                        .filter(tot => !!tot.partner)
                        .map(({ units, partner }) => ({ partnerName: partner.name, tpDigitalTracks: units.digitalTracks }))
                        .value(),
                )
                    .values()
                    .flatten()
                    .value();
                this.partnersDigitalTracks = _.sortBy(this.partnersDigitalTracks, 'tpDigitalTracks').reverse();
                this.partnersDigitalTracks = this.partnersDigitalTracks.slice(0, 6);
                // console.log(this.partnersDigitalTracks)

                //Lodash - Data transforms for Digital Albums Overview Section
                this.partnersDigitalAlbums = chain({}).merge(
                    chain(this.newProjectInfo.totals)
                        .filter(tot => !!tot.partner)
                        .map(({ units, partner }) => ({ partnerName: partner.name, tpDigitalAlbums: units.digitalAlbums }))
                        .value(),
                )
                    .values()
                    .flatten()
                    .value();
                this.partnersDigitalAlbums = _.sortBy(this.partnersDigitalAlbums, 'tpDigitalAlbums').reverse();
                this.partnersDigitalAlbums = this.partnersDigitalAlbums.slice(0, 6);
                // console.log(this.partnersDigitalAlbums)

                //Lodash - Data transforms for Physical Albums Overview Section
                this.partnersPhysicalAlbums = chain({}).merge(
                    chain(this.newProjectInfo.totals)
                        .filter(tot => !!tot.partner)
                        .map(({ units, partner }) => ({ partnerName: partner.name, tpPhysicalAlbums: units.physicalAlbums }))
                        .value(),
                )
                    .values()
                    .flatten()
                    .value();
                this.partnersPhysicalAlbums = _.sortBy(this.partnersPhysicalAlbums, 'tpPhysicalAlbums').reverse();
                this.partnersPhysicalAlbums = this.partnersPhysicalAlbums.slice(0, 6);
                // console.log(this.partnersPhysicalAlbums)

                this.projectTrackData = chain({}).merge(
					chain(this.projectTrackData.rtd)
						.filter(rtd => !!rtd.track)
						.map(({ adjustedUnits, units, track }) => ({
							trackId: track.id, track, adjustedRtdUnits: adjustedUnits.all, adjustedRtdStreams: adjustedUnits.streams, adjustedRtdAudioStreams: adjustedUnits.audioStreams, adjustedRtdVideoStreams: adjustedUnits.videoStreams, adjustedRtdDigitalTracks: adjustedUnits.digitalTracks,
							rtdUnits: units.all, rtdStreams: units.streams, rtdAudioStreams: units.audioStreams, rtdVideoStreams: units.videoStreams, rtdDigitalTracks: units.digitalTracks
						}))
                        .groupBy(rtd => rtd.track.id)
						.value(),
                    chain(this.projectTrackData.totals)
                        .filter(tot => !!tot.track)
                        .map(({ adjustedUnits, units, track }) => ({
							artistId: track.artist.id, projectId: track.project.id, trackId: track.id, track, trackName: track.name, trackReleaseDate: track.earliestReleaseDate, adjustedTotalUnits: adjustedUnits.all, adjustedTotalStreams: adjustedUnits.streams, adjustedTotalAudioStreams: adjustedUnits.audioStreams, adjustedTotalVideoStreams: adjustedUnits.videoStreams, adjustedTotalDigitalTracks: adjustedUnits.digitalTracks,
							totalUnits: units.all, totalStreams: units.streams, totalAudioStreams: units.audioStreams, totalVideoStreams: units.videoStreams, totalDigitalTracks: units.digitalTracks
						}))
                        .groupBy(tot => tot.track.id)
                        .value(),
                    chain(this.projectTrackData.previous)
                        .filter(prev => !!prev.track)
                        .map(({ adjustedUnits, units, track }) => ({
							trackId: track.id, track, adjustedPreviousUnits: adjustedUnits.all, adjustedPreviousStreams: adjustedUnits.streams, adjustedPreviousAudioStreams: adjustedUnits.audioStreams, adjustedPreviousVideoStreams: adjustedUnits.videoStreams, adjustedPreviousDigitalTracks: adjustedUnits.digitalTracks,
							previousUnits: units.all, previousStreams: units.streams, previousAudioStreams: units.audioStreams, previousVideoStreams: units.videoStreams, previousDigitalTracks: units.digitalTracks
						}))
                        .groupBy(prev => prev.track.id)
                        .value(),
                )
                    .values()
                    .flatten()
                    .value();

                // this.sortByTrackThisPeriodWithoutToggling()

                // console.log('projectTrackData', this.projectTrackData);

                this.projectAlbumData = chain({}).merge(
          					chain(this.projectAlbumData.rtd)
          						.filter(rtd => !!rtd.album)
          						.map(({ adjustedUnits, units, album }) => ({
          							albumId: album.id, album, adjustedRtdUnits: adjustedUnits.all, adjustedRtdStreams: adjustedUnits.streams, adjustedRtdDigitalTracks: adjustedUnits.digitalTracks, adjustedRtdDigitalAlbums: adjustedUnits.digitalAlbums, adjustedRtdPhysicalAlbums: adjustedUnits.physicalAlbums,
          							rtdUnits: units.all, rtdStreams: units.streams, rtdDigitalTracks: units.digitalTracks, rtdDigitalAlbums: units.digitalAlbums, rtdPhysicalAlbums: units.physicalAlbums
          						}))
          						.groupBy(rtd => rtd.album.id)
          						.value(),
          					chain(this.projectAlbumData.totals)
          						.filter(tot => !!tot.album)
          						.map(({ adjustedUnits, units, album }) => ({
          							artistId: album.project.artist.id, albumId: album.id, album, albumName: album.name, albumReleaseDate: album.releaseDate, adjustedTotalUnits: adjustedUnits.all, adjustedTotalStreams: adjustedUnits.streams, adjustedTotalDigialTracks: adjustedUnits.digitalTracks, adjustedTotalDigitalAlbums: adjustedUnits.digitalAlbums, adjustedTotalPhysicalAlbums: adjustedUnits.physicalAlbums,
          							totalUnits: units.all, totalStreams: units.streams, totalDigitalTracks: units.digitalTracks, totalDigitalAlbums: units.digitalAlbums, totalPhysicalAlbums: units.physicalAlbums
          						}))
          						.groupBy(tot => tot.album.id)
          						.value(),
          					chain(this.projectAlbumData.previous)
          						.filter(prev => !!prev.album)
          						.map(({ adjustedUnits, units, album }) => ({
          							albumId: album.id, album, adjustedPreviousUnits: adjustedUnits.all, adjustedPreviousStreams: adjustedUnits.streams, adjustedPreviousDigitalTracks: adjustedUnits.digitalTracks, adjustedPreviousDigitalAlbums: adjustedUnits.digitalAlbums, adjustedPreviousPhysicalAlbums: adjustedUnits.physicalAlbums,
          							previousUnits: units.all, previousStreams: units.streams, previousDigitalTracks: units.digitalTracks, previousDigitalAlbums: units.digitalAlbums, previousPhysicalAlbums: units.physicalAlbums
          						}))
          						.groupBy(prev => prev.album.id)
          						.value(),
          				)
          					.values()
          					.flatten()
          					.value();
                    //
                    // this.artistProjectData = _.sortBy(this.artistProjectData, [(x) => { return x.adjustedTotalUnits || '' }], ['desc']).reverse();

                    // this.sortByProjectThisPeriodWithoutToggling();

                    console.log('projectAlbumData', this.projectAlbumData);

                    // this.exportService.artistProjectData = this.artistProjectData;

                this.ready = true;

			}
		);

		//Code below for add-to-list menu

		// getLists() {
		//     this.ls.getLists().subscribe(
		//         res => { this.lists = res; },
		//         err => console.log(err),
		//         () => { }
		//     );
		// }

		// findList(name: string) {
		//     this.lists.filter(function(obj) {
		//         return obj.listName == name;
		//     });
		// }
		//
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

		// createList(name: any) {
		//     let value = name.value.listName;
		//     let listData;
		//
		//     this.ls.createList(value, this.us.userID).subscribe(
		//         data => {
		//             this.getLists();
		//         },
		//         error => {
		//             return Observable.throw(error);
		//         },
		//         () => {
		//             console.log('Finished');
		//             this.addToList(value);
		//         }
		//     );
		// }
	}
}
