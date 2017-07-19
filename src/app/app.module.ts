import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import {
  HttpModule,
  JsonpModule
} from '@angular/http';

import {
  NgModule,
  ApplicationRef,
  OnChanges
} from '@angular/core';

import {
  removeNgStyles,
  createNewHosts,
  createInputTransfer
} from '@angularclass/hmr';

import {
  RouterModule,
  PreloadAllModules
} from '@angular/router';

//Third-party Modules
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ClipboardModule } from 'ngx-clipboard';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LoadersCssModule } from 'angular2-loaders-css';
import { ApolloClient } from 'apollo-client';
import { ApolloModule } from 'apollo-angular';
import { provideClient } from './graphql.client';
import { Ng2CompleterModule } from "ng2-completer";

//Providers and Routes
import { ENV_PROVIDERS } from './environment';
import { ROUTES } from './app.routes';

// App is our top level component
import { SharedModule } from './shared.module';
import { AppComponent } from './app.component';
import { APP_RESOLVER_PROVIDERS } from './app.resolver';
import { AppState, InternalStateType } from './app.service';
import { ReactiveFormsModule } from '@angular/forms';

//Services
import { AuthGuard } from './shared/user/authguard.service';
import { AuthService } from './shared/user/auth.service';
import { BestSellerService } from './bestsellers/bestsellers.service';
import { FilterService } from './shared/filter.service';
import { ExportService } from './shared/export.service';
import { ListsService } from './shared/lists.service';
import { ArtistDetailService } from './details/artist/artist.service';
import { ProjectDetailService } from './details/project/project.service';
import { TrackDetailService } from './details/track/track.service';
import { SearchService } from './shared/services/search';
import { ImageService } from './shared/services/images';
import { Globals } from './shared/globalVariables';
import { FilterDatesService } from './shared/filterDates.service';
import { SortService } from './shared/services/sort.service';
import { HomeService } from './home';

//Components
import { HomeComponent } from './home';
import { UserComponent } from './shared/user/user.component';
import { LoaderComponent } from './shared/loader.component';
import { AccountComponent } from './shared/account.component';
import { BestSellersComponent } from './bestsellers/bestsellers.component';
import { ListsComponent } from './shared/lists.component';
import { ListDetailComponent } from './shared/list.component';
import { ArtistDetailComponent } from './details/artist/artist.component';
import { ProjectDetailComponent } from './details/project/project.component';
import { TrackDetailComponent } from './details/track/track.component';
import { DetailLineChartOverviewComponent } from './shared/charts/detailLineChartOverview.component';
import { DetailLineChartWeekPartnersComponent } from './shared/charts/detailLineChartWeek.component';
import { DetailLineChartPartnersComponent } from './shared/charts/detailLineChartPartners.component';
import { TrackDetailLineChartOverviewComponent } from './shared/charts/track/trackDetailLineChartOverview.component';
import { TrackDetailLineChartPartnersComponent } from './shared/charts/track/trackDetailLineChartPartners.component';
import { TrackDetailBarChartComponent } from './shared/charts/track/trackDetailBarChart.component';
import { TrackDetailPieChartComponent } from './shared/charts/track/trackDetailPieChart.component';
import { ProjectDetailLineChartOverviewComponent } from './shared/charts/project/projectDetailLineChartOverview.component';
import { ProjectDetailLineChartWeekComponent } from './shared/charts/project/projectDetailLineChartWeek.component';
import { ProjectDetailLineChartPartnersComponent } from './shared/charts/project/projectDetailLineChartPartners.component';
import { ProjectDetailBarChartComponent } from './shared/charts/project/projectDetailBarChart.component';
import { ProjectDetailPieChartComponent } from './shared/charts/project/projectDetailPieChart.component';
import { DetailBarChartComponent } from './shared/charts/detailBarChart.component';
import { MiniBarChartComponent } from './shared/charts/miniBarChart.component';
import { PieChartComponent } from './shared/charts/pieChart.component';
import { HeaderComponent } from './shared/header.component';
import { FilterComponent } from './shared/filter.component';
import { TableButtonsComponent } from './shared/tableButtons.component';
import { SearchComponent } from './shared/search.component';
import { AddToListComponent } from './shared/addtolist.component';
import { NoContentComponent } from './no-content';
import { FilterDatesComponent } from './shared/filterDates.component';
import { TabPartners } from './shared/tabs/tabpartners.component';
import { DocsComponent } from './documentation/docs.component';


//Directives
// import { BarChartDirective } from './shared/charts/barChart.component';

//Pipes
import { Safe } from './shared/pipes/safe';
import { ArraySortPipe } from './shared/pipes/sort';

declare module "file-saver";

// Application wide providers
const APP_PROVIDERS = [
  ...APP_RESOLVER_PROVIDERS,
  AppState
];

type StoreType = {
  state: InternalStateType,
  restoreInputValues: () => void,
  disposeOldHosts: () => void
};

//App Module Entry Point
@NgModule({
  bootstrap: [ AppComponent ],
  declarations: [
    AppComponent,
    AccountComponent,
    Safe,
    BestSellersComponent,
    ListsComponent,
    ListDetailComponent,
    ArtistDetailComponent,
    ProjectDetailComponent,
    TrackDetailComponent,
    DetailLineChartPartnersComponent,
    DetailLineChartOverviewComponent,
    DetailLineChartWeekPartnersComponent,
    TrackDetailLineChartPartnersComponent,
    TrackDetailLineChartOverviewComponent,
    TrackDetailBarChartComponent,
    TrackDetailPieChartComponent,
    ProjectDetailLineChartWeekComponent,
    ProjectDetailLineChartPartnersComponent,
    ProjectDetailLineChartOverviewComponent,
    ProjectDetailBarChartComponent,
    ProjectDetailPieChartComponent,
    DetailBarChartComponent,
    MiniBarChartComponent,
    PieChartComponent,
    LoaderComponent,
    HomeComponent,
    HeaderComponent,
    FilterComponent,
    TableButtonsComponent,
    SearchComponent,
    AddToListComponent,
    ArraySortPipe,
    NoContentComponent,
    FilterDatesComponent,
    UserComponent,
    DocsComponent
  ],
  imports: [ // import Angular's modules
    BrowserModule,
    SharedModule,
    FormsModule,
    HttpModule,
    ChartsModule,
    NgbModule.forRoot(),
    Ng2CompleterModule,
    JsonpModule,
    NgxChartsModule,
    ReactiveFormsModule,
    ClipboardModule,
    LoadersCssModule,
    ApolloModule.forRoot(provideClient),
    RouterModule.forRoot(ROUTES, { useHash: true, preloadingStrategy: PreloadAllModules })
  ],
  providers: [ // expose our Services and Providers into Angular's dependency injection
    ENV_PROVIDERS,
    APP_PROVIDERS,
    BestSellerService,
    HomeService,
    FilterService,
    ExportService,
    ArtistDetailService,
    ProjectDetailService,
    TrackDetailService,
    SearchService,
    ImageService,
    ListsService,
    Globals,
    FilterDatesService,
    SortService,
    AuthService,
    AuthGuard
  ]
})
export class AppModule {

  constructor(
    public appRef: ApplicationRef,
    public appState: AppState
  ) {}

  public hmrOnInit(store: StoreType) {
    if (!store || !store.state) {
      return;
    }
    console.log('HMR store', JSON.stringify(store, null, 2));
    // set state
    this.appState._state = store.state;
    // set input values
    if ('restoreInputValues' in store) {
      let restoreInputValues = store.restoreInputValues;
      setTimeout(restoreInputValues);
    }

    this.appRef.tick();
    delete store.state;
    delete store.restoreInputValues;
  }

  public hmrOnDestroy(store: StoreType) {
    const cmpLocation = this.appRef.components.map((cmp) => cmp.location.nativeElement);
    // save state
    const state = this.appState._state;
    store.state = state;
    // recreate root elements
    store.disposeOldHosts = createNewHosts(cmpLocation);
    // save input values
    store.restoreInputValues  = createInputTransfer();
    // remove styles
    removeNgStyles();
  }

  public hmrAfterDestroy(store: StoreType) {
    // display new elements
    store.disposeOldHosts();
    delete store.disposeOldHosts;
  }

}
