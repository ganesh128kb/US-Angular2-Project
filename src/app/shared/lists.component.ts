import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ListsService } from './lists.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { DropdownConfig } from '../ng2-daterangepicker/dropdown';

@Component({
    selector: 'lists',
    templateUrl: './lists.component.html',
    styleUrls: ['../../assets/sass/lists.component.sass', '../../assets/sass/bestsellers.component.sass']
})

export class ListsComponent implements OnInit{

    public listTitle = "November 2016";
    public addListGroup: FormGroup;
    public test: any;
    public lists;
    // private userID: number = this.us.userID;

    public listAddSearch = this.fb.group({
        search: ["", Validators.required]
    });

    constructor(public fb: FormBuilder,
                private ls: ListsService,
                private router: Router) { }

    ngOnInit(): void{
        // this.getLists();

        this.addListGroup = new FormGroup({
            listName: new FormControl('')
        });
    }

    // doLogin(event) {
    //     console.log(event);
    //     console.log(this.listAddSearch.value);
    // }

    // getLists(){
    //     this.ls.getLists().subscribe(
    //         res => {this.lists = res;},
    //         err => console.log(err)
    //     );
    // }
    //
    // addList(name: any){
    //     let value = name.value.listName;
    //     let id = this.getLists();
    //     let obj;
    //     //let tempData;
    //     this.ls.createList(value, this.userID).subscribe(
    //         data => {
    //             //Question for later: how to fire off redirect after obersvable.
    //             this.ls.getLists().subscribe(
    //                 res => {
    //                     this.lists = res;
    //                     obj = res.filter(function(obj){
    //                         return obj.listName == value;
    //                     });
    //                     this.router.navigate(['/list/'+obj[0]._id]);
    //                 },
    //                 err => console.log(err),
    //                 () => {
    //
    //                 }
    //             );
    //             //this.router.navigate(['/list/']);
    //             return true;
    //         },
    //         error => {
    //          console.error("Error saving food!");
    //          return Observable.throw(error);
    //        },
    //        () => { }
    //      );
    //     //console.log(value.listName);
    //     //console.log(this.test);
    // }
}
