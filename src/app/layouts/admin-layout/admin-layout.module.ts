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
// import { ToastrModule } from 'ngx-toastr';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    HttpClientModule,
    NgbModule,
    ClipboardModule
  ],
  declarations: [
    DashboardComponent,
    SlidersComponent,
    ImagesComponent,
    VideosComponent,
    QueriesComponent,
    EnqueriesComponent,
    ServicesComponent,
    
  ]
})

export class AdminLayoutModule {}
