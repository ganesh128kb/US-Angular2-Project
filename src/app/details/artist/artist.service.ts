//Angular2 Specifics
import { Injectable, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

//Services
import { FilterService } from '../../shared/filter.service';
import * as moment from 'moment';

//Third-party Libraries
import { Apollo, ApolloQueryObservable } from 'apollo-angular';
import { ApolloClient, ApolloQueryResult } from 'apollo-client';
import gql from 'graphql-tag';

//Constants
import { Globals } from '../../shared/globalVariables';

//GraphQL queries
import Details from '../../queries/artistDetail.graphql';
import LineChartOverview from '../../queries/detailLineChartOverview.graphql';
import LineChartPartners from '../../queries/detailLineChartPartners.graphql';
import EightWeekTrend from '../../queries/eightWeekColChart.graphql';
import DetailCountries from '../../queries/artistDetailCountries.graphql';
import TrackData from '../../queries/artistDetailTracks.graphql';
import ProjectData from '../../queries/artistDetailProjects.graphql';

@Injectable()
export class ArtistDetailService {

    public artistName: any;
    public artistCountriesTopFive: any;
    public selectedCountry: any;
    public countryNames: any;

    changeCallBack: (() => void) = function() { };

    constructor(private http: Http,
        private apollo: Apollo,
        private fs: FilterService,
        private router: Router,
        private globals: Globals) { }

    //id: number = 0, previousDate: boolean = false, territoryAll: boolean = false, periodAll: boolean = false

    getCountryData(id: number): Observable<ApolloQueryResult<Object>> {
        return this.apollo.query({ query: DetailCountries, variables: this.fs.paramsObj(id, true, true, false) })
            .map(({data}) => data)
            .catch((error) => {
                      this.globals.apolloError = error.message;
                      throw this.router.navigate(['**']);
                    });
    }

    getArtistData(id: number): Observable<ApolloQueryResult<Object>> {
        return this.apollo.query({ query: Details, variables: this.fs.paramsObj(id, true, false, false) })
            .map(({data}) => data)
            .catch((error) => {
                      this.globals.apolloError = error.message;
                      throw this.router.navigate(['**']);
                    });
    }

    //chart queries -- merge into filter service at some point

    getLineChartOverviewData(id: number): Observable<ApolloQueryResult<Object>> {
        return this.apollo.query({ query: LineChartOverview, variables: this.fs.lineChartParamsObj(id) })
            .map(({data}) => data)
            .catch((error) => {
                      this.globals.apolloError = error.message;
                      throw this.router.navigate(['**']);
                    });
    }

    getLineChartPartnersData(id: number): Observable<ApolloQueryResult<Object>> {
        return this.apollo.query({ query: LineChartPartners, variables: this.fs.lineChartParamsObj(id) })
            .map(({data}) => data)
            .catch((error) => {
                      this.globals.apolloError = error.message;
                      throw this.router.navigate(['**']);
                    });
    }

    getEightWeekRegionData(id: number): Observable<ApolloQueryResult<Object>> {
        return this.apollo.query({ query: EightWeekTrend, variables: this.fs.eightWeekChartParamsObj(id) })
            .map(({data}) => data)
            .catch((error) => {
                      this.globals.apolloError = error.message;
                      throw this.router.navigate(['**']);
                    });
    }

    getArtistTrackData(id: number): Observable<ApolloQueryResult<Object>> {
        return this.apollo.query({ query: TrackData, variables: this.fs.paramsObj(id, true, false, false) })
            .map(({data}) => data)
            .catch((error) => {
                      this.globals.apolloError = error.message;
                      throw this.router.navigate(['**']);
                    });
    }

    getArtistProjectData(id: number): Observable<ApolloQueryResult<Object>> {
        return this.apollo.query({ query: ProjectData, variables: this.fs.paramsObj(id, true, false, false) })
            .map(({data}) => data)
            .catch((error) => {
                      this.globals.apolloError = error.message;
                      throw this.router.navigate(['**']);
                    });
    }

    //Top five countries based on TP passed from artist component.
    artistCountryTopFive(data: any = []) {
        this.artistCountriesTopFive = data;
    }

    addChangeCallBack(cb: () => void) {
        this.changeCallBack = cb;
    }

    selectCountry(country: any) {
        this.selectedCountry = country;
    }

    selectCountryNames(countryNames: any) {
        this.countryNames = countryNames;
    }

}
