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
import { MenBottomwearComponent } from 'src/app/pages/men/men-bottomwear/men-bottomwear.component';
import { MenTopwearComponent } from "src/app/pages/men/men-topwear/men-topwear.component";
import { MenFootwearComponent } from "src/app/pages/men/men-footwear/men-footwear.component";
import { MenIndianwearComponent } from "src/app/pages/men/men-indianwear/men-indianwear.component";
import { MenAccessorizeComponent } from "src/app/pages/men/men-accessorize/men-accessorize.component";
import { WomenWesternwearComponent } from "src/app/pages/women/women-westernwear/women-westernwear.component";
import { WomenIndianwearComponent } from "src/app/pages/women/women-indianwear/women-indianwear.component";
import { WomenFootwearComponent } from "src/app/pages/women/women-footwear/women-footwear.component";
import { WomenAccessorizeComponent } from "src/app/pages/women/women-accessorize/women-accessorize.component";
import { HomedecorComponent } from 'src/app/pages/homedecor/homedecor.component';
import { CategoryComponent } from 'src/app/pages/category/category.component';

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
    { path: 'men-bottomwear', component: MenBottomwearComponent, canActivate: [AuthGuard] },
    { path: 'men-topwear', component: MenTopwearComponent, canActivate: [AuthGuard] },
    { path: 'men-footwear', component: MenFootwearComponent, canActivate: [AuthGuard] },
    { path: 'men-indianwear', component: MenIndianwearComponent, canActivate: [AuthGuard] },
    { path: 'men-accessorize', component: MenAccessorizeComponent, canActivate: [AuthGuard] },
    { path: 'women-westernwear', component: WomenWesternwearComponent, canActivate: [AuthGuard] },
    { path: 'women-footwear', component: WomenFootwearComponent, canActivate: [AuthGuard] },
    { path: 'women-indianwear', component: WomenIndianwearComponent, canActivate: [AuthGuard] },
    { path: 'women-accessorize', component: WomenAccessorizeComponent, canActivate: [AuthGuard] },
    { path: 'homedecor', component: HomedecorComponent, canActivate: [AuthGuard] },
    { path: 'category', component: CategoryComponent, canActivate: [AuthGuard] },
    






];
