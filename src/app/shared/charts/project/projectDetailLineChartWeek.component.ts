//Angular2 Specifics
import { Component, ViewContainerRef, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
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
    selector: 'project-detail-line-chart-week-partners',
    template: `
    <div id="project-detail-line-chart-week-partners" class="project-detail-line-chart-week-partners"></div>`,
    styles: [`
      /deep/ #project-detail-line-chart-week-partners {
        position: relative;
        height: 0;
        width: 100%;
        padding: 0;
        padding-bottom: 100%;
      }
      /deep/ #project-detail-line-chart-week-partners > svg {
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
      /deep/ .line.positive {
        stroke: #179dc6;
      }
      /deep/ .line.negative {
        stroke: red;
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

export class ProjectDetailLineChartWeekComponent implements OnInit {

    private dailyMediaTypeData: any;
    public subscriptionLineChartOverview: ISubscription;
    private filterEmit: ISubscription;
    private dateEmit: ISubscription;
    encapsulation: ViewEncapsulation.None;

    private dailyMediaTypeAll: any;
    private dailyMediaTypeAirplay: any;
    private dailyMediaTypePhysicalAlbums: any;
    private dailyMediaTypeDigitalAlbums: any;
    private dailyMediaTypeDigitalTracks: any;
    private dailyMediaTypeStreams: any;
    private errorMessage: string = "No available chart data for current filter selection.";

    private w: any;
    private h: any;
    private m: any;
    public data: any;
    private svg: any;
    private elem;

    public ID: number;

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
            event => this.loadData(),
            err => console.log(err),
            () => {
                // console.log('Event Fired!');
                d3.select(this.elem).select(".project-detail-line-chart-week-partners svg").remove();
            });

        this.dateEmit = fsDate.componentMethodCalled$.subscribe(
            () => {
                d3.select(this.elem).select(".project-detail-line-chart-week-partners svg").remove();
                this.loadData();
            });

        route.params.subscribe((params: Params) => {
            this.ID = params['projectID'];
            // this.loadData();
        });

    }

    ngOnInit(): void {
      if(!this.globals.isMobile) {
        this.loadData();
      }
    }

    loadData() {
        d3.select(this.elem).select(".project-detail-line-chart-week-partners svg").remove();
        let tempData;
        this.dailyMediaTypeData = [];
        this.data = [];

        this.subscriptionLineChartOverview = this.projectService.getLineChartOverviewData(this.ID).subscribe(
            res => tempData = res,
            err => console.log(err),
            () => {
                this.dailyMediaTypeData = tempData.project;
                // console.log(this.dailyMediaTypeData);

                this.dailyMediaTypeData = chain({}).merge(
                    chain(this.dailyMediaTypeData.totals)
                        // .filter(tot => !!tot.partner && tot.partner.name != "Google" && tot.partner.name != "YouTube" && tot.partner.name != "VEVO" && tot.partner.name != "Others")
                        .map(({ adjustedUnits, units, interval }) => ({ airplays: units.airplays, all: units.all, digitalAlbums: units.digitalAlbums, digitalTracks: units.digitalTracks, physicalAlbums: units.physicalAlbums, streams: units.streams, adjustedAll: adjustedUnits.all, adjustedDigitalAlbums: adjustedUnits.digitalAlbums, adjustedDigitalTracks: adjustedUnits.digitalTracks, adjustedPhysicalAlbums: adjustedUnits.physicalAlbums, adjustedStreams: adjustedUnits.streams, date: interval.date.year + "/" + interval.date.month + "/" + interval.date.day, dateMonth: interval.date.year + "/" + interval.date.month, dateWeek: interval.date.year + "/" + interval.date.week, dateQuarter: interval.date.year + "/" + interval.date.quarter, year: interval.date.year, week: interval.date.week, quarter: interval.date.quarter }))
                        .value(),
                )
                    .values()
                    .flatten()
                    .value();

				const dateForm = this.fs.activeParams.date[0] ? this.fs.activeParams.date[0] : "default";

				switch (dateForm.period) {

					case "Year":

						this.dailyMediaTypePhysicalAlbums = _(this.dailyMediaTypeData)
							.groupBy('dateMonth')
							.map((v, k) => ({
								date: k,
								dateMain: v[0].date,
								dateMonth: v[0].dateMonth,
								units: _.sumBy(v, 'physicalAlbums'),
								adjustedUnits: _.sumBy(v, 'adjustedPhysicalAlbums'),
								mediaType: "Physical Albums"
							})).value();

						break;
					case "Quarter":

						this.dailyMediaTypePhysicalAlbums = _(this.dailyMediaTypeData)
                            .groupBy('dateQuarter')
                            .map((v, k) => ({
								date: k,
								dateMain: v[0].date,
								dateQuarter: v[0].dateQuarter,
								quarter: v[0].quarter,
								units: _.sumBy(v, 'physicalAlbums'),
								adjustedUnits: _.sumBy(v, 'adjustedPhysicalAlbums'),
								mediaType: "Physical Albums"
                            })).value();

						break;
					case "Month":

						this.dailyMediaTypePhysicalAlbums = _(this.dailyMediaTypeData)
							.groupBy('dateMonth')
							.map((v, k) => ({
								date: k,
								dateMain: v[0].date,
								dateMonth: v[0].dateMonth,
								units: _.sumBy(v, 'physicalAlbums'),
								adjustedUnits: _.sumBy(v, 'adjustedPhysicalAlbums'),
								mediaType: "Physical Albums"
							})).value();

						break;
					case "Week":

						this.dailyMediaTypePhysicalAlbums = _(this.dailyMediaTypeData)
							.groupBy('dateWeek')
							.map((v, k) => ({
								date: k,
								dateMain: v[0].date,
								dateWeek: v[0].dateWeek,
								units: _.sumBy(v, 'physicalAlbums'),
								adjustedUnits: _.sumBy(v, 'adjustedPhysicalAlbums'),
								mediaType: "Physical Albums"
							})).value();

						break;
					default:

						this.dailyMediaTypePhysicalAlbums = _(this.dailyMediaTypeData)
							.groupBy('date')
							.map((v, k) => ({
								date: k,
								dateMain: v[0].date,
								units: _.sumBy(v, 'physicalAlbums'),
								adjustedUnits: _.sumBy(v, 'adjustedPhysicalAlbums'),
								mediaType: "Physical Albums"
							})).value();

						break;

				}

                this.dailyMediaTypePhysicalAlbums = d3.nest().key(function(d: any) { return d.mediaType; }).entries(this.dailyMediaTypePhysicalAlbums);

                this.exportService.lineChartWeekPartnersData = this.dailyMediaTypePhysicalAlbums;

                this.data = this.dailyMediaTypePhysicalAlbums;

                // console.log('lineChartWeekPartners', this.data);

                this.lineChartWeekPartners();

            });

    }

    ngOnDestory(): void{
      if(!this.globals.isMobile) {
      this.subscriptionLineChartOverview.unsubscribe();
      }
      this.filterEmit.unsubscribe();
      this.dateEmit.unsubscribe();
    }

    lineChartWeekPartners() {
        // console.log(this.data);
        this.elem = this.viewContainerRef.element.nativeElement;
        this.m = { top: 50, right: 150, bottom: 75, left: 40 };
        this.w = 1200 - this.m.left - this.m.right;
        this.h = 400 - this.m.top - this.m.bottom;

        var width = 1200;
        var height = 400;

        let parseTime;
        let decimalFormat = d3.format('.01f');
        let emptyString: any = "";

        let maxSpacing: any = d3.max(this.data, (co: any) => d3.max(co.values, (d: any) => d.adjustedUnits));
        let minY: any = d3.min(this.data, (co: any) => d3.min(co.values, (d: any) => d.adjustedUnits));
        let maxY: any = d3.max(this.data, (co: any) => d3.max(co.values, (d: any) => d.adjustedUnits + (maxSpacing * 0.20)));

		this.svg = d3.select(this.elem).select('.project-detail-line-chart-week-partners')
      .attr("style", "padding-bottom: " + Math.ceil(height * 100 / width) + "%")
      .append('svg')
      .attr("viewBox", "0 0 " + width + " " + height)
			.attr('width', this.w + this.m.left + this.m.right)
			.attr('height', this.h + this.m.top + this.m.bottom)
			.append('g')
			.attr('transform', `translate(${this.m.left}, ${this.m.top})`);

		const dateForm = this.fs.activeParams.date[0] ? this.fs.activeParams.date[0] : [];

		switch (dateForm.period) {

			case "Year":

				parseTime = d3.timeParse('%Y/%m');

				this.data.forEach(mediaType => {
					mediaType.values.forEach(d => {
						d.date = parseTime(d.dateMonth);
						d.adjustedUnits = +d.adjustedUnits;
					});
				});

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

				break;
			case "Month":

				parseTime = d3.timeParse('%Y/%m');

				this.data.forEach(mediaType => {
					mediaType.values.forEach(d => {
						d.date = parseTime(d.dateMonth);
						d.adjustedUnits = +d.adjustedUnits;
					});
				});

				break;
			case "Week":

				parseTime = d3.timeParse('%Y/%W');

				this.data.forEach(mediaType => {
					mediaType.values.forEach(d => {
						d.date = parseTime(d.dateWeek);
						d.adjustedUnits = +d.adjustedUnits;
					});
				});

				break;
			default:

				parseTime = d3.timeParse('%Y/%m/%d');

				this.data.forEach(mediaType => {
					mediaType.values.forEach(d => {
						d.date = parseTime(d.date);
						d.adjustedUnits = +d.adjustedUnits;
					});
				});

				break;

		}

		let yScale = d3.scaleLinear()
			.domain([minY, maxY])
			.range([this.h, 0]);

		let xScale = d3.scaleTime()
			.domain(<any>[d3.min(this.data, (co: any) => d3.min(co.values, (d: any) => d.date)), d3.max(this.data, (co: any) => d3.max(co.values, (d: any) => d.date))])
			.range([0, this.w]);

		function make_x_gridlines() {
			return d3.axisBottom(xScale)
				.ticks(5)
		}

		function make_y_gridlines() {
			return d3.axisLeft(yScale)
				.ticks(5)
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
			.call(make_y_gridlines()
				.tickSize(-this.w)
				.ticks(10)
				.tickFormat(emptyString)
			)

		let line = d3.line()
			.x((d: any) => xScale(d.date))
			.y((d: any) => yScale(d.adjustedUnits));
		// .curve(d3.curveCatmullRom.alpha(0.2));

		let color = d3.scaleOrdinal()
			.range(["#179dc6"]);

		let valueLine = this.svg
			.selectAll('.line')
			.data(this.data)
			.enter()
			.append('path')
			.attr('d', d => {
				return line(d.values);
			})
			.attr("class", function(d) {

				if (d.y <= 0) {
					return "line negative";
				} else {
					return "line positive";
				}

			})

			.style('stroke-width', 2)
			.style('fill', 'none');

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

			let colors = ["#179dc6"][i];

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
						"<div>" + "<strong>Units: </strong>" + tooltipNumberFormat(d.adjustedUnits) + "</div>"
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
				return 'translate(' + 1025 + ',' + vert + ')';
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
