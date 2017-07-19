//Angular2 Specifics
import { Component, ViewContainerRef, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { ISubscription, Subscription } from "rxjs/Subscription";

//Services
import { TrackDetailService } from '../../../details/track/track.service';
import { FilterService } from '../../../shared/filter.service';
import { ExportService } from '../../../shared/export.service';
import { FilterDatesService } from '../../../shared/filterDates.service';
import { Globals } from '../../../shared/globalVariables';

//Third-party Libraries
import * as d3 from 'd3';
import * as _ from 'lodash';
import { chain } from 'lodash';

@Component({
    selector: 'track-detail-pie-chart',
    template: `
    <div class="row">
    <div class="col-12 text-center">
      <h3 class="top-regions__chart--label thin">Country Consumption Share</h3>
    </div>
    <div class="col-12 text-center">
    <div id="track-detail-pie-chart" class="track-detail-pie-chart"></div>
    </div>
    </div>
    `,
    styleUrls: ['../../../../assets/sass/details.component.sass']
})

export class TrackDetailPieChartComponent implements OnInit {

    private w: number;
    private h: number;
    private r: number;
    private svg: any;
    private data: any;
    private elem;

    private topFiveCountryData: any;
    public trackCountriesTopFive: any;
    public subscriptionTopFiveCountries: any;

    private filterEmit: ISubscription;
    private dateEmit: ISubscription;

    public ID: number;

    constructor(public trackService: TrackDetailService,
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

        this.route.params.subscribe((params: Params) => {
            this.ID = params['trackID'];
            // this.loadData();
        });

    }

    ngOnInit(): void {
      if(!this.globals.isMobile) {
        this.loadData();
      }
    }

    loadData() {
        let tempData;
        d3.select(this.elem).select(".track-detail-pie-chart svg").remove();

        this.subscriptionTopFiveCountries = [];
        this.data = [];

        //optimize query by making separate one to only grab totals and not previous -- pie chart doesn't need last period data.
        this.topFiveCountryData = this.trackService.getCountryData(this.ID).subscribe(
            res => tempData = res,
            err => console.log(err),
            () => {
                this.topFiveCountryData = tempData.track;

                this.topFiveCountryData = chain({}).merge(
                    chain(this.topFiveCountryData.totals)
                        .filter(tot => !!tot.territory)
                        .map(({ adjustedUnits, units, euro, territory }) => ({ adjustedTotalUnitsAll: adjustedUnits.all, adjustedTotalUnits: adjustedUnits, totalUnits: units, totalEuro: euro, territory }))
                        .groupBy(tot => tot.territory.name)
                        .value()
                )
                    .values()
                    .flatten()
                    .value();

                this.topFiveCountryData = _.sortBy(this.topFiveCountryData, [(x) => { return x.adjustedTotalUnitsAll || '' }], ['desc']).reverse();

                this.trackCountriesTopFive = this.topFiveCountryData.slice(0, 5);
                this.trackCountriesTopFive = chain({}).merge(
                    chain(this.trackCountriesTopFive)
                        .filter(tot => !!tot.territory)
                        .map(({ adjustedTotalUnits, territory }) => ({ value: adjustedTotalUnits.all, name: territory.name, territory, id: territory.id }))
                        .groupBy(tot => tot.territory.name)
                        .value(), )
                    .values()
                    .flatten()
                    .value();

                this.data = this.trackCountriesTopFive;
                // console.log('trackCountriesTopFive', this.trackCountriesTopFive);
                this.pieChart();

            });

    }

    ngOnDestroy(): void{
        // this.topFiveCountryData.unsubscribe();
        this.filterEmit.unsubscribe();
        this.dateEmit.unsubscribe();
    }

    pieChart() {
        this.elem = this.viewContainerRef.element.nativeElement;
        d3.select(this.elem).select(".track-detail-pie-chart svg").remove();
        this.w = 875,
            this.h = 425,
            this.r = Math.min(this.w, this.h) / 2;
        let legendRectSize = 14;
        let legendSpacing = 4;
        // console.log(this.data);

        let tots = d3.sum(this.data, function(d: any) {
            return d.value;
        });

        let percentageFormat = d3.format(".0%");

        this.data.forEach(function(d) {
            d.percentage = d.value / tots;
        });

        let color = d3.scaleOrdinal()
            .range(["#179dc6", "#1bafea", "#30c3e5", "#74d2e2", "#a6d9e8"]);

        let arc = d3.arc()
            .outerRadius(this.r - 100)
            .innerRadius(this.h / 2.25);

        let labelArc = d3.arc()
            .outerRadius(this.r - 75)
            .innerRadius(this.r - 75);

        let pie = d3.pie()
            .sort(null)
            .value(function(d: any) { return d.value; });

        this.svg = d3.select(this.elem).select(".track-detail-pie-chart").append("svg")
        .attr("width", this.w)
        .attr("height", this.h)
        .style("display", "block")
        .style("margin", "0 auto")
        .style("margin-top", "1.1rem")
        .style("max-width", "100%")
        // .call(responsivefy)
        .append("g")
        .attr("transform", "translate(" + this.w / 3.15 + "," + this.h / 2 + ")");

            var tooltip = d3.select("body")
              .append("div")
              .style("position", "absolute")
              .style("z-index", "10")
              .style("visibility", "hidden")
              .style("padding", "10px")
              .style("border-radius", "5px")
              .style("background", "rgba(0,0,0,0.6)");

              var tooltipNumberFormat = d3.format(",.4r");

        let g = this.svg.selectAll(".arc")
            .data(pie(this.data))
            .enter().append("g")
            .attr("class", "arc")
            .attr("id", function(d, i) { return "#arc-" + i; });

        let g2 = this.svg.selectAll('.arc2')
            .data(pie(this.data))
            .enter()
            .append('g')
            .attr('class', 'arc')
            .attr("id", function(d, i) { return "#arc2-" + i; });

        g.append("path")
            .attr("d", arc)
            .style("fill", function(d) { return color(d.data.value); })
            .on("mouseover", d => {
              return tooltip.style("visibility", "visible")
                            .html("<div>" + d.data.name + "</div>" +
                            "<div>" + "<strong>Units: </strong>" + tooltipNumberFormat(d.data.value) + "</div>" +
                            "<div>" + percentageFormat(d.data.percentage) + "</div>"
                          );
            })
            .on("mousemove", d => {
              return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
            })
            .on("mouseout", d => {
              return tooltip.style("visibility", "hidden");
            });

        g2.append("text")
            .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
            .attr("dx", -12.5)
            .attr("dy", 0)
            // .attr("xlink:href", function(d, i) { return "#arc-" + i; })
            .attr("fill", "#191c1f")
            .attr("font-size", ".65em")
            .attr("font-weight", "400")
            .text(function(d) { return d.data.id; })
            .on("mouseover", d => {
              return tooltip.style("visibility", "visible")
                            .html("<div>" + d.data.name + "</div>" +
                            "<div>" + "<strong>Units: </strong>" + tooltipNumberFormat(d.data.value) + "</div>" +
                            "<div>" + percentageFormat(d.data.percentage) + "</div>"
                          );
            })
            .on("mousemove", d => {
              return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
            })
            .on("mouseout", d => {
              return tooltip.style("visibility", "hidden");
            });

        let legend = this.svg.selectAll('.legend')
            .data(color.domain())
            .enter()
            .append('g')
            .attr('class', 'legend')
            .attr('transform', function(d, i) {
                var height = legendRectSize + legendSpacing;
                var offset = height * color.domain().length / 2;
                var horz = -3.5 * legendRectSize - 20;
                var vert = i * height - offset;
                return 'translate(' + horz + ',' + vert + ')';
            });

        legend.append('rect')
            .attr('width', legendRectSize)
            .attr('height', legendRectSize)
            .attr("dx", -50)
            .attr("dy", 0)
            .style('fill', color)
            .style('stroke', color);

        legend.append('text')
            .data(this.data)
            .attr('x', legendRectSize + legendSpacing)
            .attr('y', legendRectSize - legendSpacing)
            .attr("dx", 4)
            .attr("dy", 2)
            .attr("font-size", "0.75em")
            .text(function(d) { return " " + d.name + " (" + d.id + ")" + " - " + percentageFormat(d.percentage); });

  }
}
