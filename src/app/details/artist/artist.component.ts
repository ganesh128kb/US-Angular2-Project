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
import { ArtistDetailService } from './artist.service';
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
    selector: 'artistDetail',
    templateUrl: './artist.component.html',
    styleUrls: ['../../../assets/sass/details.component.sass']
})

export class ArtistDetailComponent implements OnInit {

    //Subscriptions
    private subscriptionMerge: ISubscription;
    private filterEmit: ISubscription;
    private dateEmit: ISubscription;
    private artistDetailSub: ISubscription;
    //
    private lists: Array<any> = [];
    public filters: any = [];
    // public imgUrl: string;
    public createListGroup: FormGroup;
    public subscription: any;
    public artistCountryNames: any;
    private artistInfo: any;

    private artistData: any;
    private newArtistInfo: any = {};
    private artistCountryData: any;
    private artistCountryRtdData: any;
    private artistOverview: any;
    private artistCountries: any;
    private artistCountriesTopFive: any;
    private artistRtdData: any;
    private partnersStreams: any;
    private partnersDigitalTracks: any;
    private partnersDigitalAlbums: any;
    private partnersPhysicalAlbums: any;
    private artistTrackData: any;
    private artistTrackRtdData: any;
    private artistProjectData: any;

    filteredCountryReports: any[];
    filteredProjectReports: any[];
    filteredTrackReports: any[];

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
    // private dailyPartnerData: any;
    // private dailyPartnerDataClean: any;

    loadDataNumber: number = 0;

    public dataParams: Params;
    public testDataParams: any;
    public ID: number;

    userData = {};

    artistInit: boolean;

    constructor(public artistService: ArtistDetailService,
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
        //fs.addChangeCallBack(() => { this.loadData() });

        this.dateEmit = fsDate.componentMethodCalled$.subscribe(
            () => {
                this.loadData();
                console.log("This is sikanth");
            });

        this.filterEmit = fs.TestServiceEmit.subscribe(
            event => this.loadData(),
            err => console.log(err),
            () => console.log('Event Fired!')
        );

        this.userData = JSON.parse(localStorage.getItem('currentUser'));
        // console.log('userData', this.userData);
    }

    ngOnInit(): void {
        this.artistInit = true;
        this.fs.artistInit = this.artistInit;
        console.log('Artist OnInit');
        //removes unaccepted Parameters in the url.
        //this.filterArtistUrl();

        this.route.params.subscribe((params: Params) => {
			this.ID = params['artistID'];
                  this.filterArtistUrl();
        });

        this.artistDetailSub = this.route.queryParams.subscribe((params: Params) => {
            this.dataParams = params;
            this.testDataParams = Object.assign({}, this.dataParams);
            console.log('Data Params', this.testDataParams);
            //this.fs.Metadata(this.dataParams);
            this.filterArtistUrl();
        });
        //this.loadData();

        this.bs = false;
        this.fs.bs = this.bs;
        console.log('artistActiveParams', this.fs.activeParams);

        // this.getLists();

        this.createListGroup = new FormGroup({
            listName: new FormControl('')
        });

    }

    ngOnDestroy(): void {
        console.log('Destroyed');
        this.subscriptionMerge.unsubscribe();
        this.filterEmit.unsubscribe();
        this.dateEmit.unsubscribe();
        this.artistDetailSub.unsubscribe();

        this.artistInit = false;
        this.fs.artistInit = this.artistInit;
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

            const keepIDs = filters.map(f => {
                let fSplit = f.split('=');
                return {
                key: fSplit[0],
                id: decodeURIComponent(fSplit[1])
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
            this.fs.Metadata(this.testDataParams);

            this.location.replaceState(filterString[0] + '?' + filters.join('&'));
        } else {
            this.fs.Metadata(this.testDataParams);
        }
    }

    loadData() {
        this.ready = false;
        let tempData;

        console.log('LoadData fired this many times: ', this.loadDataNumber++);
        console.log('dataParams', this.dataParams);

        this.newArtistInfo = [];
        this.artistRtdData = [];
        this.artistOverview = [];
        this.artistCountries = {};
        this.artistCountriesTopFive = {};
        this.flattenedPartners = [];

        if (this.fs.activeParams.territory.length > 0) {
            this.overviewTerritory = this.fs.activeParams.territory[0].id;
        } else {
            this.overviewTerritory = null;
        }

        console.log('overviewTerritory', this.overviewTerritory);

        let source1 = this.artistService.getArtistData(this.ID);
        let source2 = this.artistService.getCountryData(this.ID);
        let source3 = this.artistService.getArtistTrackData(this.ID);
        let source4 = this.artistService.getArtistProjectData(this.ID);

        this.subscription = Observable.forkJoin(source1, source2, source3, source4);

        this.subscriptionMerge = this.subscription.subscribe(
            res => tempData = res,
            err => console.log(err),
            () => {
                // console.log('tempData', tempData);

                //Set new object to artist object in raw response.
                this.artistProjectData = tempData[3];
                this.artistTrackData = tempData[2];
                this.artistCountryData = tempData[1].artist;
                this.newArtistInfo = tempData[0].artist;

                this.artistService.artistName = this.newArtistInfo.name;
                this.fs.artistName = this.newArtistInfo.name;

                // console.log('newArtistInfo', this.newArtistInfo);
                // console.log('artistProjectData', this.artistProjectData);

                //Lodash - transform artist data for overview section
                if (this.overviewTerritory === null) {
					this.artistOverview = chain({}).merge(
						chain(this.newArtistInfo.rtd)
							.filter(rtd => rtd.territory === null && rtd.partner === null)
							.map(({ adjustedUnits, units, euro }) => ({ adjustedRtdUnits: adjustedUnits.all, rtdUnits: units.all, rtdEuro: euro.all, adjustedRtdStreams: adjustedUnits.streams, rtdStreams: units.streams }))
							.value(),
						chain(this.newArtistInfo.totals)
							.filter(tot => tot.territory === null && tot.partner === null)
							.map(({ adjustedUnits, units, euro }) => ({ adjustedTpUnits: adjustedUnits.all, tpUnits: units.all, tpEuro: euro.all, adjustedTpStreams: adjustedUnits.streams, tpStreams: units.streams }))
							.value(),
						chain(this.newArtistInfo.previous)
							.filter(prev => prev.territory === null && prev.partner === null)
							.map(({ adjustedUnits, units, euro }) => ({ adjustedPreviousUnits: adjustedUnits.all, previousUnits: units.all, previousEuro: euro.all }))
							.value(),
					)
						.values()
						.flatten()
						.value();

                } else {
					this.artistOverview = chain({}).merge(
						chain(this.newArtistInfo.rtd)
							.filter(rtd => !!rtd.territory && rtd.territory.id === this.overviewTerritory && rtd.partner === null)
							.map(({ adjustedUnits, units, euro }) => ({ adjustedRtdUnits: adjustedUnits.all, rtdUnits: units.all, rtdEuro: euro.all, adjustedRtdStreams: adjustedUnits.streams, rtdStreams: units.streams }))
							.value(),
						chain(this.newArtistInfo.totals)
							.filter(tot => !!tot.territory && tot.territory.id === this.overviewTerritory && tot.partner === null)
							.map(({ adjustedUnits, units, euro }) => ({ adjustedTpUnits: adjustedUnits.all, tpUnits: units.all, tpEuro: euro.all, adjustedTpStreams: adjustedUnits.streams, tpStreams: units.streams }))
							.value(),
						chain(this.newArtistInfo.previous)
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
                // console.log('artistOverview', this.artistOverview);

                //Lodash - flatten data object to prepare for ingesiton by the countries tab table.
                this.artistCountries = chain({}).merge(
                    chain(this.artistCountryData.rtd)
                        .filter(rtd => !!rtd.territory)
                        .map(({ adjustedUnits, units, euro, territory }) => ({ adjustedRtdUnits: adjustedUnits, rtdUnits: units, rtdEuro: euro, territory }))
                        .groupBy(rtd => rtd.territory.name)
                        .value(),
                    chain(this.artistCountryData.totals)
                        .filter(tot => !!tot.territory)
                        .map(({ adjustedUnits, units, euro, territory }) => ({ adjustedTotalUnitsAll: adjustedUnits.all, adjustedTotalUnits: adjustedUnits, totalUnits: units, totalEuro: euro, territory }))
                        .groupBy(tot => tot.territory.name)
                        .value(),
                    chain(this.artistCountryData.previous)
                        .filter(prev => !!prev.territory)
                        .map(({ adjustedUnits, units, euro, territory }) => ({ adjustedPreviousUnitsAll: adjustedUnits.all, adjustedPreviousUnits: adjustedUnits, previousUnits: units, previousEuro: euro, territory }))
                        .groupBy(prev => prev.territory.name)
                        .value(),
                )
                    .values()
                    .flatten()
                    .value();

                this.artistCountries = _.sortBy(this.artistCountries, [(x) => { return x.adjustedTotalUnitsAll || '' }], ['desc']).reverse();

                this.sortByCountriesThisPeriodWithoutToggling();

                this.selectedCountry = this.artistCountries[0].territory.name;

                this.artistCountryNames = this.artistCountries;

                this.artistService.selectCountry(this.artistCountries[0].territory);
                this.artistService.selectCountryNames(this.artistCountryNames);

                // console.log('artistCountries', this.artistCountries);

                //Lodash - flatten raw data object to prepare for ingestion by partners tab table.
                this.flattenedPartners = chain({}).merge(
                    chain(this.newArtistInfo.rtd)
                        .filter(rtd => !!rtd.partner)
                        .map(({ adjustedUnits, units, euro, partner }) => ({ adjustedRtdUnits: adjustedUnits, rtdUnits: units, totalRtdEuro: euro, partnerName: partner.name, partner }))
                        .groupBy(rtd => rtd.partner.name)
                        .value(),
                    chain(this.newArtistInfo.totals)
                        .filter(tot => !!tot.partner)
                        .map(({ adjustedUnits, units, euro, partner }) => ({ adjustedTotalUnitsAll: adjustedUnits.all, adjustedTotalUnitsStreams: adjustedUnits.streams, adjustedTotalUnits: adjustedUnits, totalUnits: units, totalEuros: euro, partnerName: partner.name, partner }))
                        .groupBy(tot => tot.partner.name)
                        .value(),
                    chain(this.newArtistInfo.previous)
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
                    chain(this.newArtistInfo.rtd)
                        .filter(rtd => !!rtd.partner)
                        .map(({ adjustedUnits, units, euro, partner }) => ({
                            adjustedRtdStreams: adjustedUnits.streams, adjustedRtdDigitalTracks: adjustedUnits.digitalTracks, rtdDigitalAlbums: units.digitalAlbums, rtdPhysicalAlbums: units.physicalAlbums,
                            euroRtdStreams: euro.streams, euroRtdDigitalTracks: euro.digitalTracks, euroRtdDigitalAlbums: euro.digitalAlbums, euroRtdPhysicalAlbums: euro.physicalAlbums, partnerName: partner.name, partner
                        }))
                        .groupBy(rtd => rtd.partner.name)
                        .value(),
                    chain(this.newArtistInfo.totals)
                        .filter(tot => !!tot.partner)
                        .map(({ adjustedUnits, units, euro, partner }) => ({
                            adjustedTotalStreams: adjustedUnits.streams, adjustedTotalDigitalTracks: adjustedUnits.digitalTracks, totalDigitalAlbums: units.digitalAlbums, totalPhysicalAlbums: units.physicalAlbums,
                            euroTotalsStreams: euro.streams, euroTotalsDigitalTracks: euro.digitalTracks, euroTotalsDigitalAlbums: euro.digitalAlbums, euroTotalsPhysicalAlbums: euro.physicalAlbums, partnerName: partner.name, partner
                        }))
                        .groupBy(tot => tot.partner.name)
                        .value(),
                    chain(this.newArtistInfo.previous)
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
                    chain(this.newArtistInfo.totals)
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
                    chain(this.newArtistInfo.totals)
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
                    chain(this.newArtistInfo.totals)
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
                    chain(this.newArtistInfo.totals)
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
                // console.log("This is the merge")

                this.artistTrackData = chain({}).merge(
					chain(this.artistTrackData.rtd)
						.filter(rtd => !!rtd.track)
						.map(({ adjustedUnits, units, track }) => ({
							trackId: track.id, track, adjustedRtdUnits: adjustedUnits.all, adjustedRtdStreams: adjustedUnits.streams, adjustedRtdAudioStreams: adjustedUnits.audioStreams, adjustedRtdVideoStreams: adjustedUnits.videoStreams, adjustedRtdDigitalTracks: adjustedUnits.digitalTracks,
							rtdUnits: units.all, rtdStreams: units.streams, rtdAudioStreams: units.audioStreams, rtdVideoStreams: units.videoStreams, rtdDigitalTracks: units.digitalTracks
						}))
                        .groupBy(rtd => rtd.track.id)
						.value(),
                    chain(this.artistTrackData.totals)
                        .filter(tot => !!tot.track)
                        .map(({ adjustedUnits, units, track }) => ({
							artistId: track.artist.id, projectId: track.project.id, trackId: track.id, track, trackName: track.name, trackReleaseDate: track.earliestReleaseDate, adjustedTotalUnits: adjustedUnits.all, adjustedTotalStreams: adjustedUnits.streams, adjustedTotalAudioStreams: adjustedUnits.audioStreams, adjustedTotalVideoStreams: adjustedUnits.videoStreams, adjustedTotalDigitalTracks: adjustedUnits.digitalTracks,
							totalUnits: units.all, totalStreams: units.streams, totalAudioStreams: units.audioStreams, totalVideoStreams: units.videoStreams, totalDigitalTracks: units.digitalTracks
						}))
                        .groupBy(tot => tot.track.id)
                        .value(),
                    chain(this.artistTrackData.previous)
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

                this.sortByTrackThisPeriodWithoutToggling()

                // console.log('artistTrackData', this.artistTrackData);

                this.artistProjectData = chain({}).merge(
          					chain(this.artistProjectData.rtd)
          						.filter(rtd => !!rtd.project)
          						.map(({ adjustedUnits, units, project }) => ({
          							projectId: project.id, project, adjustedRtdUnits: adjustedUnits.all, adjustedRtdStreams: adjustedUnits.streams, adjustedRtdDigitalTracks: adjustedUnits.digitalTracks, adjustedRtdDigitalAlbums: adjustedUnits.digitalAlbums, adjustedRtdPhysicalAlbums: adjustedUnits.physicalAlbums,
          							rtdUnits: units.all, rtdStreams: units.streams, rtdDigitalTracks: units.digitalTracks, rtdDigitalAlbums: units.digitalAlbums, rtdPhysicalAlbums: units.physicalAlbums
          						}))
          						.groupBy(rtd => rtd.project.id)
          						.value(),
          					chain(this.artistProjectData.totals)
          						.filter(tot => !!tot.project)
          						.map(({ adjustedUnits, units, project }) => ({
          							artistId: project.artist.id, projectId: project.id, project, projectName: project.name, projectReleaseDate: project.earliestReleaseDate, adjustedTotalUnits: adjustedUnits.all, adjustedTotalStreams: adjustedUnits.streams, adjustedTotalDigialTracks: adjustedUnits.digitalTracks, adjustedTotalDigitalAlbums: adjustedUnits.digitalAlbums, adjustedTotalPhysicalAlbums: adjustedUnits.physicalAlbums,
          							totalUnits: units.all, totalStreams: units.streams, totalDigitalTracks: units.digitalTracks, totalDigitalAlbums: units.digitalAlbums, totalPhysicalAlbums: units.physicalAlbums
          						}))
          						.groupBy(tot => tot.project.id)
          						.value(),
          					chain(this.artistProjectData.previous)
          						.filter(prev => !!prev.project)
          						.map(({ adjustedUnits, units, project }) => ({
          							projectId: project.id, project, adjustedPreviousUnits: adjustedUnits.all, adjustedPreviousStreams: adjustedUnits.streams, adjustedPreviousDigitalTracks: adjustedUnits.digitalTracks, adjustedPreviousDigitalAlbums: adjustedUnits.digitalAlbums, adjustedPreviousPhysicalAlbums: adjustedUnits.physicalAlbums,
          							previousUnits: units.all, previousStreams: units.streams, previousDigitalTracks: units.digitalTracks, previousDigitalAlbums: units.digitalAlbums, previousPhysicalAlbums: units.physicalAlbums
          						}))
          						.groupBy(prev => prev.project.id)
          						.value(),
          				)
          					.values()
          					.flatten()
          					.value();
                    //
                    // this.artistProjectData = _.sortBy(this.artistProjectData, [(x) => { return x.adjustedTotalUnits || '' }], ['desc']).reverse();

                    this.sortByProjectThisPeriodWithoutToggling();

                    // console.log('artistProjectData', this.artistProjectData);

                    this.exportService.artistProjectData = this.artistProjectData;

                this.ready = true;
            });
        // console.log(this.newArtistInfo);
    }

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

    sortByProjectThisPeriodWithoutToggling() {
        this.sortService.toggleOrder();
        this.artistProjectData = this.artistProjectData.filter(res => res.adjustedTotalUnits != null);
        this.filteredProjectReports = this.sortService.sort('thisperiod', (a, b) => <any>(a.adjustedTotalUnits > b.adjustedTotalUnits) - <any>(a.adjustedTotalUnits < b.adjustedTotalUnits), this.artistProjectData);
        this.exportService.artistProjectData = this.filteredProjectReports;
    }

    sortByProjectThisPeriod() {
        this.filteredProjectReports = this.sortService.sort('thisperiod', (a, b) => <any>(a.adjustedTotalUnits > b.adjustedTotalUnits) - <any>(a.adjustedTotalUnits < b.adjustedTotalUnits), this.artistProjectData);
        this.exportService.artistProjectData = this.filteredProjectReports;
    }

    sortByProjectName() {
        this.filteredProjectReports = this.sortService.sort('projectname', (a: any, b: any) => b.projectName.localeCompare(a.projectName), this.artistProjectData);
        this.exportService.artistProjectData = this.filteredProjectReports;
    }

    sortByProjectRtd() {
        this.filteredProjectReports = this.sortService.sort('rtd', (a, b) => <any>(a.adjustedRtdUnits > b.adjustedRtdUnits) - <any>(a.adjustedRtdUnits < b.adjustedRtdUnits), this.artistProjectData);
        this.exportService.artistProjectData = this.filteredProjectReports;
    }

    sortByProjectPhysicalAlbums() {
        this.filteredProjectReports = this.sortService.sort('physicalAlbums', (a, b) => <any>(a.totalPhysicalAlbums > b.totalPhysicalAlbums) - <any>(a.totalPhysicalAlbums < b.totalPhysicalAlbums), this.artistProjectData);
        this.exportService.artistProjectData = this.filteredProjectReports;
    }

    sortByProjectDigitalAlbums() {
        this.filteredProjectReports = this.sortService.sort('digitalAlbums', (a, b) => <any>(a.totalDigitalAlbums > b.totalDigitalAlbums) - <any>(a.totalDigitalAlbums < b.totalDigitalAlbums), this.artistProjectData);
        this.exportService.artistProjectData = this.filteredProjectReports;
    }

    sortByProjectDigitalTracks() {
        // this.artistProjectData = this.artistProjectData.filter(res => res.adjustedTotalDigitalTracks != null);
        this.filteredProjectReports = this.sortService.sort('digitalTracks', (a, b) => <any>(a.totalDigitalTracks > b.totalDigitalTracks) - <any>(a.totalDigitalTracks < b.totalDigitalTracks), this.artistProjectData);
        this.exportService.artistProjectData = this.filteredProjectReports;
    }

    sortByProjectStreams() {
        this.filteredProjectReports = this.sortService.sort('streams', (a, b) => <any>(a.totalStreams > b.totalStreams) - <any>(a.totalStreams < b.totalStreams), this.artistProjectData);
        this.exportService.artistProjectData = this.filteredProjectReports;
    }

    sortByTrackThisPeriodWithoutToggling() {
        this.sortService.toggleOrder();
        this.artistTrackData = this.artistTrackData.filter(res => res.adjustedTotalUnits != null);
        this.filteredTrackReports = this.sortService.sort('thisPeriod', (a, b) => <any>(a.adjustedTotalUnits > b.adjustedTotalUnits) - <any>(a.adjustedTotalUnits < b.adjustedTotalUnits), this.artistTrackData);
        this.exportService.artistTrackData = this.filteredTrackReports;
    }

    sortByTrackThisPeriod() {
        this.filteredTrackReports = this.sortService.sort('thisPeriod', (a, b) => <any>(a.adjustedTotalUnits > b.adjustedTotalUnits) - <any>(a.adjustedTotalUnits < b.adjustedTotalUnits), this.artistTrackData);
        this.exportService.artistTrackData = this.filteredTrackReports;
    }

    sortByTrackName() {
        this.filteredTrackReports = this.sortService.sort('trackName', (a: any, b: any) => b.trackName.localeCompare(a.trackName), this.artistTrackData);
        this.exportService.artistTrackData = this.filteredTrackReports;
    }

    sortByTrackRtd() {
        this.filteredTrackReports = this.sortService.sort('rtd', (a, b) => <any>(a.adjustedRtdUnits > b.adjustedRtdUnits) - <any>(a.adjustedRtdUnits < b.adjustedRtdUnits), this.artistTrackData);
        this.exportService.artistTrackData = this.filteredTrackReports;
    }

    sortByTrackDigitalTracks() {
        this.filteredTrackReports = this.sortService.sort('digitalTracks', (a, b) => <any>(a.totalDigitalTracks > b.totalDigitalTracks) - <any>(a.totalDigitalTracks < b.totalDigitalTracks), this.artistTrackData);
        this.exportService.artistTrackData = this.filteredTrackReports;
    }

    sortByTrackStreams() {
        this.filteredTrackReports = this.sortService.sort('streams', (a, b) => <any>(a.totalStreams > b.totalStreams) - <any>(a.totalStreams < b.totalStreams), this.artistTrackData);
        this.exportService.artistTrackData = this.filteredTrackReports;
    }

    sortByTrackAudioStreams() {
        this.filteredTrackReports = this.sortService.sort('audioStreams', (a, b) => <any>(a.totalAudioStreams > b.totalAudioStreams) - <any>(a.totalAudioStreams < b.totalAudioStreams), this.artistTrackData);
        this.exportService.artistTrackData = this.filteredTrackReports;
    }

    sortByTrackVideoStreams() {
        this.filteredTrackReports = this.sortService.sort('videoStreams', (a, b) => <any>(a.totalVideoStreams > b.totalVideoStreams) - <any>(a.totalVideoStreams < b.totalVideoStreams), this.artistTrackData);
        this.exportService.artistTrackData = this.filteredTrackReports;
    }

    sortByCountriesName() {
        this.filteredCountryReports = this.sortService.sort('countryname', (a: any, b: any) => b.territory.name.localeCompare(a.territory.name), this.filteredCountryReports);
        this.exportService.artistCountriesData = this.filteredCountryReports;
    }

    sortByCountriesThisPeriodWithoutToggling() {
        this.sortService.toggleOrder();
        this.filteredCountryReports = this.artistCountries.filter(res => res.adjustedTotalUnitsAll != null);
        this.filteredCountryReports = this.sortService.sort('thisperiod', (a, b) => <any>(a.adjustedTotalUnitsAll > b.adjustedTotalUnitsAll) - <any>(a.adjustedTotalUnitsAll < b.adjustedTotalUnitsAll), this.filteredCountryReports);
        this.exportService.artistCountriesData = this.filteredCountryReports;
    }

    sortByCountriesThisPeriod() {
        this.filteredCountryReports = this.sortService.sort('thisperiod', (a, b) => <any>(a.adjustedTotalUnitsAll > b.adjustedTotalUnitsAll) - <any>(a.adjustedTotalUnitsAll < b.adjustedTotalUnitsAll), this.filteredCountryReports);
        this.exportService.artistCountriesData = this.filteredCountryReports;
    }

    sortByCountriesRtd() {
        this.filteredCountryReports = this.sortService.sort('rtd', (a, b) => <any>(a.adjustedTotalUnitsAll > b.adjustedTotalUnitsAll) - <any>(a.adjustedTotalUnitsAll < b.adjustedTotalUnitsAll), this.filteredCountryReports);
        this.exportService.artistCountriesData = this.filteredCountryReports;
    }

    sortByCountriesPhyiscalAlbums() {
        this.filteredCountryReports = this.sortService.sort('physicalAlbums', (a, b) => <any>(a.totalUnits.physicalAlbums > b.totalUnits.physicalAlbums) - <any>(a.totalUnits.physicalAlbums < b.totalUnits.physicalAlbums), this.filteredCountryReports);
        this.exportService.artistCountriesData = this.filteredCountryReports;
    }
    sortByCountriesDigitalAlbums() {
        this.filteredCountryReports = this.sortService.sort('digitalAlbums', (a, b) => <any>(a.totalUnits.digitalAlbums > b.totalUnits.digitalAlbums) - <any>(a.totalUnits.digitalAlbums < b.totalUnits.digitalAlbums), this.filteredCountryReports);
        this.exportService.artistCountriesData = this.filteredCountryReports;
    }

    sortByCountriesDigitalTracks() {
        this.filteredCountryReports = this.sortService.sort('digitalTracks', (a, b) => <any>(a.totalUnits.digitalTracks > b.totalUnits.digitalTracks) - <any>(a.totalUnits.digitalTracks < b.totalUnits.digitalTracks), this.filteredCountryReports);
        this.exportService.artistCountriesData = this.filteredCountryReports;
    }

    sortByCountriesStreams() {
        this.filteredCountryReports = this.sortService.sort('streams', (a, b) => <any>(a.totalUnits.streams > b.totalUnits.streams) - <any>(a.totalUnits.streams < b.totalUnits.streams), this.filteredCountryReports);
        this.exportService.artistCountriesData = this.filteredCountryReports;
    }
}
