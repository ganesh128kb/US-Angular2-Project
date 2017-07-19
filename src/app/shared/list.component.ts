//Angular2 Specifics
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { Http } from '@angular/http';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';

//Services
import { ListsService } from './lists.service';

//Third-party
import 'moment/moment';

//Constants
import { Globals } from './globalVariables';

@Component({
    selector: 'list',
    templateUrl: './list.component.html',
    styleUrls: ['../../assets/sass/lists.component.sass', '../../assets/sass/bestsellers.component.sass']
})

export class ListDetailComponent implements OnInit {

	private moment = require('moment');
	public list;
	private listID: number;
  private ascending:Boolean = false;

  private artistsColumns: [
    'Rank',
    'Artist',
    'TW',
    'RED',
    'Physical Albums',
    'Digital Albums',
    'Digital Tracks',
    'Streams'
  ];

	constructor(private globals: Globals,
				private ls: ListsService,
				private http:Http,
				private route:ActivatedRoute,
				private router: Router,
        private location: Location){ }

    ngOnInit(): void {}


  }

    //this.listUrl = 'http://localhost:3000/#'+this.location.path();
    //console.log(this.listUrl);

		// this.route.params.subscribe(params => { this.listID = params['listID']; });
    //     this.getList(this.listID);
    // }

    // getList(id: number) {
    //     this.ls.getList(id).subscribe(
    //         res => { this.list = res; console.log(res); },
    //         err => console.log(err),
    //         () => console.log('done loading lists')
    //     );
    // }

    // deleteList(list: any) {
    //     if (confirm("Are you sure you want to delete " + list.listName + "?")) {
    //         this.ls.deleteList(list._id).subscribe(
    //             data => { },
    //             error => { console.log("Error Deleting Food!"); return Observable.throw(error); },
    //             () => { this.router.navigate(['/lists']); }
    //         );
    //         // console.log(list._id);
    //     }
    // }

    // updateList(listID: number, itemType: string, itemID: string, action: string, body: any) {
    //     let count = 0;
    //     let typeArray;
    //
    //     if (action === 'add') {
    //         switch (itemType) {
    //             case "artists":
    //                 typeArray = this.list[0].artists;
    //                 break;
    //             case "projects":
    //                 typeArray = this.list[0].projects;
    //                 break;
    //             case "tracks":
    //                 typeArray = this.list[0].tracks;
    //                 break;
    //         }
    //
    //         for (let i in typeArray) {
    //             if (typeArray[i]._id.includes(body._id)) {
    //                 return count + 1;
    //             }
    //         }
    //     }

    //     if (count === 0) {
    //         this.ls.updateList(listID, itemType, itemID, action, body)
    //             .subscribe(
    //             res => { this.getList(this.listID); },
    //             err => console.log(err),
    //             () => console.log('done loading lists')
    //             );
    //         count = 0;
    //     }
    // }

    // exportList(json:any){
    //   console.log(json);
    //   let columns = Object.keys(json[0]);
    //   console.log(columns);
    //   this.ls.exportList(json, columns);
    // }

    //Email Reports date range.
    // public reportDate: any = {};

    // private emailReportsDate(value: any) {
    //     //this.reportDate.start = value.start;
    //     this.reportDate.end = value.end;
    // }
    // deleteListItem(itemType: string, itemID: string, action: string, body: any) {
    //     this.updateList(this.listID, itemType, itemID, action, body);
    // }

    // shareListUrl(){
    //   return this.ls.shareListUrl();
    // }

    // updateListName(itemType: string, itemID: string, action: string, body: any) {
    //     this.updateList(this.listID, itemType, itemID, action, body);
    // }
// }
