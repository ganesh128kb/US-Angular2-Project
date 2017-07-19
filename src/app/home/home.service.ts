//Angular2 Specifics
import { Injectable, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

//Third-party Libraries
import { Apollo, ApolloQueryObservable } from 'apollo-angular';
import { ApolloClient, ApolloQueryResult } from 'apollo-client';
import gql from 'graphql-tag';

//GraphQL queries
import Details from '../../queries/artistDetail.graphql';
import LineChartOverview from '../../queries/detailLineChartOverview.graphql';
import LineChartPartners from '../../queries/detailLineChartPartners.graphql';
import EightWeekTrend from '../../queries/eightWeekColChart.graphql';
import DetailCountries from '../../queries/artistDetailCountries.graphql';
import DetailRtdCountries from '../../queries/artistDetailRtdCountries.graphql';
import DetailRtdPartners from '../../queries/artistDetailRtdPartners.graphql';
import RtdData from '../../queries/artistDetailRtd.graphql';
import TrackData from '../../queries/artistDetailTracks.graphql';
import RtdTrackData from '../../queries/artistDetailRtdTracks.graphql';
import ProjectData from '../../queries/artistDetailProjects.graphql';

@Injectable()
export class HomeService {

    changeCallBack: (() => void) = function() { };

    constructor(private http: Http,
        private apollo: Apollo) { }





			}
