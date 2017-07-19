import { Component, ElementRef, EventEmitter, OnInit} from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { RouterModule, Routes, Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { Http } from '@angular/http';

import{ ListDetailComponent } from './list.component';

//application wide shared Rx operators
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/mergeMap';

import { ListsService } from './lists.service';
import { SearchService } from './services/search';

@Component({
    selector: 'addtolist',
    templateUrl: './addtolist.component.html',
    styleUrls: ['../../assets/sass/lists.component.sass']
})

export class AddToListComponent implements OnInit {

  items:Array<string>;
  term$ = new Subject<string>();
  private listID;

  constructor(private service:SearchService,
              private ls: ListsService,
              private http:Http,
              private route:ActivatedRoute,
              private router: Router,
              private lc: ListDetailComponent) {

    // this.term$
    // 	.debounceTime(250)
    // 	.distinctUntilChanged()
    //     .subscribe(term => this.search(term))
  }

  ngOnInit():void{
    this.route.params.subscribe(params => { this.listID = params['listID']; });
  }

  // search(term: string) {
  //   this.service.search(term)
  //               .subscribe(items => {
  //               	this.items = items
  //               	console.log(items);
  //               });
  // }

  exists = false;

  toggleExists() {
    this.exists = !this.exists;
  }

  // addToList(itemType:string, itemID:string, action:string, body:any){
  //   this.lc.updateList(this.listID, itemType, itemID, action, body);
  //   console.log(body);
  // }

}
