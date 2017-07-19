import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';

import 'rxjs/add/operator/toPromise';

@Injectable()
export class ImageService {

	constructor(private http: Http){}

getImage(name: string): Promise<string>{
  return this.http.get('https://api.spotify.com/v1/search?type=artist;q='+name)
      .toPromise()
      .then(res => res.json().artists.items[0].images[0].url);
}
}
