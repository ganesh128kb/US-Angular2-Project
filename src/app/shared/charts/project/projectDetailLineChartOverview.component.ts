//Angular2 Specifics
import { Component, ViewContainerRef, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { ISubscription, Subscription } from "rxjs/Subscription";

//Services
import { ProjectDetailService } from '../../../details/project/project.service';
import { FilterService } from '../../../shared/filter.service';
import { ExportService } from '../../../shared/export.service';
import { FilterDatesService } from '../../../shared/filterDates.service';
import { Globals } from '../../../shared/globalVariables';

//Third-party Libraries
import * as d3 from 'd3';
import * as _ from 'lodash';
import * as moment from 'moment';
import { chain } from 'lodash';

@Component({
    selector: 'project-detail-line-chart-overview',
    template: `<div class="error"></div>
    <div id="project-detail-line-chart-overview" class="project-detail-line-chart-overview"></div>`,
    styles: [`
      /deep/ #project-detail-line-chart-overview {
        position: relative;
        height: 0;
        width: 100%;
        padding: 0;
        padding-bottom: 100%;
      }
      /deep/ #project-detail-line-chart-overview > svg {
        position: absolute;
        height: 100%;
        width: 100%;
        left: 0;
        top: 0;
      }
      /deep/ .dot circle {
        opacity: 0;
      }
      /deep/ .dot:hover circle {
        opacity: 1;
      }
      .chart-btn {
        margin-top: -50px !important;
      }
      /deep/ svg {
        display: block;
        margin: 0 auto;
      }
			/deep/ .axis line {
				stroke: #363b45;
			}
			/deep/ .axis path {
				display: none;
			}
      /deep/ .axis text {
        fill: #ccc;
        stroke: none;
        font-weight: 100;
        font-size: 0.65rem;
      }
			/deep/ .grid line {
				stroke: #363b45;
			}
			/deep/ .grid path {
				stroke: none;
			}
      /deep/ .legend text {
        fill: #fff;
        stroke: none;
        font-weight: 100;
      }
		`]
})

export class ProjectDetailLineChartOverviewComponent implements OnInit {

  private dailyMediaTypeData: any;
  encapsulation: ViewEncapsulation.None;

  private dailyMediaTypeAll: any;
  private dailyMediaTypeAirplay: any;
  private dailyMediaTypePhysicalAlbums: any;
  private dailyMediaTypeDigitalAlbums: any;
  private dailyMediaTypeDigitalTracks: any;
  private dailyMediaTypeStreams: any;
  private errorMessage: string = "No available chart data for current filter selection.";

  private dailyMediaTypeDataTest: any;

  private w: any;
  private h: any;
  private m: any;
  public data: any;
  private svg: any;
  private elem;

  public ID: number;

  //Subscriptions
  public subscriptionLineChartOverview: ISubscription;
  private filterEmit: ISubscription;
  private dateEmit: ISubscription;

  constructor(public projectService: ProjectDetailService,
      private route: ActivatedRoute,
      private location: Location,
      private router: Router,
      private viewContainerRef: ViewContainerRef,
      private fsDate: FilterDatesService,
      private fs: FilterService,
      private exportService: ExportService,
    private globals: Globals) {

      this.filterEmit = fs.TestServiceEmit.subscribe(
          event => {
      this.loadData();
      d3.select(this.elem).select(".project-detail-line-chart-overview svg").remove();
      d3.select(this.elem).select(".error svg").remove();
          },
          err => console.log(err),
          () => {
              // console.log('Event Fired!');
              d3.select(this.elem).select(".project-detail-line-chart-overview svg").remove();
              d3.select(this.elem).select(".error svg").remove();
          });

      this.dateEmit = fsDate.componentMethodCalled$.subscribe(
          () => {
              d3.select(this.elem).select(".project-detail-line-chart-overview svg").remove();
              d3.select(this.elem).select(".error svg").remove();
              this.loadData();
          });

      route.params.subscribe((params: Params) => {
          this.ID = params['projectID'];
      });

  }

  ngOnInit(): void {
    if(!this.globals.isMobile) {
      this.loadData();
    }
  }

  ngOnDestroy(): void {
    if(!this.globals.isMobile) {
    this.subscriptionLineChartOverview.unsubscribe();
    }
    this.filterEmit.unsubscribe();
    this.dateEmit.unsubscribe();
  }

  loadData() {

      d3.select(this.elem).select(".project-detail-line-chart-overview svg").remove();
      d3.select(this.elem).select(".error svg").remove();
      let tempData;
      this.dailyMediaTypeData = [];
      this.data = [];

      this.subscriptionLineChartOverview = this.projectService.getLineChartOverviewData(this.ID).subscribe(
          res => tempData = res,
          err => console.log(err),
          () => {
              const dateForm = this.fs.activeParams.date[0] ? this.fs.activeParams.date[0] : [];
              this.dailyMediaTypeData = tempData.project;
              // console.log('mediaTypeData', this.dailyMediaTypeData);

              // this.dailyMediaTypeDataTest = tempData.artist.totals['units'];
              // console.log('mediaTypeDataTest', this.dailyMediaTypeDataTest);

              this.dailyMediaTypeData = chain({}).merge(
                  chain(this.dailyMediaTypeData.totals)
                      // .filter(tot => !!tot.partner && tot.partner.name != "Google" && tot.partner.name != "YouTube" && tot.partner.name != "VEVO" && tot.partner.name != "Others")
                      .map(({ adjustedUnits, units, interval }) => ({ airplays: units.airplays, all: units.all, digitalAlbums: units.digitalAlbums, digitalTracks: units.digitalTracks, physicalAlbums: units.physicalAlbums, streams: units.streams, adjustedAll: adjustedUnits.all, adjustedDigitalAlbums: adjustedUnits.digitalAlbums, adjustedDigitalTracks: adjustedUnits.digitalTracks, adjustedPhysicalAlbums: adjustedUnits.physicalAlbums, adjustedStreams: adjustedUnits.streams, date: interval.date.year + "/" + interval.date.month + "/" + interval.date.day, dateMonth: interval.date.year + "/" + interval.date.month, dateWeek: interval.date.year + "/" + interval.date.week, dateQuarter: interval.date.year + "/" + interval.date.quarter, year: interval.date.year, week: interval.date.week, quarter: interval.date.quarter }))
                      .value(),
              )
                  .values()
                  .flatten()
                  .value();

              // console.log('lineChartOverviewBeforeChange', this.dailyMediaTypeData);

              switch (dateForm.period) {
                  case "Year":

          this.dailyMediaTypeAll = _(this.dailyMediaTypeData)
            .groupBy('dateMonth')
            .map((v, k) => ({
              date: k,
              dateMain: v[0].date,
              dateMonth: v[0].dateMonth,
              units: _.sumBy(v, 'all'),
              adjustedUnits: _.sumBy(v, 'adjustedAll'),
              mediaType: "All"
            })).value();

          this.dailyMediaTypeDigitalAlbums = _(this.dailyMediaTypeData)
            .groupBy('dateMonth')
            .map((v, k) => ({
              date: k,
              dateMain: v[0].date,
              dateMonth: v[0].dateMonth,
              units: _.sumBy(v, 'digitalAlbums'),
              adjustedUnits: _.sumBy(v, 'adjustedDigitalAlbums'),
              mediaType: "Digital Albums"
            })).value();

          this.dailyMediaTypeDigitalTracks = _(this.dailyMediaTypeData)
            .groupBy('dateMonth')
            .map((v, k) => ({
              date: k,
              dateMain: v[0].date,
              dateMonth: v[0].dateMonth,
              units: _.sumBy(v, 'digitalTracks'),
              adjustedUnits: _.sumBy(v, 'adjustedDigitalTracks'),
              mediaType: "Digital Tracks"
            })).value();

          this.dailyMediaTypeStreams = _(this.dailyMediaTypeData)
            .groupBy('dateMonth')
            .map((v, k) => ({
              date: k,
              dateMain: v[0].date,
              dateMonth: v[0].dateMonth,
              units: _.sumBy(v, 'streams'),
              adjustedUnits: _.sumBy(v, 'adjustedStreams'),
              mediaType: "Streams"
            })).value();

          break;
                  case "Quarter":

          this.dailyMediaTypeAll = _(this.dailyMediaTypeData)
            .groupBy('dateQuarter')
            .map((v, k) => ({
              date: k,
              dateMain: v[0].date,
              dateQuarter: v[0].dateQuarter,
              quarter: v[0].quarter,
              units: _.sumBy(v, 'all'),
              adjustedUnits: _.sumBy(v, 'adjustedAll'),
              mediaType: "All"
            })).value();

          this.dailyMediaTypeDigitalAlbums = _(this.dailyMediaTypeData)
            .groupBy('dateQuarter')
            .map((v, k) => ({
              date: k,
              dateMain: v[0].date,
              dateQuarter: v[0].dateQuarter,
              quarter: v[0].quarter,
              units: _.sumBy(v, 'digitalAlbums'),
              adjustedUnits: _.sumBy(v, 'adjustedDigitalAlbums'),
              mediaType: "Digital Albums"
            })).value();

          this.dailyMediaTypeDigitalTracks = _(this.dailyMediaTypeData)
            .groupBy('dateQuarter')
            .map((v, k) => ({
              date: k,
              dateMain: v[0].date,
              dateQuarter: v[0].dateQuarter,
              quarter: v[0].quarter,
              units: _.sumBy(v, 'digitalTracks'),
              adjustedUnits: _.sumBy(v, 'adjustedDigitalTracks'),
              mediaType: "Digital Tracks"
            })).value();

          this.dailyMediaTypeStreams = _(this.dailyMediaTypeData)
            .groupBy('dateQuarter')
            .map((v, k) => ({
              date: k,
              dateMain: v[0].date,
              dateQuarter: v[0].dateQuarter,
              quarter: v[0].quarter,
              units: _.sumBy(v, 'streams'),
              adjustedUnits: _.sumBy(v, 'adjustedStreams'),
              mediaType: "Streams"
            })).value();

          break;
                  case "Month":

          this.dailyMediaTypeAll = _(this.dailyMediaTypeData)
            .groupBy('dateMonth')
            .map((v, k) => ({
              date: k,
              dateMain: v[0].date,
              dateMonth: v[0].dateMonth,
              units: _.sumBy(v, 'all'),
              adjustedUnits: _.sumBy(v, 'adjustedAll'),
              mediaType: "All"
            })).value();

          this.dailyMediaTypeDigitalAlbums = _(this.dailyMediaTypeData)
            .groupBy('dateMonth')
            .map((v, k) => ({
              date: k,
              dateMain: v[0].date,
              dateMonth: v[0].dateMonth,
              units: _.sumBy(v, 'digitalAlbums'),
              adjustedUnits: _.sumBy(v, 'adjustedDigitalAlbums'),
              mediaType: "Digital Albums"
            })).value();

          this.dailyMediaTypeDigitalTracks = _(this.dailyMediaTypeData)
            .groupBy('dateMonth')
            .map((v, k) => ({
              date: k,
              dateMain: v[0].date,
              dateMonth: v[0].dateMonth,
              units: _.sumBy(v, 'digitalTracks'),
              adjustedUnits: _.sumBy(v, 'adjustedDigitalTracks'),
              mediaType: "Digital Tracks"
            })).value();

          this.dailyMediaTypeStreams = _(this.dailyMediaTypeData)
            .groupBy('dateMonth')
            .map((v, k) => ({
              date: k,
              dateMain: v[0].date,
              dateMonth: v[0].dateMonth,
              units: _.sumBy(v, 'streams'),
              adjustedUnits: _.sumBy(v, 'adjustedStreams'),
              mediaType: "Streams"
            })).value();

          break;
                  case "Week":

          this.dailyMediaTypeAll = _(this.dailyMediaTypeData)
            .groupBy('dateWeek')
            .map((v, k) => ({
              date: k,
              dateMain: v[0].date,
              dateWeek: v[0].dateWeek,
              units: _.sumBy(v, 'all'),
              adjustedUnits: _.sumBy(v, 'adjustedAll'),
              mediaType: "All"
            })).value();

          this.dailyMediaTypeDigitalAlbums = _(this.dailyMediaTypeData)
            .groupBy('dateWeek')
            .map((v, k) => ({
              date: k,
              dateMain: v[0].date,
              dateWeek: v[0].dateWeek,
              units: _.sumBy(v, 'digitalAlbums'),
              adjustedUnits: _.sumBy(v, 'adjustedDigitalAlbums'),
              mediaType: "Digital Albums"
            })).value();

          this.dailyMediaTypeDigitalTracks = _(this.dailyMediaTypeData)
            .groupBy('dateWeek')
            .map((v, k) => ({
              date: k,
              dateMain: v[0].date,
              dateWeek: v[0].dateWeek,
              units: _.sumBy(v, 'digitalTracks'),
              adjustedUnits: _.sumBy(v, 'adjustedDigitalTracks'),
              mediaType: "Digital Tracks"
            })).value();

          this.dailyMediaTypeStreams = _(this.dailyMediaTypeData)
            .groupBy('dateWeek')
            .map((v, k) => ({
              date: k,
              dateMain: v[0].date,
              dateWeek: v[0].dateWeek,
              units: _.sumBy(v, 'streams'),
              adjustedUnits: _.sumBy(v, 'adjustedStreams'),
              mediaType: "Streams"
            })).value();

          break;
        default:

          this.dailyMediaTypeAll = _(this.dailyMediaTypeData)
            .groupBy('date')
            .map((v, k) => ({
              date: k,
              dateMain: v[0].date,
              units: _.sumBy(v, 'all'),
              adjustedUnits: _.sumBy(v, 'adjustedAll'),
              mediaType: "All"
            })).value();

          this.dailyMediaTypeDigitalAlbums = _(this.dailyMediaTypeData)
            .groupBy('date')
            .map((v, k) => ({
              date: k,
              dateMain: v[0].date,
              units: _.sumBy(v, 'digitalAlbums'),
              adjustedUnits: _.sumBy(v, 'adjustedDigitalAlbums'),
              mediaType: "Digital Albums"
            })).value();

          this.dailyMediaTypeDigitalTracks = _(this.dailyMediaTypeData)
            .groupBy('date')
            .map((v, k) => ({
              date: k,
              dateMain: v[0].date,
              units: _.sumBy(v, 'digitalTracks'),
              adjustedUnits: _.sumBy(v, 'adjustedDigitalTracks'),
              mediaType: "Digital Tracks"
            })).value();

          this.dailyMediaTypeStreams = _(this.dailyMediaTypeData)
            .groupBy('date')
            .map((v, k) => ({
              date: k,
              dateMain: v[0].date,
              units: _.sumBy(v, 'streams'),
              adjustedUnits: _.sumBy(v, 'adjustedStreams'),
              mediaType: "Streams"
            })).value();
                      break;

              }

              // console.log('dailyMediaTypeAll', this.dailyMediaTypeAll);

              this.dailyMediaTypeAll = d3.nest().key(function(d: any) { return d.mediaType; }).entries(this.dailyMediaTypeAll);

              this.dailyMediaTypeDigitalAlbums = d3.nest().key(function(d: any) { return d.mediaType; }).entries(this.dailyMediaTypeDigitalAlbums);

              this.dailyMediaTypeDigitalTracks = d3.nest().key(function(d: any) { return d.mediaType; }).entries(this.dailyMediaTypeDigitalTracks);

              this.dailyMediaTypeStreams = d3.nest().key(function(d: any) { return d.mediaType; }).entries(this.dailyMediaTypeStreams);

              this.dailyMediaTypeData = this.dailyMediaTypeAll.concat(this.dailyMediaTypeStreams).concat(this.dailyMediaTypeDigitalTracks).concat(this.dailyMediaTypeDigitalAlbums); //.concat(this.dailyMediaTypePhysicalAlbums).concat(this.dailyMediaTypeAirplay)

              this.exportService.lineChartOverviewData = this.dailyMediaTypeData;

              this.data = this.dailyMediaTypeData;

              //     var stack = d3.stack()
              //     .keys(["All", "Streams", "Digital Tracks", "Digital Albums"])
              //     .order(d3.stackOrderNone)
              //     .offset(d3.stackOffsetNone);
              //
              // var series = stack(this.dailyMediaTypeData.units);
              //
              // console.log('d3Stack', series);

              // console.log('lineChartOverview', this.data);

              this.lineChartOverview();

          });

  }

  lineChartOverview() {
      // console.log(this.data);
      this.elem = this.viewContainerRef.element.nativeElement;
      d3.select(this.elem).select(".project-detail-line-chart-overview svg").remove();
      d3.select(this.elem).select(".error svg").remove();
      this.m = { top: 50, right: 150, bottom: 75, left: 40 };
      this.w = 1200 - this.m.left - this.m.right;
      this.h = 400 - this.m.top - this.m.bottom;

      var width = 1200;
      var height = 400;

      let parseTime;
      let numberFormat
      let xScale;
      let yScale;

      let emptyString: any = "";

      let maxSpacing: any = d3.max(this.data, (co: any) => d3.max(co.values, (d: any) => d.adjustedUnits));

      let minY: any = d3.min(this.data, (co: any) => d3.min(co.values, (d: any) => d.adjustedUnits));
      let maxY: any = d3.max(this.data, (co: any) => d3.max(co.values, (d: any) => d.adjustedUnits + (maxSpacing * 0.20)));

  this.svg = d3.select(this.elem).select('.project-detail-line-chart-overview')
    .attr("style", "padding-bottom: " + Math.ceil(height * 100 / width) + "%")
    .append('svg')
    .attr("viewBox", "0 0 " + width + " " + height)
    .attr('width', this.w + this.m.left + this.m.right)
    .attr('height', this.h + this.m.top + this.m.bottom)
    .append('g')
    .attr('transform', `translate(${this.m.left}, ${this.m.top})`);

  const dateForm = this.fs.activeParams.date[0] ? this.fs.activeParams.date[0] : "default";

  switch (dateForm.period) {

    case "Year":

      parseTime = d3.timeParse('%Y/%m');
      // numberFormat = d3.format(",.4r");

      this.data.forEach(mediaType => {
        mediaType.values.forEach(d => {
          d.date = parseTime(d.dateMonth);
          d.adjustedUnits = +d.adjustedUnits;
        });
      });

      xScale = d3.scaleTime()
        .domain(<any>[d3.min(this.data, (co: any) => d3.min(co.values, (d: any) => d.date)), d3.max(this.data, (co: any) => d3.max(co.values, (d: any) => d.date))])
        .range([0, this.w]);

      yScale = d3.scaleLinear()
        .domain([minY, maxY])
        .range([this.h, 0]);

      break;
    case "Quarter":

      parseTime = d3.timeParse('%Y/%m');

      this.data.forEach(mediaType => {
        mediaType.values.forEach(d => {
          d.date = moment(d.dateQuarter, "YYYY/0Q").endOf('quarter').format("YYYY/MM");
          d.date = parseTime(d.date);
          // d.date = d.quarter;
          d.adjustedUnits = +d.adjustedUnits;
        });
      });

      xScale = d3.scaleTime()
        .domain(<any>[d3.min(this.data, (co: any) => d3.min(co.values, (d: any) => d.date)), d3.max(this.data, (co: any) => d3.max(co.values, (d: any) => d.date))])
        .range([0, this.w]);

      yScale = d3.scaleLinear()
        .domain([minY, maxY])
        .range([this.h, 0]);

      break;
    case "Month":

      parseTime = d3.timeParse('%Y/%m');

      this.data.forEach(mediaType => {
        mediaType.values.forEach(d => {
          d.date = parseTime(d.dateMonth);
          d.adjustedUnits = +d.adjustedUnits;
        });
      });

      xScale = d3.scaleTime()
        .domain(<any>[d3.min(this.data, (co: any) => d3.min(co.values, (d: any) => d.date)), d3.max(this.data, (co: any) => d3.max(co.values, (d: any) => d.date))])
        .range([0, this.w]);

      yScale = d3.scaleLinear()
        .domain([minY, maxY])
        .range([this.h, 0]);

      break;
    case "Week":

      parseTime = d3.timeParse('%Y/%W');

      this.data.forEach(mediaType => {
        mediaType.values.forEach(d => {
          d.date = parseTime(d.dateWeek);
          d.adjustedUnits = +d.adjustedUnits;
        });
      });

      xScale = d3.scaleTime()
        .domain(<any>[d3.min(this.data, (co: any) => d3.min(co.values, (d: any) => d.date)), d3.max(this.data, (co: any) => d3.max(co.values, (d: any) => d.date))])
        .range([0, this.w]);

      yScale = d3.scaleLinear()
        .domain([minY, maxY])
        .range([this.h, 0]);

      break;
    default:

      parseTime = d3.timeParse('%Y/%m/%d');

      this.data.forEach(mediaType => {
        mediaType.values.forEach(d => {
          d.date = parseTime(d.date);
          d.adjustedUnits = +d.adjustedUnits;
        });
      });

      xScale = d3.scaleTime()
        .domain(<any>[d3.min(this.data, (co: any) => d3.min(co.values, (d: any) => d.date)), d3.max(this.data, (co: any) => d3.max(co.values, (d: any) => d.date))])
        .range([0, this.w]);

      yScale = d3.scaleLinear()
        .domain([minY, maxY])
        .range([this.h, 0]);

      break;

  }

  function make_x_gridlines() {
    return d3.axisBottom(xScale).ticks(5)
  }

  function make_y_gridlines() {
    return d3.axisLeft(yScale).ticks(5)
  }

  switch (dateForm.period) {
    case "Year":

      this.svg
        .append('g')
        .attr('stroke', '#cccccc')
        .attr('font-weight', '100')
        .attr('class', 'axis')
        .attr('transform', `translate(0, ${this.h})`)
        .call(d3.axisBottom(xScale).ticks(d3.timeMonth.every(1)).tickFormat(d3.timeFormat("%b %Y")));

      this.svg.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0," + this.h + ")")
        .call(make_x_gridlines()
          .tickSize((-this.h, 0, 0))
          .ticks(d3.timeMonth.every(1))
          .tickFormat(emptyString)
        )

      break;
    case "Quarter":
      this.svg
        .append('g')
        .attr('stroke', '#cccccc')
        .attr('font-weight', '100')
        .attr('class', 'axis')
        .attr('transform', `translate(0, ${this.h})`)
        .call(d3.axisBottom(xScale).ticks(d3.timeMonth.every(2)).tickFormat(d3.timeFormat("%b %Y")));

      this.svg.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0," + this.h + ")")
        .call(make_x_gridlines().tickSize(-this.h).ticks(d3.timeMonth.every(2)).tickFormat(emptyString));

      break;
    case "Month":

      this.svg
        .append('g')
        .attr('stroke', '#cccccc')
        .attr('font-weight', '100')
        .attr('class', 'axis')
        .attr('transform', `translate(0, ${this.h})`)
        .call(d3.axisBottom(xScale).ticks(d3.timeMonth.every(1)).tickFormat(d3.timeFormat("%b %Y")));

      this.svg.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0," + this.h + ")")
        .call(make_x_gridlines().tickSize(-this.h).ticks(d3.timeMonth.every(1)).tickFormat(emptyString));

      break;
    case "Week":

      this.svg
        .append('g')
        .attr('stroke', '#cccccc')
        .attr('font-weight', '100')
        .attr('class', 'axis')
        .attr('transform', `translate(0, ${this.h})`)
        .call(d3.axisBottom(xScale).ticks(d3.timeWeek.every(1)).tickFormat(d3.timeFormat("%W, %Y"))) //change to show Fri beg day need moment js
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-50)");

      this.svg.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0," + this.h + ")")
        .call(make_x_gridlines().tickSize(-this.h).ticks(d3.timeWeek.every(1)).tickFormat(emptyString));

      break;
    default:

      this.svg
        .append('g')
        .attr('stroke', '#cccccc')
        .attr('font-weight', '100')
        .attr('class', 'axis')
        .attr('transform', `translate(0, ${this.h})`)
        .call(d3.axisBottom(xScale).ticks(d3.timeWeek.every(2)).tickFormat(d3.timeFormat("%b %d, %Y")))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-50)");

      this.svg.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0," + this.h + ")")
        .call(make_x_gridlines().tickSize(-this.h).ticks(d3.timeWeek.every(2)).tickFormat(emptyString));

      break;

  }

  this.svg
    .append('g')
    .attr('stroke', '#cccccc')
    .attr('font-weight', '100')
    .attr('class', 'axis')
    .call(d3.axisLeft(yScale).tickFormat(d3.format(".2s")));

  this.svg.append("g")
    .attr("class", "grid")
    .call(make_y_gridlines().tickSize(-this.w).ticks(10).tickFormat(emptyString))

    // var stack = d3.stack()
        // .offset("zero")
        // .values(function(d) { return d.values; })
        // .x(function(d) { return d.date; })
        // .y(function(d) { return d.adjustedUnits; });

  let line = d3.line()
    .x((d: any) => xScale(d.date))
    .y((d: any) => yScale(d.adjustedUnits));
  // .curve(d3.curveCatmullRom.alpha(0.2));

  let area = d3.area()
    .x((d: any) => xScale(d.date))
    .y0(yScale(yScale.domain()[0]))
    .y1((d: any) => yScale(d.adjustedUnits));
  // .curve(d3.curveCatmullRom.alpha(0.2));

  let color = d3.scaleOrdinal()
    .range(["#148baf", "#1bafea", "#6bd4ec", "#ddf4f7"]); //, "#a6d9e8"

  let lines = this.svg
    .selectAll('.line')
    .data(d => this.data)
    .enter()
    .append('path')
    .attr('class', 'line')
    .attr('d', d => line(d.values))
    .style('stroke', (d, i) => ["#148baf", "#1bafea", "#6bd4ec", "#ddf4f7"][i]) //, "#a6d9e8"
    .style('stroke-width', 2)
    .style('fill', 'none');

  this.svg
    .selectAll('.area')
    .data(this.data)
    .enter()
    .append('path')
    .attr('class', 'area')
    .attr('d', d => area(d.values))
    .style('stroke', (d, i) => ["#148baf", "#1bafea", "#6bd4ec", "#ddf4f7"][i]) //"#ff7bac" Airplay color when data becomes available.
    .style('stroke-width', 1)
    .style('fill', (d, i) => ["#148baf", "#1bafea", "#6bd4ec", "#ddf4f7"][i])
    .style('fill-opacity', 0.65);

  var length = this.data.length;

  var tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .style("padding", "10px")
    .style("border-radius", "5px")
    .style("background", "rgba(0,0,0,0.6)");

  var tooltipTimeFormat = d3.timeFormat("%b %d, %Y");
  var tooltipNumberFormat = d3.format(",.4r");

  for (var i = 0; i < length; i++) {

    let colors = ["#148baf", "#1bafea", "#6bd4ec", "#ddf4f7"][i];

    let circles = this.svg
      .selectAll('.dots')
      .data(this.data[i].values)
      .enter()
      .append("g")
      .attr('class', 'dots')
      .attr('class', 'dot')
      .attr("transform", d => {
        return "translate(" + xScale(d.date) + "," + yScale(d.adjustedUnits) + ")";
      })
      .append("circle")
      .attr('r', 8)
      .attr('stroke', '#121212')
      .attr('stroke-width', '1')
      .attr('fill', colors)
      .style('fill-opacity', 0.9)
      .on("mouseover", d => {
        return tooltip.style("visibility", "visible")
          .html("<div class='row' style='padding: 10px;'>" + "<div style='background-color:" + colors + "; width: 15px; height: 15px; padding: 10px; margin-left: 5px;'>" + "</div>" +
          "<div style='color:" + colors + "; font-weight: 100; padding-left: 10px;'>" + d.mediaType + "</div>" + "</div>" +
          "<div>" + tooltipTimeFormat(d.date) + "</div>" +
          "<div>" + "<strong>Adjusted: </strong>" + tooltipNumberFormat(d.adjustedUnits) + "</div>" +
          "<div>" + "<strong>Raw: </strong>" + tooltipNumberFormat(d.units) + "</div>"
                      );
      })
      .on("mousemove", d => {
        return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
      })
      .on("mouseout", d => {
        return tooltip.style("visibility", "hidden");
      });
  }

  let legendRectSize = 12;
  let legendSpacing = 6;

  let legend = this.svg.selectAll('.legend')
    .data(color.range())
    .enter()
    .append('g')
    .attr('class', 'legend')
    .attr('transform', function(d, i) {
      var height = legendRectSize + legendSpacing;
      var offset = height * color.domain().length / 2;
      var horz = legendRectSize;
      var vert = i * height - offset;
      return 'translate(' + 1050 + ',' + vert + ')';
    });

  legend.append('rect')
    .attr('width', legendRectSize)
    .attr('height', legendRectSize)
    .style('fill', color)
    .style('stroke', color);

  legend.append('text')
    .style('fill', color)
    .style('font-size', '0.8em')
    .data(this.data)
    .attr('x', legendRectSize + legendSpacing)
    .attr('y', legendRectSize - legendSpacing)
    .attr("dx", 5)
    .attr("dy", 5)
    .text(function(d) { return d.key });

      if (this.data.length < 0) {
          this.svg = d3.select(this.elem).select('.error').append('svg')
              .attr('width', this.w)
              .attr('height', '200px')
              .append('text')
              .text(this.errorMessage)
              .style('fill', '#ccc')
              .style('font-size', '12px')
              .attr('transform', `translate(200, 100)`);
      };
  }
}
