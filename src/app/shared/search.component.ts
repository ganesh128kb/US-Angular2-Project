import { Component, ElementRef, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { RouterModule, Routes, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Observable } from 'rxjs/Observable';

//application wide shared Rx operators
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/mergeMap';

import * as _ from 'lodash';
import { chain } from 'lodash';

import { SearchService } from './services/search';

@Component({
    selector: 'search',
    templateUrl: './search.component.html',
    styleUrls: ['../../assets/sass/header.component.sass']
})

export class SearchComponent {


    		public items: any = {};
    	  ready: boolean = true;
    	  noTitle: boolean = true;
    		// term$ = new Subject<string>();

constructor(private service: SearchService, private router: Router, private location: Location) {


    			// this.term$
    			// 	.debounceTime(250)
    			// 	.distinctUntilChanged()
    			// 	.subscribe(term => this.search(term))
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


    		search(term: any) {

          // const observable = this.keyUp
          // .map(value => term.target.value)
          // .debounceTime(1000)
          // .distinctUntilChanged()
          // .flatMap((search) => {
          //   return Observable.of(search).delay(500);
          // })
          // .subscribe((data) => {
          //   alert(data);
          // });

    	    this.ready = false;
    		  let tempData;


    		  this.service.search(term.target.value).subscribe(
    		    res => {
    	        // console.log(res);
    	        tempData = res
    	      },
    		    err => console.log(err),
    		    () => {


    		        this.items = tempData.search;


    	          this.items = _.groupBy(this.items, item => item['__typename']);


    		        console.log(this.items);
    	          this.ready = true;
    	          this.noTitle = false;
    		    });
    	    }


    		// search(term: string) {
    		// 	this.service.search(term)
    		// 		.subscribe(items => {
    	  //       // console.log(items);
    		// 			// return items
    		// 		});
    	  //
    		// }


    		exists = false;


    		toggleExists() {
    			this.exists = !this.exists;
    		}



}
