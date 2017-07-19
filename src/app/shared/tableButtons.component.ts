import { Component, Input, OnInit } from '@angular/core';
import { Globals } from '../shared/globalVariables';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { Http } from '@angular/http';
import 'rxjs/add/operator/switchMap';
import * as FileSaver from "file-saver";
import Clipboard from 'ngx-clipboard';
//Services
import { BestSellerService } from '../bestsellers/bestsellers.service';
import { FilterService } from './filter.service';
import * as moment from 'moment';
import { AuthService } from './user/auth.service';
import { ExportService } from './export.service';

@Component({
    selector: 'table-buttons',
    templateUrl: './tableButtons.component.html',
    styleUrls: ['../../assets/sass/details.component.sass']
})

export class TableButtonsComponent implements OnInit{

  csvData:any;
  shareUrl:string = window.location.href;

  period = this.fs.activeParams.period[0];
  private BStype: string = this.bestSellers.type;

  userData = {};

  constructor(private globals: Globals,
  			  private fs: FilterService,
          private router: Router,
          private exportService: ExportService,
  			  private location: Location,
          private route: ActivatedRoute,
          private authService: AuthService,
          private bestSellers: BestSellerService){

          this.userData = JSON.parse(localStorage.getItem('currentUser'));
  }

  ngOnInit(): void {

  }

  euroToggle(){
    this.globals.euroToggle = !this.globals.euroToggle;
  }



	showEntries(count: number){
		this.fs.setRankEnd(this.fs.getRankStart()+count);
		this.location.replaceState(this.fs.paramsUrl(this.fs.baseUrl));
	}

}
