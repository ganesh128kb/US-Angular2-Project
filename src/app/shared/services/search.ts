import { Injectable } from '@angular/core';
import 'rxjs/add/operator/delay';
import { Http } from '@angular/http';
import { Router } from '@angular/router';

import { Apollo, ApolloQueryObservable } from 'apollo-angular';
import { ApolloClient, ApolloQueryResult } from 'apollo-client';
import gql from 'graphql-tag';

import { Globals } from '../../shared/globalVariables';

import { Observable } from 'rxjs/Observable';

import Search from '../../queries/search.graphql';

@Injectable()
export class SearchService {

	constructor(private http: Http, private router: Router, private apollo: Apollo, private globals: Globals) { }

	search(term: string): Observable<ApolloQueryResult<Object>> {
			return this.apollo.query({ query: Search, variables: { searchText: term } })
				.map(({data}) => data)
        .catch((error) => {
                  this.globals.apolloError = error.message;
                  throw this.router.navigate(['**']);
                });
	}

	// search (term: string) {
	//
	//   let obs = this.http.get('http://localhost:1337/api/search/' + term)
	//              .map(response => response.json());
	//
	//   if (term.length === 2) {
	//   	obs = obs.delay(300)
	//   }
	//   return obs;
	// }
}
