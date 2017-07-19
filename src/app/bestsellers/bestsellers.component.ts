//Angular2 Specifics
import { Component, Input, OnInit, OnDestroy, OnChanges, AfterContentChecked, ComponentRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Params, Route, Router, NavigationExtras } from '@angular/router';
import { Location } from '@angular/common';
import { Http } from '@angular/http';
import 'rxjs/add/operator/switchMap';
import { ISubscription, Subscription } from "rxjs/Subscription";
import { DOCUMENT } from '@angular/platform-browser';

//Services
import { BestSellerService } from './bestsellers.service';
import { FilterService } from '../shared/filter.service';
import { FilterDatesService } from '../shared/filterDates.service';
import { Artist } from '../shared/models/artist';
import { SortService } from '../shared/services/sort.service';
import { AuthService } from '../shared/user/auth.service';
import { ExportService } from '../shared/export.service';

//Constants
import { Globals } from '../shared/globalVariables';

//Third-party Libraries
import { Apollo, ApolloQueryObservable } from 'apollo-angular';
import gql from 'graphql-tag';
import { LoadersCssModule } from 'angular2-loaders-css';

@Component({
    selector: 'bestsellers',
    templateUrl: './bestsellers.component.html',
    styleUrls: ['../../assets/sass/bestsellers.component.sass'],
    providers: [BestSellerService]

})

export class BestSellersComponent implements OnInit {

    //Subscriptions
    private dataSub: ISubscription;
    private subscription: ISubscription;
    private filterEmit: ISubscription;
    private dateEmit: ISubscription;
    private bestSellersSub: ISubscription;
    private bestSellersTypeSub: ISubscription;
    //
    showEuro = false;
    arrTest: boolean;
    ready: boolean;
    private BStype: string = this.bestSellers.type;
    private bestSellersData: any = [];
    private newReports: any = {};
    private top5: any = this.bestSellers.top5;
    private top5Image: any = this.bestSellers.top5Image;
    private keys: string[];
    private thumbnails: string[];
    private variance: any[];
    private dateFilters: any;
    hi = true;
    params: any;
    public bs: any;
    public dataParams: Params;

    public topArtists: boolean;
    public topProjects: boolean;
    public topTracks: boolean;

    userData = {};

    public sortedReports: any[];
    sortedBy: string;
    //ascending: boolean = true;

    constructor(private bestSellers: BestSellerService,
        private globals: Globals,
        private exportService: ExportService,
        private http: Http,
        private authService: AuthService,
        private activatedRoute: ActivatedRoute,
        private router : Router,
        private location: Location,
        private fs: FilterService,
        private apollo: Apollo,
        private fsDate: FilterDatesService,
        private sortService: SortService,
        private cdRef:ChangeDetectorRef) {
        this.dateEmit = this.fsDate.componentMethodCalled$.subscribe(
            () => {
                this.loadData();
            }
        );

        // this.activatedRoute.params.subscribe((params: Params) => {
        //         this.BStype = params['type'];
        //         this.bestSellers.type = params['type'];
        //         this.loadData();
        // });

        this.filterEmit = fs.TestServiceEmit.subscribe(
            event => {this.loadData();},
            err => console.log(err),
            () => console.log('done')
        );

        this.userData = JSON.parse(localStorage.getItem('currentUser'));

    }

    ngOnInit(): void {

        this.dateFilters = this.fs.dateFilters;

        this.bs = true;
        this.fs.bs = this.bs;

        this.bestSellersTypeSub = this.activatedRoute.params.subscribe((params: Params) => {
        this.bestSellersSub = this.activatedRoute.queryParams.subscribe((params: Params) => {
            this.dataParams = params;
            this.fs.Metadata(this.dataParams);
        });
                this.BStype = params['type'];
                this.bestSellers.type = params['type'];
                this.fs.BStype = params['type'];
                //this.fs.parseParams(this.dataParams);
        });

        console.log('activeParams',this.fs.activeParams);
        console.log('activeFilters',this.fs.activeFilters);
    }

    ngOnDestroy(){
        this.subscription.unsubscribe();
        this.filterEmit.unsubscribe();
        this.dateEmit.unsubscribe();
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

    loadData(): void {

        this.ready = false;
        let tempData;
        if (this.bestSellers.top5.length != 0) {
            this.bestSellers.top5 = [];
            this.bestSellers.top5Image = [];
            this.top5 = this.bestSellers.top5;
            this.top5Image = this.bestSellers.top5Image;
        }
        this.newReports = [];
        this.bestSellers.currentData = [];
        // if (this.subscription) {
        //     this.subscription.unsubscribe();
        // }

        switch (this.BStype) {
            case "artists":
                this.subscription = this.bestSellers.getAllReports(this.BStype).subscribe(
                    res => tempData = res,
                    err => console.log(err),
                    () => {
                        this.newReports = tempData.topArtists;
                        // if(this.newReports[0].artist.name = "Various Artists") {
                        //   this.newReports = this.newReports.filter(this.newReports[0]);
                        // } else{
                        //   this.newReports = tempData.topArtists;
                        // }
                        this.sortByThisPeriodWithoutToggling();
                        this.bestSellers.currentData = tempData.topArtists;
                        // console.log('newReports', this.newReports);
                        this.bestSellers.topFive(this.BStype, tempData.topArtists);
                        //console.log(this.top5Image);
                        this.ready = true;
                    });
                break;
            case "projects":
                this.subscription = this.bestSellers.getAllReports(this.BStype).subscribe(
                    res => tempData = res,
                    err => console.log(err),
                    () => {
                        this.newReports = tempData.topProjects;
                        this.sortByThisPeriodWithoutToggling();
                        this.bestSellers.currentData = tempData.topProjects;
                        // console.log('newReports', this.newReports);
                        //this.bestSellers.topFive(this.BStype);}
                        this.ready = true;
                    });
                break;
            case "tracks":
                this.subscription = this.bestSellers.getAllReports(this.BStype).subscribe(
                    res => tempData = res,
                    err => console.log(err),
                    () => {
                        this.newReports = tempData.topTracks;
                        //this.bestSellers.currentData = tempData.topTracks;
                        //console.log(this.newReports);}
                        //this.bestSellers.topFive(this.BStype);}
                        this.sortByThisPeriodWithoutToggling();
                        this.bestSellers.currentData = tempData.topTracks;
                        // console.log('sortedReports', this.sortedReports);
                        this.bestSellers.topFive(this.BStype, tempData.topTracks);
                        this.ready = true;
                    });
                break;
        }

    }

    showLessData() {
        this.fs.setRankEnd(this.fs.getRankEnd() - 25);
        this.location.replaceState(this.fs.paramsUrl(this.fs.baseUrl));
        this.loadData();
    }

    showMoreData() {
        this.fs.setRankEnd(this.fs.getRankEnd() + 25);
        this.location.replaceState(this.fs.paramsUrl(this.fs.baseUrl));
        this.loadData();
    }

    sortByRTD() {
        this.sortedReports = this.sortService.sort('rtd', (a, b) => <any>(a.totals.adjustedUnits.rtd > b.totals.adjustedUnits.rtd) - <any>(a.totals.adjustedUnits.rtd < b.totals.adjustedUnits.rtd), this.newReports);
        this.exportService.topArtists = this.sortedReports;
        this.exportService.topProjects = this.sortedReports;
        this.exportService.topTracks = this.sortedReports;
    }

    sortByArtistName() {
        this.sortedReports = this.sortService.sort('artistname', (a, b) => b.artist.name.localeCompare(a.artist.name), this.newReports);
        this.exportService.topArtists = this.sortedReports;
    }

    sortByTrackArtistName() {
        this.sortedReports = this.sortService.sort('artistname', (a, b) => b.track.artist.name.localeCompare(a.track.artist.name), this.newReports);
        this.exportService.topTracks = this.sortedReports;
    }

    sortByTrackName() {
        this.sortedReports = this.sortService.sort('trackname', (a, b) => b.track.name.localeCompare(a.track.name), this.newReports);
        this.exportService.topTracks = this.sortedReports;
    }

    sortByProjectArtistName() {
        this.sortedReports = this.sortService.sort('artistname', (a, b) => b.project.artist.name.localeCompare(a.project.artist.name), this.newReports);
        this.exportService.topProjects = this.sortedReports;
    }

    sortByProjectName() {
        this.sortedReports = this.sortService.sort('trackname', (a, b) => b.project.name.localeCompare(a.project.name), this.newReports);
        this.exportService.topProjects = this.sortedReports;
    }

    sortByThisPeriodWithoutToggling() {
        this.sortService.toggleOrder();
        this.sortedReports = this.sortService.sort('thisperiod', (a, b) => <any>(a.totals.adjustedUnits.all > b.totals.adjustedUnits.all) - <any>(a.totals.adjustedUnits.all < b.totals.adjustedUnits.all), this.newReports);
        this.exportService.topArtists = this.sortedReports;
        this.exportService.topProjects = this.sortedReports;
        this.exportService.topTracks = this.sortedReports;
    }

    sortByThisPeriod() {
        this.sortedReports = this.sortService.sort('thisperiod', (a, b) => <any>(a.totals.adjustedUnits.all > b.totals.adjustedUnits.all) - <any>(a.totals.adjustedUnits.all < b.totals.adjustedUnits.all), this.newReports);
        this.exportService.topArtists = this.sortedReports;
        this.exportService.topProjects = this.sortedReports;
        this.exportService.topTracks = this.sortedReports;
    }

    sortStreams() {
        this.sortedReports = this.sortService.sort('streams', (a, b) => <any>(a.totals.units.streams > b.totals.units.streams) - <any>(a.totals.units.streams < b.totals.units.streams), this.newReports);
        this.exportService.topArtists = this.sortedReports;
        this.exportService.topProjects = this.sortedReports;
        this.exportService.topTracks = this.sortedReports;
    }

    sortAudioStreams() {
        this.sortedReports = this.sortService.sort('audioStreams', (a, b) => <any>(a.totals.units.audioStreams > b.totals.units.audioStreams) - <any>(a.totals.units.audioStreams < b.totals.units.audioStreams), this.newReports);
        this.exportService.topTracks = this.sortedReports;
    }

    sortVideoStreams() {
        this.sortedReports = this.sortService.sort('videoStreams', (a, b) => <any>(a.totals.units.videoStreams > b.totals.units.videoStreams) - <any>(a.totals.units.videoStreams < b.totals.units.videoStreams), this.newReports);
        this.exportService.topTracks = this.sortedReports;
    }

    sortDigitalAlbums() {
        this.sortedReports = this.sortService.sort('digitalAlbums', (a, b) => <any>(a.totals.units.digitalAlbums > b.totals.units.digitalAlbums) - <any>(a.totals.units.digitalAlbums < b.totals.units.digitalAlbums), this.newReports);
        this.exportService.topArtists = this.sortedReports;
        this.exportService.topProjects = this.sortedReports;
        this.exportService.topTracks = this.sortedReports;
    }

    sortDigitalTracks() {
        this.sortedReports = this.sortService.sort('digitalTracks', (a, b) => <any>(a.totals.adjustedUnits.digitalTracks > b.totals.adjustedUnits.digitalTracks) - <any>(a.totals.adjustedUnits.digitalTracks < b.totals.adjustedUnits.digitalTracks), this.newReports);
        this.exportService.topArtists = this.sortedReports;
        this.exportService.topProjects = this.sortedReports;
        this.exportService.topTracks = this.sortedReports;
    }

    sortPhysicalAlbums() {
        this.sortedReports = this.sortService.sort('physicalAlbums', (a, b) => <any>(a.totals.adjustedUnits.physicalAlbums > b.totals.adjustedUnits.physicalAlbums) - <any>(a.totals.adjustedUnits.physicalAlbums < b.totals.adjustedUnits.physicalAlbums), this.newReports);
        this.exportService.topArtists = this.sortedReports;
        this.exportService.topProjects = this.sortedReports;
    }

}
