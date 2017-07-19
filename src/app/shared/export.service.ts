import { Injectable, Component, Input, OnInit } from '@angular/core';
import { Globals } from '../shared/globalVariables';
import { ActivatedRoute, Params } from '@angular/router';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { Http } from '@angular/http';
import 'rxjs/add/operator/switchMap';
import * as FileSaver from "file-saver";

//Services
import { BestSellerService } from '../bestsellers/bestsellers.service';
import { FilterService } from './filter.service';
import { ArtistDetailService } from '../details/artist/artist.service';
import { FilterDatesService } from './filterDates.service';

import * as moment from 'moment';
import * as _ from 'lodash';

@Injectable()
export class ExportService {

    lineChartOverviewData: any;
    lineChartPartnerStreamsData: any;
    lineChartWeekPartnersData: any;
    artistCountriesData: any;
    artistTrackData: any;
    artistProjectData: any;

    topArtists: any;
    topProjects: any;
    topTracks: any;
    trackPartnerData: any;
    trackRelatedTracks: any;
    trackCountries: any;

    partnersByMediaTypeStreamsData: any;
    partnersByMediaTypeDigitalTracksData: any;
    partnersByMediaTypeDigitalAlbumsData: any;
    partnersByMediaTypePhysicalAlbumsData: any;

    csvData: any;
    // public browser: string = window.navigator.userAgent;

    period = this.fs.activeParams.period[0];

    userData: any = {};

    constructor(private globals: Globals,
        private fs: FilterService,
        private fsDate: FilterDatesService,
        private location: Location,
        private route: ActivatedRoute,
        private bestSellers: BestSellerService) { }

    ngOnInit(): void {
        // if (!!window.chrome && !!window.chrome.webstore) {
        //     console.log("Google Chrome");
        // }
        // if (/constructor/i.test(window.HTMLElement) || (function(p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || safari.pushNotification)) {
        //     console.log("Safari");
        // }
    }

    filterString() {
        const dateForm = this.fs.activeParams.date[0] ? this.fs.activeParams.date[0] : [];
        const period = dateForm.period;

        let genre = '';
        let partner = '';
        let territory = '';
        let label = '';
        let date = '';

		switch (period) {
			case "Year":
				date = "Year " + dateForm.year;
				break;
			case "Quarter":
				date = "Q" + dateForm.quarter + "-" + dateForm.year;
				break;
			case "Month":
				date = "Month " + dateForm.year + "-" + dateForm.month;
				break;
			case "Week":
				date = "Week " + dateForm.week + "-" + dateForm.year;
				break;
			default:
				date = "Week " + this.globals.defaultDate;
				break;
		}

        if (this.fs.activeParams.genre[0]) {
            genre = this.fs.activeParams.genre[0].name;
        }
        if (this.fs.activeParams.partner[0]) {
            partner = this.fs.activeParams.partner[0].name;
        }
        if (this.fs.activeParams.territory[0]) {
            territory = this.fs.activeParams.territory[0].name;
        } else {
            territory = this.globals.defaultTerritory;
        }
        if (this.fs.activeParams.label[0]) {
            label = this.fs.activeParams.label[0].name;
        }
        let filters = 'Genre: ' + genre + '\r\n' +
            'Partner: ' + partner + '\r\n' +
            'Territory: ' + territory + '\r\n' +
            'Label: ' + label + '\r\n\r\n' +
            'Date: ' + date + '\r\n\r\n';
        return encodeURIComponent(filters);
    }

    csvTopPerformingArtists(data: any) {

		let userData = JSON.parse(localStorage.getItem('currentUser'));
		let csv;

		if (userData.revenue) {
			csv = ['Artist,RTD,TP,Physical Albums,Digital Albums,Digital Tracks,Streams,TP Revenue,Physical Albums Revenue,Digital Albums Revenue,Digital Tracks Revenue,Streams Revenue'];
		} else {
			csv = ['Artist,RTD,TP,Physical Albums,Digital Albums,Digital Tracks,Streams'];
		}

		for (let item of data) {
			//console.log(item);

			if (userData.revenue) {
				csv.push(item.artist.name + ',' + item.totals.units.rtd + ',' + item.totals.units.all + ',' +
					item.totals.units.physicalAlbums + ',' + item.totals.units.digitalAlbums + ',' +
					item.totals.units.digitalTracks + ',' + item.totals.units.streams + ',' + item.totals.euro.all + ',' +
					item.totals.euro.physicalAlbums + ',' + item.totals.euro.digitalAlbums + ',' +
					item.totals.euro.digitalTracks + ',' + item.totals.euro.streams);
			} else {
				csv.push(item.artist.name + ',' + item.totals.units.rtd + ',' + item.totals.units.all + ',' +
					item.totals.units.physicalAlbums + ',' + item.totals.units.digitalAlbums + ',' +
					item.totals.units.digitalTracks + ',' + item.totals.units.streams);
			}
		}
		return encodeURIComponent(csv.join('\r\n'));
    }

    csvTopPerformingProjects(data: any) {

		let userData = JSON.parse(localStorage.getItem('currentUser'));
		let csv;

		if (userData.revenue) {
			csv = ['Artist,Project Name,Release Date,RTD,TP,Physical Albums,Digital Albums,Digital Tracks,Streams,RTD Revenue,TP Revenue,Physical Albums Revenue,Digital Albums Revenue, Digital Tracks Revenue,Streams Revenue'];
		} else {
			csv = ['Artist,Project Name,Release Date,RTD,TP,Physical Albums,Digital Albums,Digital Tracks,Streams'];
		}

		for (let item of data) {
			//console.log(item);

			if (userData.revenue) {
				csv.push(item.project.artist.name + ',' + item.project.name + ',' + item.project.earliestReleaseDate + ',' + item.totals.adjustedUnits.rtd + ',' +
					item.totals.adjustedUnits.all + ',' + item.totals.adjustedUnits.physicalAlbums + ',' +
					item.totals.adjustedUnits.digitalAlbums + ',' + item.totals.adjustedUnits.digitalTracks + ',' + item.totals.adjustedUnits.streams + ',' + item.totals.euro.rtd + ',' +
					item.totals.euro.all + ',' + item.totals.euro.physicalAlbums + ',' +
					item.totals.euro.digitalAlbums + ',' + item.totals.euro.digitalTracks + ',' + item.totals.euro.streams);
			} else {
				csv.push(item.project.artist.name + ',' + item.project.name + ',' + item.project.earliestReleaseDate + ',' + item.totals.adjustedUnits.rtd + ',' +
					item.totals.adjustedUnits.all + ',' + item.totals.adjustedUnits.physicalAlbums + ',' +
					item.totals.adjustedUnits.digitalAlbums + ',' + item.totals.adjustedUnits.digitalTracks + ',' + item.totals.adjustedUnits.streams);
			}
		}
		return encodeURIComponent(csv.join('\r\n'));
    }

    csvTopPerformingTracks(data: any) {

		let userData = JSON.parse(localStorage.getItem('currentUser'));
        let csv;

		if (userData.revenue) {
			csv = ['Artist,Track Name,Release Date,RTD,TP,Track Sales,Streams Total,Audio Streams,RTD Revenue,TP Revenue,Track Sales Revenue, Streams Revenue, Audio Streams Revenue'];
		} else {
			csv = ['Artist,Track Name,Release Date,RTD,TP,Track Sales,Streams Total,Audio Streams'];
		}

		for (let item of data) {
			//console.log(item);

      if(item.track.artist.name == null) {
        item.track.artist.name = "";
      }

			if (userData.revenue) {
				csv.push(item.track.artist.name + ',' + item.track.name + ',' + item.track.earliestReleaseDate + ',' + item.totals.adjustedUnits.rtd + ',' +
					item.totals.adjustedUnits.all + ',' + item.totals.adjustedUnits.digitalTracks + ',' +
					item.totals.adjustedUnits.streams + ',' + item.totals.adjustedUnits.audioStreams + ',' + item.totals.euro.rtd + ',' +
					item.totals.euro.all + ',' + item.totals.euro.digitalTracks + ',' +
					item.totals.euro.streams + ',' + item.totals.euro.audioStreams);
			} else {
				csv.push(item.track.artist.name + ',' + item.track.name + ',' + item.track.earliestReleaseDate + ',' + item.totals.adjustedUnits.rtd + ',' +
					item.totals.adjustedUnits.all + ',' + item.totals.adjustedUnits.digitalTracks + ',' +
					item.totals.adjustedUnits.streams + ',' + item.totals.adjustedUnits.audioStreams);
			}
		}
		return encodeURIComponent(csv.join('\r\n'));
    }

    csvArtistLineChartOverview(data: any) {

        let csv = ['Date,MediaType,AdjustedUnits,Units'];

        data.forEach(function(value, i) {
            // console.log(value, i);
            value.values.forEach(function(x, j) {
                // console.log(x, j);
                csv.push(x.date + ',' + x.mediaType + ',' + x.adjustedUnits + ',' + x.units);
            });
        });
        return encodeURIComponent(csv.join('\r\n'));
    }

				csvArtistLineChartStreamsPartner(data: any) {

        let csv = ['Date,PartnerName,StreamsUnits'];

        data.forEach(function(value, i) {
            // console.log(value, i);
            value.values.forEach(function(x, j) {
                // console.log(x, j);
                csv.push(x.date + ',' + x.partnerName + ',' + x.streamsUnits);
            });
        });
								return encodeURIComponent(csv.join('\r\n'));
    }

    csvArtistLineChartWeekPartners(data: any) {

        let csv = ['Date,MediaType,Units'];

        data.forEach(function(value, i) {
            // console.log(value, i);
            value.values.forEach(function(x, j) {
                // console.log(x, j);
                csv.push(x.date + ',' + x.mediaType + ',' + x.units);
            });
								});
        return encodeURIComponent(csv.join('\r\n'));
    }

    csvArtistCountries(data: any) {

        let csv = ['CountryID,CountryName,AdjustedRTD,AdjustedTP,AdjustedLP,PhysicalAlbums,DigitalAlbums,DigitalTracks,Streams'];

        data.forEach(function(value, i) {
            console.log(value, i);
            csv.push(value.territory.id + ',' + value.territory.name + ',' + value.adjustedRtdUnits.all + ',' + value.adjustedTotalUnits.all + ',' + value.adjustedPreviousUnitsAll + ',' + value.totalUnits.physicalAlbums + ',' + value.totalUnits.digitalAlbums + ',' + value.totalUnits.digitalTracks + ',' + value.totalUnits.streams);
            // csv.filter(res => res.adjustedPreviousUnitsAll != null);
								});
        return encodeURIComponent(csv.join('\r\n'));
    }

    csvPartnersByMediaTypeStreams(data: any) {

		let userData = JSON.parse(localStorage.getItem('currentUser'));
		let csv;

		if (userData.revenue) {
			csv = ['PartnerName,AdjustedLP,AdjustedTP,AdjustedRTD,RevTP,RevRTD'];
		} else {
			csv = ['PartnerName,AdjustedLP,AdjustedTP,AdjustedRTD'];
		}

        data.forEach(function(value, i) {
			//       // console.log(value, i);
			//       if (value.adjustedPreviousStreams == null) {
			// 	          value.adjustedPreviousStreams = '0';
			// } else if (value.adjustedTotalStreams == null) {
			// 	    value.adjustedTotalStreams = '0';
			// } else if (value.adjustedRtdStreams == null) {
			// 	    value.adjustedRtdStreams = '0';
			// } else if (value.euroTotalsStreams == null) {
			// 	    value.euroTotalsStreams = '0';
			// } else if (value.euroRtdStreams == null) {
			// 	    value.euroRtdStreams = '0';
			// }

            if (value.partnerName.indexOf(',') > -1) {
				value.partnerName = value.partnerName.replace(/,/g, "");
            }
            if (userData.revenue) {
				csv.push(value.partnerName + ',' + value.adjustedPreviousStreams + ',' + value.adjustedTotalStreams + ',' + value.adjustedRtdStreams + ',' + value.euroTotalsStreams + ',' + value.euroRtdStreams);
			} else {
				csv.push(value.partnerName + ',' + value.adjustedPreviousStreams + ',' + value.adjustedTotalStreams + ',' + value.adjustedRtdStreams);
			}
		});
        return encodeURIComponent(csv.join('\r\n'));
    }

    csvPartnersByMediaTypeDigitalTracks(data: any) {

		let userData = JSON.parse(localStorage.getItem('currentUser'));
		let csv;

		if (userData.revenue) {
			csv = ['PartnerName,AdjustedLP,AdjustedTP,AdjustedRTD,RevTP,RevRTD'];
		} else {
			csv = ['PartnerName,AdjustedLP,AdjustedTP,AdjustedRTD'];
		}

        data.forEach(function(value, i) {

            // if (value.adjustedPreviousDigitalTracks == null || value.adjustedTotalDigitalTracks == null || value.euroTotalsDigitalTracks == null || value.euroRtdDigitalTracks == null) {
            //     value.adjustedPreviousDigitalTracks = '0';
			// 		value.adjustedTotalDigitalTracks = '0';
			// 		// value.adjustedRtdDigitalTracks = 0;
			// 		value.euroTotalsDigitalTracks = '0';
			// 		// value.euroRtdDigitalTracks = 0;
            // }

            if (value.partnerName.indexOf(',') > -1) {
				value.partnerName = value.partnerName.replace(/,/g, "");
            }

            if (userData.revenue) {
				csv.push(value.partnerName + ',' + value.adjustedPreviousDigitalTracks + ',' + value.adjustedTotalDigitalTracks + ',' + value.adjustedRtdDigitalTracks + ',' + value.euroTotalsDigitalTracks + ',' + value.euroRtdDigitalTracks);
            } else {
				csv.push(value.partnerName + ',' + value.adjustedPreviousDigitalTracks + ',' + value.adjustedTotalDigitalTracks + ',' + value.adjustedRtdDigitalTracks);
			}
		});
        return encodeURIComponent(csv.join('\r\n'));
    }

    csvPartnersByMediaTypeDigitalAlbums(data: any) {

		let userData = JSON.parse(localStorage.getItem('currentUser'));
		let csv;

		if (userData.revenue) {
			csv = ['PartnerName,LP,TP,RTD,RevTP,RevRTD'];
		} else {
			csv = ['PartnerName,LP,TP,RTD'];
		}

        data.forEach(function(value, i) {
            // console.log(value, i);
			//     if (value.previousDigitalAlbums == null || value.totalDigitalAlbums == null || value.rtdDigitalAlbums == null || value.euroTotalsDigitalAlbums == null || value.euroRtdDigitalAlbums == null) {
			// value.previousDigitalAlbums = '0';
			// value.totalDigitalAlbums = '0';
			// // value.rtdDigitalAlbums = '0';
			// value.euroTotalsDigitalAlbums = '0';
			// // value.euroRtdDigitalAlbums = '0';
			//     }
            if (value.partnerName.indexOf(',') > -1) {
				value.partnerName = value.partnerName.replace(/,/g, "");
            }

            if (userData.revenue) {
				csv.push(value.partnerName + ',' + value.previousDigitalAlbums + ',' + value.totalDigitalAlbums + ',' + value.rtdDigitalAlbums + ',' + value.euroTotalsDigitalAlbums + ',' + value.euroRtdDigitalAlbums);
			} else {
				csv.push(value.partnerName + ',' + value.previousDigitalAlbums + ',' + value.totalDigitalAlbums + ',' + value.rtdDigitalAlbums);
			}
		});
        return encodeURIComponent(csv.join('\r\n'));
    }

    csvPartnersByMediaTypePhysicalAlbums(data: any) {

		let csv;
		let userData = JSON.parse(localStorage.getItem('currentUser'));

		if (userData.revenue) {
			let csv = ['PartnerName,LP,TP,RTD,RevTP,RevRTD'];
		} else {
			let csv = ['PartnerName,LP,TP,RTD'];
		}

        data.forEach(function(value, i) {
			//     // console.log(value, i);
			//     if (value.previousPhysicalAlbums == null || value.totalPhysicalAlbums == null || value.rtdPhysicalAlbums == null || value.euroTotalsPhysicalAlbums == null || value.euroRtdPhysicalAlbums == null) {
			// value.previousPhysicalAlbums = '0';
			// value.totalPhysicalAlbums = '0';
			// // value.rtdPhysicalAlbums = 0;
			// value.euroTotalsPhysicalAlbums = '0';
			// // value.euroRtdPhysicalAlbums = 0;
			//     }
            if (value.partnerName.indexOf(',') > -1) {
				value.partnerName = value.partnerName.replace(/,/g, "");
            }

            if (userData.revenue) {
				csv.push(value.partnerName + ',' + value.previousPhysicalAlbums + ',' + value.totalPhysicalAlbums + ',' + value.rtdPhysicalAlbums + ',' + value.euroTotalsPhysicalAlbums + ',' + value.euroRtdPhysicalAlbums);
				// csv.filter(res => res.adjustedPreviousUnitsAll != null);
			} else {
				csv.push(value.partnerName + ',' + value.previousPhysicalAlbums + ',' + value.totalPhysicalAlbums + ',' + value.rtdPhysicalAlbums);
			}
		});
        return encodeURIComponent(csv.join('\r\n'));
    }

    csvArtistTracks(data: any) {

        let csv = ['Track Name,Release Date,Adjusted RTD,Adjusted TP,Track Sales,Streams Total,Audio Streams,Video Streams'];

        data.forEach(function(value, i) {
            // console.log(value, i);
            if (value.trackName == null) {
				value.trackName = "";
				value.trackReleaseDate = "";
				value.adjustedRtdUnits = "";
				value.adjustedTotalUnits = "";
				value.totalDigitalTracks = "";
				value.totalStreams = "";
				value.totalAudioStreams = "";
				value.totalVideoStreams = "";
            }
            if (value.trackName.indexOf(',') > -1) {
				value.trackName = value.trackName.replace(/,/g, "");
            }
            csv.push(value.trackName + ',' + value.trackReleaseDate + ',' + value.adjustedRtdUnits + ',' + value.adjustedTotalUnits + ',' + value.totalDigitalTracks + ',' + value.totalStreams + ',' + value.totalAudioStreams + ',' + value.totalVideoStreams);
            // csv.filter(res => res.adjustedPreviousUnitsAll != null);
		});
        return encodeURIComponent(csv.join('\r\n'));
    }

    csvArtistProjects(data: any) {

        let csv = ['#,Project Name,Release Date,RTD,TP,Physical Albums,Digital Albums,Digital Tracks,Streams'];

		data.forEach(function(item, i) {

			if (item.projectName != null && item.projectName.indexOf(',') > -1) {
				item.projectName = item.projectName.replace(/,/g, "");
			}

			csv.push(i + 1 + ',' + item.projectName + ',' + item.projectReleaseDate + ',' + item.adjustedRtdUnits + ',' + item.adjustedTotalUnits + ',' + item.totalPhysicalAlbums + ',' + item.totalDigitalAlbums + ',' + item.totalDigitalTracks + ',' + item.totalStreams);

		});
        return encodeURIComponent(csv.join('\r\n'));
    }

    csvTrackLineChartOverview(data: any) {

        let csv = ['Date,MediaType,AdjustedUnits,Units'];

        data.forEach(function(value, i) {
            // console.log(value, i);
            value.values.forEach(function(x, j) {
                // console.log(x, j);
                csv.push(x.date + ',' + x.mediaType + ',' + x.adjustedUnits + ',' + x.units);
            });
        });
        return encodeURIComponent(csv.join('\r\n'));
    }

    csvTrackLineChartStreamsPartner(data: any) {

		let csv = ['Date,PartnerName,StreamsUnits'];

		data.forEach(function(value, i) {
			// console.log(value, i);
			value.values.forEach(function(x, j) {
				// console.log(x, j);
				csv.push(x.date + ',' + x.partnerName + ',' + x.streamsUnits);
			});
		});
		return encodeURIComponent(csv.join('\r\n'));
	}

	csvTrackPartnerData(data: any) {

		let csv = ['PartnerName,RTD,TP,LP,Track Sales,Streams Total,Audio Streams,Video Streams'];


		data.forEach(function(x, j) {

			// console.log(x, j);

			if (x.adjustedTotalUnits) {
				csv.push(x.partnerName + ',' + x.adjustedRtdUnits.all + ',' + x.adjustedTotalUnits.all + ',' + x.adjustedPreviousUnits.all + ',' + x.totalUnits.digitalTracks + ',' + x.totalUnits.streams + ',' + x.totalUnits.audioStreams + ',' + x.totalUnits.videoStreams);
			}
		});
        return encodeURIComponent(csv.join('\r\n'));
	}

	csvTrackRelatedTracks(data: any) {

		let csv = ['TrackName,ISRC,Release Date,RTD,TP,LP,Track Sales,Streams Total,Audio Streams,Video Streams'];


		data.forEach(function(x, j) {

			// console.log(x, j);
			csv.push(x.isrcName + ',' + x.isrcId + ',' + x.isrcReleaseDate + ',' + x.adjustedRtdUnits + ',' + x.adjustedTotalUnits + ',' + x.adjustedPreviousUnits + ',' + x.totalDigitalTracks + ',' + x.totalStreams + ',' + x.totalAudioStreams + ',' + x.totalVideoStreams);

		});
        return encodeURIComponent(csv.join('\r\n'));
	}

	csvTrackCountries(data: any) {

		let csv = ['CountryID,CountryName,AdjustedRTD,AdjustedTP,PhysicalAlbums,DigitalAlbums,DigitalTracks,Streams'];

		data.forEach(function(value, i) {
			console.log(value, i);

			// if(value.adjustedPreviousUnits) {
			//   value.adjustedPreviousUnits.all = value.adjustedPreviousUnits.all;
			// } else {
			//   value.adjustedPreviousUnits = {
			//     all = "";
			//   };
			// }
			if (value.adjustedTotalUnits) {
				csv.push(value.territory.id + ',' + value.territory.name + ',' + value.adjustedRtdUnits.all + ',' + value.adjustedTotalUnits.all + ',' + value.totalUnits.digitalTracks + ',' + value.totalUnits.streams + ',' + value.totalUnits.audioStreams + ',' + value.totalUnits.videoStreams);
			}

		});
		return encodeURIComponent(csv.join('\r\n'));
	}

    download(title: string, data: any, csv: (data: any) => string) {

        let startDate;
        let endDate;

        //Note: export won't work unless empty string is put in for title parameter in tableButtons html template
        switch (this.fs.baseUrl) {
			case "/bestsellers/artists":
				title = 'TopPerformingArtists';
				break;
			case "/bestsellers/tracks":
				title = 'TopPerformingTracks';
				break;
			case "/bestsellers/projects":
				title = 'TopPerformingProjects';
				break;
			default:

				break;
        }

        let newData = csv(data);
        let filter = this.filterString();
        let filterdData = filter + '\r\n\n' + newData;
        let downloadData = 'data:text/csv;charset=utf-16,' + filterdData;
        var downloadLink = document.createElement("a");
        downloadLink.href = downloadData;
        downloadLink.download = title + '.csv';

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }

}
