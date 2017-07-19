import { Injectable, Output, EventEmitter } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'

import { Apollo, ApolloQueryObservable } from 'apollo-angular';
import { ApolloClient, ApolloQueryResult } from 'apollo-client';
import gql from 'graphql-tag';

import { Globals } from '../../shared/globalVariables';

//GraphQL queries
import User from '../../queries/user.graphql';

@Injectable()
export class AuthService {

	public loggedIn: boolean = false;

	private email: string;
  userData = {};

    constructor(
      private http: Http,
      private apollo: Apollo,
      private router: Router,
      globals: Globals
      ) {

    this.loggedIn = !!localStorage.getItem('currentUser');

    this.userData = JSON.parse(localStorage.getItem('currentUser'));

	}

  @Output() clearOnLogOut = new EventEmitter();

		login(email: string): Observable<ApolloQueryResult<Object>> {
		return this.apollo.query({query: User, variables: { email: email } })
		.map(({data}) => {
			// console.log('data', data);
			localStorage.setItem('currentUser', JSON.stringify(data['getUser']));
			this.userData = JSON.parse(localStorage.getItem('currentUser'));
			return this.userData;
		})
		.catch((error: any) => {
				return Observable.throw(error.statusText);
		});
}

    logout() {
        this.clearOnLogOut.emit();
        localStorage.removeItem('currentUser');
        this.router.navigate(['/login']);
        // console.log(this.loggedIn);
    }

	   isLoggedIn(){
	     return this.loggedIn;
	}
}
