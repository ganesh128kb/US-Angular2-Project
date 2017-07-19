import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home';
import { AccountComponent } from './shared/account.component';
import { BestSellersComponent } from './bestsellers/bestsellers.component';
import { ListsComponent } from './shared/lists.component';
import { UserComponent } from './shared/user/user.component';
import { ListDetailComponent } from './shared/list.component';
import { ArtistDetailComponent } from './details/artist/artist.component';
import { ProjectDetailComponent } from './details/project/project.component';
import { TrackDetailComponent } from './details/track/track.component';
import { DocsComponent } from './documentation/docs.component';
import { NoContentComponent } from './no-content';

import { AuthGuard } from './shared/user/authguard.service';

import { DataResolver } from './app.resolver';

export const ROUTES: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: UserComponent },
    { path: 'docs', component: DocsComponent, canActivate: [AuthGuard] },
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'account', component: AccountComponent, canActivate: [AuthGuard] },
    { path: 'bestsellers/:type', component: BestSellersComponent, canActivate: [AuthGuard] },
    { path: 'lists', component: ListsComponent, canActivate: [AuthGuard] },
    { path: 'list/:listID', component: ListDetailComponent, canActivate: [AuthGuard] },
    { path: 'artist/:artistID', component: ArtistDetailComponent, canActivate: [AuthGuard] },
    { path: 'artist/:artistID/:projectID', component: ProjectDetailComponent, canActivate: [AuthGuard] },
    { path: 'artist/:artistID/:projectID/:trackID', component: TrackDetailComponent, canActivate: [AuthGuard] },
    { path: '**', component: NoContentComponent }
];

// export const ROUTES: Routes = [
//     { path: '', redirectTo: '/login', pathMatch: 'full' },
//     { path: 'login', component: UserComponent },
//     { path: 'home', component: HomeComponent },
//     { path: 'account', component: AccountComponent },
//     { path: 'bestsellers/:type', component: BestSellersComponent },
//     { path: 'lists', component: ListsComponent },
//     { path: 'list/:listID', component: ListDetailComponent },
//     { path: 'artist/:artistID', component: ArtistDetailComponent },
//     { path: 'artist/:artistID/:projectID', component: ProjectDetailComponent },
//     { path: 'artist/:artistID/:projectID/:trackID', component: TrackDetailComponent },
//     { path: '**', component: NoContentComponent }
// ];
