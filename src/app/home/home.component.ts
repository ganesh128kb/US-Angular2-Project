import { Component, OnInit } from '@angular/core';
import { ListsService } from '../shared/lists.service';
import { Globals } from '../shared/globalVariables';

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['../../assets/sass/home.component.sass']
})

export class HomeComponent implements OnInit {

  public lists;

  constructor(private ls: ListsService,
              private globals: Globals) { }

ngOnInit(): void {
  // this.getLists();
}

// getLists(){
//     this.ls.getLists().subscribe(
//         res => {this.lists = res; console.log(res);},
//         err => console.log(err),
//         () => console.log('done loading lists')
//     );
// }

    // globalPriorities = [
    //   {"artistName": "Drake"},
    //   {"artistName": "Kendrick Lamar", "artistID": }
    // ]

    prioritiesTop: Array<string> = [
        'November 2016',
        'Top Performers',
        'New Releases',
        'Old Tracks',
        'U.S. Pop'];

}
