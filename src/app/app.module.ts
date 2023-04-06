import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MaterialModule } from './material.module';
import { AppComponent } from './app.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app.routing';
import { ComponentsModule } from './components/components.module';
import { DeleteDialogComponent } from './entryComponents/delete-dialog/delete-dialog.component';
import { ViewDetailsDialogComponent } from './entryComponents/view-details-dialog/view-details-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire';
import { environment } from 'src/environments/environment';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { DbService } from './services/db.service';
import { ToastrModule } from 'ngx-toastr';


@NgModule({
  imports: [
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ComponentsModule,
    NgbModule,
    RouterModule,
    AppRoutingModule,
    ReactiveFormsModule,
    MaterialModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    // AngularFireAuthModule,
    AngularFireStorageModule,
    // AngularFireMessagingModule
    ToastrModule.forRoot({
      positionClass: 'toast-top-center',
      timeOut: 3000,
    })

  ],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    AuthLayoutComponent,
    DeleteDialogComponent,
    ViewDetailsDialogComponent,

  ],
  providers: [DbService],
  bootstrap: [AppComponent],
  entryComponents: [
    DeleteDialogComponent,
    ViewDetailsDialogComponent,
    

  ]
})
export class AppModule { }
