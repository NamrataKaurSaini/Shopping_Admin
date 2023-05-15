import { NgModule } from "@angular/core";
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

// import { ClipboardModule } from 'ngx-clipboard';

import { AdminLayoutRoutes } from './admin-layout.routing';
import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SlidersComponent } from '../../pages/sliders/sliders.component';
import { ImagesComponent } from '../../pages/images/images.component';
import { VideosComponent } from '../../pages/videos/videos.component';
import { QueriesComponent } from '../../pages/queries/queries.component';
import { EnqueriesComponent } from '../../pages/enqueries/enqueries.component';
import { ServicesComponent } from '../../pages/services/services.component';
import { VisaComponent } from '../../pages/visa/visa.component';
import { ReviewsComponent } from '../../pages/reviews/reviews.component';
import { SocialMediaComponent } from '../../pages/social-media/social-media.component';
import { AddressComponent } from '../../pages/address/address.component';
import { ContactusComponent } from '../../pages/contactus/contactus.component';
import { MaterialModule } from 'src/app/material.module';
// import { ToastrModule } from 'ngx-toastr';
import { MenBottomwearComponent } from "src/app/pages/men/men-bottomwear/men-bottomwear.component";
import { MenTopwearComponent } from "src/app/pages/men/men-topwear/men-topwear.component";
import { MenFootwearComponent } from "src/app/pages/men/men-footwear/men-footwear.component";
import { MenIndianwearComponent } from "src/app/pages/men/men-indianwear/men-indianwear.component";
import { MenAccessorizeComponent } from "src/app/pages/men/men-accessorize/men-accessorize.component";
import { WomenWesternwearComponent } from "src/app/pages/women/women-westernwear/women-westernwear.component";
import { WomenIndianwearComponent } from "src/app/pages/women/women-indianwear/women-indianwear.component";
import { WomenFootwearComponent } from "src/app/pages/women/women-footwear/women-footwear.component";
import { WomenAccessorizeComponent } from "src/app/pages/women/women-accessorize/women-accessorize.component";
import { HomedecorComponent } from "src/app/pages/homedecor/homedecor.component";
import { CategoryComponent } from "src/app/pages/category/category.component";
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    HttpClientModule,
    NgbModule,
    // ClipboardModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  declarations: [
    DashboardComponent,
    SlidersComponent,
    ImagesComponent,
    VideosComponent,
    QueriesComponent,
    EnqueriesComponent,
    ServicesComponent,
    VisaComponent,
    ReviewsComponent,
    SocialMediaComponent,
    AddressComponent,
    ContactusComponent,
    MenBottomwearComponent,
    MenTopwearComponent,
    MenFootwearComponent,
    MenIndianwearComponent,
    MenAccessorizeComponent,
    WomenWesternwearComponent,
    WomenFootwearComponent,
    WomenIndianwearComponent,
    WomenAccessorizeComponent,
    HomedecorComponent,
    CategoryComponent

    
  ]
})

export class AdminLayoutModule {}
