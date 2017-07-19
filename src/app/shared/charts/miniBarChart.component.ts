import {Component, ViewContainerRef, OnInit} from '@angular/core';
import * as d3 from 'd3';

import { ArtistDetailService } from '../../details/artist/artist.service';

@Component({
    selector: 'mini-bar-chart',
    styles: ['.barChart { margin-top: 5px; }'],
    template: `<div class="barChart"></div>`
})

export class MiniBarChartComponent implements OnInit {

    private w: number;
    private h: number;
    private barPadding: number;
    private svg: any;
    private streams: any;
    private elem;

    constructor(private viewContainerRef: ViewContainerRef,
      private service: ArtistDetailService) { }

    ngOnInit(): void {

        //TO DO: set range based on minimum values.

        this.elem = this.viewContainerRef.element.nativeElement;

        this.w = 50;
        this.h = 25;
        this.barPadding = 3;

        this.streams = [
            {
                "date": "2017-01-01",
                "streams": 340
            },
            {
                "date": "2017-01-02",
                "streams": 300
            },
            {
                "date": "2017-01-03",
                "streams": 280
            },
            {
                "date": "2017-01-04",
                "streams": 210
            },
            {
                "date": "2017-01-05",
                "streams": 390
            },
            {
                "date": "2017-01-06",
                "streams": 210
            },
            {
                "date": "2017-01-07",
                "streams": 390
            }
        ]

        //Draw SVG
        this.svg = d3.select(this.elem)
            .select("div")
            .append("svg")
            .attr("width", this.w)
            .attr("height", this.h)

        //Draw column bars
        this.svg.selectAll("rect")
            .data(this.streams)
            .enter()
            .append("rect")
            .attr("x", function(d, i) {
                return i * (50 / 7);
            })
            .attr("y", function(d) {
                return 25 - d.streams * .05; //height minus data value
            })
            .attr("width", 50 / 7 - this.barPadding)
            .attr("height", function(d) {
                return d.streams * .05;
            })
            .attr("fill", "rgba(96,185,239,0.7)")
            .attr("stroke", "rgba(96,185,239,1)")
            .attr("stroke-width", "1.25");

    };

}
