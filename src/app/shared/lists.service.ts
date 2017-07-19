import {Injectable, OnInit} from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Observable} from "rxjs/Rx";

import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import 'rxjs/add/operator/map';
import 'json2csv/dist/json2csv';

@Injectable()
export class ListsService {

    constructor(private http: Http,
                private location: Location) {

      // getArtists() {
      //   http.get('/api/artists')
      //   .map((res: Response) => res.json())
      //   .subscribe(artist => this.artist = artist);
      // }
      //
      // getProjects() {
      //   http.get('/api/projects')
      //   .map((res: Response) => res.json())
      //   .subscribe(project => this.project = project);
      // }
      //
      // getTracks() {
      //   http.get('/api/tracks')
      //   .map((res: Response) => res.json())
      //   .subscribe(track => this.track = track);
      // }

    }

    shareListUrl():string{
      return 'http://localhost:3000/#'+this.location.path();
    }

    // getLists(){
    //   return this.http.get('http://localhost:1337/api/list/userID/'+this.us.userID)
    //     .map((res:Response) => res.json());
    // }

    // getList(id:number){
    //   return this.http.get('http://localhost:1337/api/list/_id/'+id)
    //     .map((res:Response) => res.json());
    // }
    //
    // deleteList(id:number){
    //    return this.http.delete('http://localhost:1337/api/list/'+id);
    // }
    //
    // createList(listName: string, user: number): Observable<any>{
    //
    //   let objectList = {
    //     userID: user,
    //     listName: listName,
    //     frequency: 'never',
    //     reminder: false
    //   };
    //
    //   return this.http.post('http://localhost:1337/api/list', objectList)
    //           .map((res: Response) => res.json());
    // }

    // updateList(listID:number, itemType: string, itemID: string, action: string, body:any){
    //    //let url = 'http://localhost:1337/api/list/'+listID+itemType+itemID+action;
    //   return this.http.put('http://localhost:1337/api/list/'+listID+'/'+itemType+'/'+itemID+'/'+action, body);
    // }


    private json2csv = require('json2csv');

    exportList(json: any, columns:any){
      try{
        let result = this.json2csv({data:json, fields:columns});
        console.log(result);
      }catch (err){
        console.error(err);
      }

    }


}
