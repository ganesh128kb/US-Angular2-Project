//Angular2 Specifics
import { Injectable, OnInit } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

//Services
import { FilterService } from '../shared/filter.service';

//Third-party Libraries
import { Apollo, ApolloQueryObservable } from 'apollo-angular';
import { ApolloClient, ApolloQueryResult } from 'apollo-client';
import gql from 'graphql-tag';

//GraphQL Queries
import TopArtist from '../queries/topartist.graphql.js';
import TopTrack from '../queries/toptrack.graphql.js';
import TopProject from '../queries/topproject.graphql.js'

//Constants
import { Globals } from '../shared/globalVariables';

// const topArtist = TopArtist();
// tslint:disable-next-line
// const TopArtist = require('../queries/top.graphql');

@Injectable()
export class BestSellerService {

    public data: any;
    public currentData: any;
    public top5: any = [];
    public top5Image: any = [];
    public type: string;

    public apolloError: any;

    constructor(private http: Http,
        private fs: FilterService,
        private activatedRoute: ActivatedRoute,
        private apollo: Apollo,
        private router: Router,
        private globals: Globals) {

        activatedRoute.params.subscribe((params: Params) => {
                this.type = params['type'];
        });
    }

    topFive(BStype: string, data: any) {

        let top5Array: any = [];
        let top = data.slice(0, 5);
        let index = 0;
        for (let items in top) {
            let item = top[items];
            this.top5.push(item);
            this.top5Image[index] = {};
            // switch (BStype) {
            //     case "artists":
            //         this.getImageUrl(BStype, item.artist.name, index);
            //         break;
            //     case "projects":
            //         this.getImageUrl(BStype, item.project.name, index);
            //         break;
            //     case "tracks":
            //         this.getImageUrl(BStype, item.track.name, index);
            //         break;
            // }
            index += 1;
            //console.log(this.top5);
        }
    }

    getAllReports(type: string): Observable<ApolloQueryResult<Object>> {
        let tableType;

        switch (type) {
            case "artists":
                return this.apollo.query({ query: TopArtist, variables: this.fs.paramsObj() })
                    .map(({data}) => data)
                    .catch((error) => {
                      this.globals.apolloError = error.message;
                      throw this.router.navigate(['**']);
                    });
            case "projects":
                return this.apollo.query({ query: TopProject, variables: this.fs.paramsObj() })
                    .map(({data}) => data)
                    .catch((error) => {
                      this.globals.apolloError = error.message;
                      throw this.router.navigate(['**']);
                    });
            case "tracks":
                return this.apollo.query({ query: TopTrack, variables: this.fs.paramsObj() })
                    .map(({data}) => data)
                    .catch((error) => {
                      this.globals.apolloError = error.message;
                      throw this.router.navigate(['**']);
                    });
        }
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occured', error);
        return Promise.reject(error.message || error);
    }
}
