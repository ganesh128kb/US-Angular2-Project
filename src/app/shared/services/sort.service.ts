import { Injectable } from '@angular/core';
@Injectable()
export class SortService {
    sortedBy: string;
    ascending: boolean = true;
  
    sort(sortName:string, compare:(a:any ,b:any)=>any, table: any){
        let sortedReports: any;
        sortedReports = table.slice();
        const ascending = compare;
        const descending = (a:any,b:any)=> -ascending(a,b);
        this.toggleOrder();
        if(this.sortedBy == sortName){
            //sortedReports.sort(this.ascending ? descending : ascending);
            sortedReports.sort(this.ascending ? ascending : descending);
        }else{
            this.ascending = false;
            sortedReports.sort(descending);
        }
        this.sortedBy = sortName;
        //console.log('Sort Serivce', sortedReports);
        return sortedReports;
    }
    toggleOrder(){
        this.ascending = !this.ascending;
    }
}
