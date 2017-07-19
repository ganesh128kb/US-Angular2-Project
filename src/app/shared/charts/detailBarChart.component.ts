//Angular2 Specifics
import { Component, OnInit, ViewEncapsulation, ViewContainerRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { ISubscription, Subscription } from "rxjs/Subscription";

//Services
import { ArtistDetailService } from '../../details/artist/artist.service';
import { FilterService } from '../../shared/filter.service';
import { FilterDatesService } from '../../shared/filterDates.service';

import { Globals } from '../../shared/globalVariables';

//Third-party Libraries
import * as d3 from 'd3';
import * as _ from 'lodash';
import { chain } from 'lodash';

@Component({
    selector: 'detail-bar-chart',
    template: `
    <div class="row">
    <div class="col-6 text-right">
      <h3 class="top-regions__chart--label">8-Week Trend for</h3>
    </div>
    <div class="col-6 text-left">
      <div class="col-sm-2 filter__btn--container">
        <div ngbDropdown class="d-inline-block filter__dropdown" [open]="false">
          <button class="btn filter__btn" id="countryEightWeekDropdown" ngbDropdownToggle>{{ selectedCountry }} <i class="fa fa-angle-down" aria-hidden="true"></i></button>
          <div class="dropdown-menu" aria-labelledby="countryEightWeekDropdown">
            <div *ngFor="let item of countryNames; let i = index;">
              <div class="dropdown-item" (click)="selectCountry(item.territory)">{{ item.territory.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div *ngIf="!ready" class="col-4 chart-loading mx-auto">
    <svg class="mx-auto" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	    viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve">
	  <rect stroke="rgba(107,209,255, 1)" stroke-width="1" fill="rgba(107,209,255, 0.8)" width="6" height="100" transform="translate(0) rotate(180 3 50)">
	    <animate
	        attributeName="height"
	        attributeType="XML"
	        dur="1s"
	        values="30; 100; 30"
	        repeatCount="indefinite"/>
	  </rect>
	  <rect x="17" stroke="rgba(107,209,255, 1)" stroke-width="1" fill="rgba(107,209,255, 0.8)" width="6" height="100" transform="translate(0) rotate(180 20 50)">
	    <animate
	        attributeName="height"
	        attributeType="XML"
	        dur="1s"
	        values="30; 100; 30"
	        repeatCount="indefinite"
	        begin="0.1s"/>
	  </rect>
	  <rect x="40" stroke="rgba(107,209,255, 1)" stroke-width="1" fill="rgba(107,209,255, 0.8)" width="6" height="100" transform="translate(0) rotate(180 40 50)">
	    <animate
	        attributeName="height"
	        attributeType="XML"
	        dur="1s"
	        values="30; 100; 30"
	        repeatCount="indefinite"
	        begin="0.3s"/>
	  </rect>
	  <rect x="60" stroke="rgba(107,209,255, 1)" stroke-width="1" fill="rgba(107,209,255, 0.8)" width="6" height="100" transform="translate(0) rotate(180 58 50)">
	    <animate
	        attributeName="height"
	        attributeType="XML"
	        dur="1s"
	        values="30; 100; 30"
	        repeatCount="indefinite"
	        begin="0.5s"/>
	  </rect>
	  <rect x="80" stroke="rgba(107,209,255, 1)" stroke-width="1" fill="rgba(107,209,255, 0.8)" width="6" height="100" transform="translate(0) rotate(180 76 50)">
	    <animate
	        attributeName="height"
	        attributeType="XML"
	        dur="1s"
	        values="30; 100; 30"
	        repeatCount="indefinite"
	        begin="0.1s"/>
	  </rect>
	  </svg>
    </div>
    </div>
    <div id="detail-bar-chart" class="detail-bar-chart"></div>
    `,
    styles: [`
      /deep/ #detail-bar-chart-overview {
        position: relative;
        height: 0;
        width: 100%;
        padding: 0;
        padding-bottom: 100%;
      }
      /deep/ #detail-bar-chart > svg {
        position: absolute;
        height: 100%;
        width: 100%;
        left: 0;
        top: 0;
      }
      .chart-loading {
        text-align: center;
        font-size: 0.25rem;
        margin: 0 auto;
        padding-top: 3.5rem;
      }
        .chart-loading svg {
          width: 100px;
          height: 100px;
          display: inline-block;
        }
      .top-regions__chart--label {
        font-weight: 100;
        margin-bottom: 3rem;
        margin-left: 1.75rem;
      }
      .dropdown-item {
      	padding: 0.5rem 0.5rem 0.5rem 0.5rem;
      	background-color: #363b45;
      	color: #ffffff;
      	font-weight: 300;
        }
        .dropdown-item:hover {
          background-color: #60b9ef;
          color: #22252b;
          cursor: pointer;
        }
      .dropdown-menu {
        box-shadow: 2px 2px 4px rgba(0,0,0,0.15);
        padding: 0;
        border-radius: 0;
        width: 100px;
      }
      .filter__btn--container {
        margin-top: -0.5rem;
      }
      .filter__btn {
      	padding: 0.8rem 1.25rem 0.8rem 1.25rem;
      	width: 100%;
      	background: #22252b;
      	border: 1px solid #30343d;
      	font-weight: 100;
      	color: #fff;
      }
      /deep/ .bar {
        fill: rgba(96,185,239,0.75);
        stroke: rgba(96,185,239,1);
        stroke-width: 3px;
      }
      /deep/ .axis text {
        fill: #ccc;
        font-size: 0.8rem;
      }
      /deep/ .axis-left text {
        display: none;
      }
      /deep/ .axis-left path {
        stroke: #363b45;
      }
      /deep/ .axis-left .tick line {
        display: none;
      }
      /deep/ .axis .tick line {
        display: none;
      }
      /deep/ .axis path {
        stroke: #363b45;
      }
      /deep/ .grid line {
        stroke: #363b45;
      }
      /deep/ .grid path {
        stroke: none;
      }
      /deep/ .axis line {
        stroke: #363b45;
      }
	  `]
})

export class DetailBarChartComponent implements OnInit {

    private eightWeekRegionData: any;
    public subscriptionWeekRegion: ISubscription;
    private filterEmit: ISubscription;
    private dateEmit: ISubscription;
    encapsulation: ViewEncapsulation.None;

    public selectedCountry: any;
    public countryNames: any;

    ready: boolean;

    private w: any;
    private h: any;
    private m: any;
    public data: any;
    private svg: any;
    private elem;

    public ID: number;

    constructor(public artistService: ArtistDetailService,
        private route: ActivatedRoute,
        private location: Location,
        private router: Router,
        private viewContainerRef: ViewContainerRef,
        private fsDate: FilterDatesService,
        private fs: FilterService,
        private globals: Globals) {

		this.filterEmit = fs.TestServiceEmit.subscribe(
			event => {
                this.loadData();
			},
			err => console.log(err),
			() => {
				// console.log('Event Fired!');
			});

    this.dateEmit = this.fsDate.componentMethodCalled$.subscribe(
            () => {
                this.loadData();
            });

        this.artistService.addChangeCallBack(() => {
			this.loadData();
		});

        this.route.params.subscribe((params: Params) => {
            this.ID = params['artistID'];
            // this.loadData();
        });
    }

    ngOnInit(): void {
      if(!this.globals.isMobile) {
        this.loadData();
      }
        // console.log(this.countryNames);
    }

    selectCountry(country: any) {
        this.selectedCountry = country;
        this.selectedCountry = this.selectedCountry.name;
        this.artistService.selectCountry(country);
        // console.log(country);
        this.artistService.changeCallBack();
    }

    loadData() {
        this.ready = false;
        d3.select(this.elem).select('.detail-bar-chart svg').remove();
        let tempData;

        this.eightWeekRegionData = [];
        this.data = [];

        this.subscriptionWeekRegion = this.artistService.getEightWeekRegionData(this.ID).subscribe(
            res => tempData = res,
            err => console.log(err),
            () => {
                this.selectedCountry = this.artistService.selectedCountry.name;
                this.countryNames = this.artistService.countryNames;
                this.eightWeekRegionData = tempData.artist;
                // console.log('eightWeekChartBefore', this.eightWeekRegionData);

                this.eightWeekRegionData = chain({}).merge(
                    chain(this.eightWeekRegionData.weekly)
                        .filter(tot => !!tot.territory && tot.territory.id === this.artistService.selectedCountry.id)
                        .map(({ adjustedUnits, units, territory, interval }) => ({ adjustedTotalUnits: adjustedUnits.all, totalUnits: units.all, territory: territory.name, date: interval.date.year + "/" + interval.date.week }))
                        .groupBy(tot => tot.date)
                        .value(),
                )
                    .values()
                    .flatten()
                    .value();

                this.data = this.eightWeekRegionData;

                // console.log('eightWeekChart', this.eightWeekRegionData);

                this.ready = true;
                this.barChart();

            });

    }

    ngOnDestroy(): void {
      if(!this.globals.isMobile) {
            this.subscriptionWeekRegion.unsubscribe();
      }
      this.filterEmit.unsubscribe();
      this.dateEmit.unsubscribe();
    }

    barChart() {
        this.elem = this.viewContainerRef.element.nativeElement;
        d3.select(this.elem).select(".detail-bar-chart svg").remove();
        this.m = { top: 15, right: 50, bottom: 75, left: 15 };

        let h = 365 - this.m.top - this.m.bottom;
        let w = 575 - this.m.left - this.m.right;
        this.h = 365 - this.m.top - this.m.bottom;
        this.w = 575 - this.m.left - this.m.right;

        var width = 575;
        var height = 365;

        let emptyString: any = "";

        let x = d3.scaleBand()
            .range([0, this.w])
            .padding(0.15);

        let y = d3.scaleLinear()
            .range([this.h, 0]);

        let max: any = d3.max(this.data, function(d: any) { return d.totalUnits; });

        let dynamicColor;

        this.svg = d3.select(this.elem).select('.detail-bar-chart')
            .attr("style", "padding-bottom: " + Math.ceil(height * 100 / width) + "%")
            .append('svg')
            .attr("viewBox", "0 0 " + width + " " + height)
            .attr("width", this.w + this.m.left + this.m.right)
            .attr("height", this.h + this.m.top + this.m.bottom)
            .append("g")
            .attr("transform",
            "translate(" + this.m.left + "," + this.m.top + ")");

        let parseTime = d3.timeParse('%Y/%W');

        this.data.forEach(function(d) {
            d.date = parseTime(d.date);
            d.totalUnits = +d.totalUnits;
        });

        x.domain(this.data.map(function(d) { return d.date; }));
        y.domain([0, max + (max * 0.25)]);

        function make_y_gridlines() {
            return d3.axisRight(y)
                .ticks(5)
        }

        var tooltip = d3.select("body")
			.append("div")
			.style("position", "absolute")
			.style("z-index", "10")
			.style("visibility", "hidden")
			.style("padding", "10px")
			.style("border-radius", "5px")
			.style("background", "rgba(0,0,0,0.6)");

		var tooltipTimeFormat = d3.timeFormat("%W, %Y");
		var tooltipNumberFormat = d3.format(",.4r");

        this.svg.append("g")
            .attr("class", "grid")
            .attr("transform", "translate( " + this.w + ", 0 )")
            .call(make_y_gridlines()
                .tickSize(-this.w)
                .ticks(10)
                .tickFormat(emptyString)
            )

        this.svg.selectAll(".bar")
            .data(this.data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(d.date); })
            .attr("width", x.bandwidth())
            .attr("y", function(d) { return y(d.totalUnits); })
            .attr("height", function(d) { return h - y(d.totalUnits); })
            .on("mouseover", d => {
				return tooltip.style("visibility", "visible")
					.html("<div>" + "Week # " + tooltipTimeFormat(d.date) + "</div>" +
					"<div>" + "<strong>Units: </strong>" + tooltipNumberFormat(d.totalUnits) + "</div>"
					);
            })
            .on("mousemove", d => {
				return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
            })
            .on("mouseout", d => {
				return tooltip.style("visibility", "hidden");
            });

        this.svg.append("g")
            .attr('class', 'axis')
            .attr("transform", "translate(0," + this.h + ")")
            .call(d3.axisBottom(x).ticks(d3.timeWeek.every(1)).tickFormat(<any>d3.timeFormat("%W, %Y")))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-60)");

        this.svg.append("g")
            .attr('class', 'axis')
            .attr("transform", "translate( " + this.w + ", 0 )")
            .call(d3.axisRight(y).tickFormat(d3.format(".2s")));

        this.svg.append("g")
            .attr('class', 'axis-left')
            .call(d3.axisLeft(y));
    }
}
