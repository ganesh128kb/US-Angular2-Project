import { Injectable, OnInit } from '@angular/core';
import * as moment from 'moment';

Injectable()
export class Globals implements OnInit {
    public euroToggle: boolean = false;
    public externalToggle: boolean = false;
    public catalogueToggle: boolean = false;
    public apolloError: any;

    public isMobile: boolean;

    shareTip = 'Click here to copy the URL with filters preserved--simply paste and send in an email!';
    globalTip = 'The Global Priorities Lists are managed by Universal Music\'s Global Marketing team.';
    exportTip = 'Click here to export to CSV. Only the number of items currently selected will be exported.';
    exportListTip = 'Click here to export your list to CSV.';
	  filterPartnersTip = 'Note: Your applied partners filter does not affect this table.'

    ngOnInit(): void {
        this.euroToggle = false;
        this.catalogueToggle = false;
        this.externalToggle = false;
    }

    artistTableHeaders = [
        {
            "number": '#',
            "artistName": 'ARTIST',
            "releaseToDate": 'RTD',
            "thisPeriod": 'TP',
            "lastPeriod": 'LP',
            "variance": 'VAR',
            "physicalAlbums": 'PHYSICAL ALBUMS',
            "digitalAlbums": 'DIGITAL ALBUMS',
            "digitalTracks": 'DIGITAL TRACKS',
            "streams": 'STREAMS'
        }
    ];
    projectTableHeaders = [
        {
            "number": '#',
            "artistName": 'ARTIST',
            "projectName": 'PROJECT NAME',
            "label": 'LABEL',
            "releaseDate": 'RELEASE DATE',
            "releaseToDate": 'RTD',
            "thisPeriod": 'TP',
            "lastPeriod": 'LP',
            "variance": 'VAR',
            "physicalAlbums": 'PHYSICAL ALBUMS',
            "digitalAlbums": 'DIGITAL ALBUMS',
            "digitalTracks": 'DIGITAL TRACKS',
            "streams": 'STREAMS'
        }
    ];
    trackTableHeaders = [
        {
            "number": '#',
            "artistName": 'ARTIST',
            "trackName": 'TITLE',
            "label": 'LABEL',
            "releaseDate": 'RELEASE DATE',
            "releaseToDate": 'RTD',
            "thisPeriod": 'TP',
            "lastPeriod": 'LP',
            "variance": 'VAR',
            "trackSales": 'TRACK SALES',
            "streamsTotal": 'STREAMS TOTAL',
            "audioStreams": 'AUDIO STREAMS',
            "videoStreams": 'VIDEO STREAMS'
        }
    ];

    defaultPeriod = "Week";
    defaultDate = "52, 2016";
    defaultTerritory = "UMG Global";

    now = moment().utc().format();

    releaseStartDay = moment().isoWeekday("Friday").utc().format();

    releaseWeekStart = moment(this.releaseStartDay).subtract(7, 'days').utc().format("YYYYMMDD");

    releaseWeekEnd = moment().isoWeekday("Thursday").utc().format("YYYYMMDD");

    twtd = "&start=" + this.releaseWeekStart + "&end=" + this.releaseWeekEnd;
}
