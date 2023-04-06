import { Routes } from '@angular/router';
import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { SlidersComponent } from 'src/app/pages/sliders/sliders.component';
import { VideosComponent } from 'src/app/pages/videos/videos.component';
import { ImagesComponent } from 'src/app/pages/images/images.component';
import { QueriesComponent } from 'src/app/pages/queries/queries.component';
import { ServicesComponent } from 'src/app/pages/services/services.component';
import { ReviewsComponent } from 'src/app/pages/reviews/reviews.component';
import { SocialMediaComponent } from 'src/app/pages/social-media/social-media.component';
import { VisaComponent } from 'src/app/pages/visa/visa.component';
import { AuthGuard } from 'src/app/auth.guard';
import { EnqueriesComponent } from 'src/app/pages/enqueries/enqueries.component';
import { AddressComponent } from 'src/app/pages/address/address.component';

export const AdminLayoutRoutes: Routes = [
    { path: 'dashboard',      component: DashboardComponent, canActivate: [AuthGuard] },
    { path: 'sliders',        component: SlidersComponent, canActivate: [AuthGuard] },
    { path: 'images',         component: ImagesComponent, canActivate: [AuthGuard] },
    { path: 'videos',         component: VideosComponent, canActivate: [AuthGuard] },
    { path: 'queries',        component: QueriesComponent, canActivate: [AuthGuard] },
    { path: 'services',       component: ServicesComponent, canActivate: [AuthGuard] },
    { path: 'reviews',        component: ReviewsComponent, canActivate: [AuthGuard] },
    { path: 'social-media',   component: SocialMediaComponent, canActivate: [AuthGuard] },
    { path: 'visa',           component: VisaComponent, canActivate: [AuthGuard] },
    { path: 'enqueries',      component: EnqueriesComponent, canActivate: [AuthGuard] },
    { path: 'address',        component: AddressComponent, canActivate: [AuthGuard] },




];
