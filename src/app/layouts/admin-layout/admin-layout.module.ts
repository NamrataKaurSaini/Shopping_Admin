import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ClipboardModule } from 'ngx-clipboard';

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

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    HttpClientModule,
    NgbModule,
    ClipboardModule,
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
    
  ]
})

export class AdminLayoutModule {}
