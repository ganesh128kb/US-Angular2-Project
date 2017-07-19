import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Http } from '@angular/http';
import { Location } from '@angular/common';


@Component({
    selector: 'docs',
    templateUrl: './docs.component.html',
    styleUrls: ['../../assets/sass/app.component.sass']
})

export class DocsComponent implements OnInit {

	userData = {};
	// ratioData: any = [];

    constructor(private route: ActivatedRoute,
		private http: Http,
        private location: Location) {

		this.userData = JSON.parse(localStorage.getItem('currentUser'));

	}

	ngOnInit(): void {
	}

	ratioData = [
	  {
	    "country": "Global",
	    "iso": "XX",
	    "mediaType": "Download (Album)",
	    "unitsAlbums": 1,
	    "unitsTracks": 0,
	    "startDate": "",
	    "endDate": ""
	  },
	  {
	    "country": "Global",
	    "iso": "XX",
	    "mediaType": "Download (Track)",
	    "unitsAlbums": 10,
	    "unitsTracks": 1,
	    "startDate": "",
	    "endDate": ""
	  },
	  {
	    "country": "Global",
	    "iso": "XX",
	    "mediaType": "Merchandise",
	    "unitsAlbums": 0,
	    "unitsTracks": 0,
	    "startDate": "",
	    "endDate": ""
	  },
	  {
	    "country": "Global",
	    "iso": "XX",
	    "mediaType": "Physical",
	    "unitsAlbums": 1,
	    "unitsTracks": 0,
	    "startDate": "",
	    "endDate": ""
	  },
	  {
	    "country": "Australia",
	    "iso": "AU",
	    "mediaType": "Streaming (Free)",
	    "unitsAlbums": 1850,
	    "unitsTracks": 185,
	    "startDate": "",
	    "endDate": ""
	  },
	  {
	    "country": "Australia",
	    "iso": "AU",
	    "mediaType": "Streaming (Premium)",
	    "unitsAlbums": 1850,
	    "unitsTracks": 185,
	    "startDate": "",
	    "endDate": ""
	  },
	  {
	    "country": "Austria",
	    "iso": "AT",
	    "mediaType": "Streaming (Free)",
	    "unitsAlbums": 1000,
	    "unitsTracks": 100,
	    "startDate": "",
	    "endDate": ""
	  },
	  {
	    "country": "Austria",
	    "iso": "AT",
	    "mediaType": "Streaming (Premium)",
	    "unitsAlbums": 1000,
	    "unitsTracks": 100,
	    "startDate": "",
	    "endDate": ""
	  },
	  {
	    "country": "Canada",
	    "iso": "CA",
	    "mediaType": "Streaming (Free)",
	    "unitsAlbums": 1500,
	    "unitsTracks": 150,
	    "startDate": "",
	    "endDate": ""
	  },
	  {
	    "country": "Canada",
	    "iso": "CA",
	    "mediaType": "Streaming (Premium)",
	    "unitsAlbums": 1500,
	    "unitsTracks": 150,
	    "startDate": "",
	    "endDate": ""
	  },
	  {
	    "country": "Denmark",
	    "iso": "DK",
	    "mediaType": "Streaming (Free)",
	    "unitsAlbums": 1000,
	    "unitsTracks": 100,
	    "startDate": "",
	    "endDate": ""
	  },
	  {
	    "country": "Denmark",
	    "iso": "DK",
	    "mediaType": "Streaming (Premium)",
	    "unitsAlbums": 1000,
	    "unitsTracks": 100,
	    "startDate": "",
	    "endDate": ""
	  },
	  {
	    "country": "Finland",
	    "iso": "FI",
	    "mediaType": "Streaming (Free)",
	    "unitsAlbums": 1000,
	    "unitsTracks": 100,
	    "startDate": "",
	    "endDate": ""
	  },
	  {
	    "country": "Finland",
	    "iso": "FI",
	    "mediaType": "Streaming (Premium)",
	    "unitsAlbums": 1000,
	    "unitsTracks": 100,
	    "startDate": "",
	    "endDate": ""
	  },
	  {
	    "country": "France",
	    "iso": "FR",
	    "mediaType": "Streaming (Free)",
	    "unitsAlbums": 1000,
	    "unitsTracks": 100,
	    "startDate": "",
	    "endDate": ""
	  },
	  {
	    "country": "France",
	    "iso": "FR",
	    "mediaType": "Streaming (Premium)",
	    "unitsAlbums": 1000,
	    "unitsTracks": 100,
	    "startDate": "",
	    "endDate": ""
	  },
	  {
	    "country": "Germany",
	    "iso": "DE",
	    "mediaType": "Streaming (Free)",
	    "unitsAlbums": 1000,
	    "unitsTracks": 100,
	    "startDate": "",
	    "endDate": ""
	  },
	  {
	    "country": "Germany",
	    "iso": "DE",
	    "mediaType": "Streaming (Premium)",
	    "unitsAlbums": 1000,
	    "unitsTracks": 100,
	    "startDate": "",
	    "endDate": ""
	  },
	  {
	    "country": "Netherlands",
	    "iso": "NL",
	    "mediaType": "Streaming (Free)",
	    "unitsAlbums": 1500,
	    "unitsTracks": 150,
	    "startDate": "",
	    "endDate": ""
	  },
	  {
	    "country": "Netherlands",
	    "iso": "NL",
	    "mediaType": "Streaming (Premium)",
	    "unitsAlbums": 1500,
	    "unitsTracks": 150,
	    "startDate": "",
	    "endDate": ""
	  },
	  {
	    "country": "New Zealand",
	    "iso": "NZ",
	    "mediaType": "Streaming (Free)",
	    "unitsAlbums": 1750,
	    "unitsTracks": 175,
	    "startDate": "",
	    "endDate": ""
	  },
	  {
	    "country": "New Zealand",
	    "iso": "NZ",
	    "mediaType": "Streaming (Premium)",
	    "unitsAlbums": 1750,
	    "unitsTracks": 175,
	    "startDate": "",
	    "endDate": ""
	  },
	  {
	    "country": "Norway",
	    "iso": "NO",
	    "mediaType": "Streaming (Free)",
	    "unitsAlbums": 1000,
	    "unitsTracks": 100,
	    "startDate": "",
	    "endDate": ""
	  },
	  {
	    "country": "Norway",
	    "iso": "NO",
	    "mediaType": "Streaming (Premium)",
	    "unitsAlbums": 1000,
	    "unitsTracks": 100,
	    "startDate": "",
	    "endDate": ""
	  },
	  {
	    "country": "Portugal",
	    "iso": "PT",
	    "mediaType": "Streaming (Free)",
	    "unitsAlbums": 2500,
	    "unitsTracks": 250,
	    "startDate": "",
	    "endDate": ""
	  },
	  {
	    "country": "Portugal",
	    "iso": "PT",
	    "mediaType": "Streaming (Premium)",
	    "unitsAlbums": 2500,
	    "unitsTracks": 250,
	    "startDate": "",
	    "endDate": ""
	  },
	  {
	    "country": "Spain",
	    "iso": "SP",
	    "mediaType": "Streaming (Free)",
	    "unitsAlbums": 2500,
	    "unitsTracks": 250,
	    "startDate": "",
	    "endDate": ""
	  },
	  {
	    "country": "Spain",
	    "iso": "SP",
	    "mediaType": "Streaming (Premium)",
	    "unitsAlbums": 2500,
	    "unitsTracks": 250,
	    "startDate": "",
	    "endDate": ""
	  },
	  {
	    "country": "Sweden",
	    "iso": "SE",
	    "mediaType": "Streaming (Free)",
	    "unitsAlbums": 1300,
	    "unitsTracks": 130,
	    "startDate": "",
	    "endDate": ""
	  },
	  {
	    "country": "Sweden",
	    "iso": "SE",
	    "mediaType": "Streaming (Premium)",
	    "unitsAlbums": 1300,
	    "unitsTracks": 130,
	    "startDate": "",
	    "endDate": ""
	  },
	  {
	    "country": "Switzerland",
	    "iso": "CH",
	    "mediaType": "Streaming (Free)",
	    "unitsAlbums": 0,
	    "unitsTracks": 0,
	    "startDate": "",
	    "endDate": ""
	  },
	  {
	    "country": "Switzerland",
	    "iso": "CH",
	    "mediaType": "Streaming (Premium)",
	    "unitsAlbums": 1140,
	    "unitsTracks": 114,
	    "startDate": "",
	    "endDate": ""
	  },
	  {
	    "country": "United Kingdom",
	    "iso": "GB",
	    "mediaType": "Streaming (Free)",
	    "unitsAlbums": 1500,
	    "unitsTracks": 150,
	    "startDate": "",
	    "endDate": ""
	  },
	  {
	    "country": "United Kingdom",
	    "iso": "GB",
	    "mediaType": "Streaming (Premium)",
	    "unitsAlbums": 1500,
	    "unitsTracks": 150,
	    "startDate": "",
	    "endDate": ""
	  },
	  {
	    "country": "United States",
	    "iso": "US",
	    "mediaType": "Streaming (Free)",
	    "unitsAlbums": 1500,
	    "unitsTracks": 150,
	    "startDate": "",
	    "endDate": ""
	  },
	  {
	    "country": "United States",
	    "iso": "US",
	    "mediaType": "Streaming (Premium)",
	    "unitsAlbums": 1500,
	    "unitsTracks": 150,
	    "startDate": "",
	    "endDate": ""
	  },
	  {
	    "country": "All Other Territories",
	    "iso": "XX",
	    "mediaType": "Streaming (Free)",
	    "unitsAlbums": 5000,
	    "unitsTracks": 500,
	    "startDate": "",
	    "endDate": ""
	  },
	  {
	    "country": "All Other Territories",
	    "iso": "XX",
	    "mediaType": "Streaming (Premium)",
	    "unitsAlbums": 1000,
	    "unitsTracks": 100,
	    "startDate": "",
	    "endDate": ""
	  }
	]

}
