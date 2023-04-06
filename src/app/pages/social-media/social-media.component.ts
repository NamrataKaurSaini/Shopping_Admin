import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DbService } from 'src/app/services/db.service';
import { Subscription } from 'rxjs';
import * as util from 'src/app/utils';

@Component({
  selector: 'app-social-media',
  templateUrl: './social-media.component.html',
  styleUrls: ['./social-media.component.scss']
})
export class SocialMediaComponent implements OnInit, OnDestroy {

  socialLinkForm: FormGroup;
  changeMode: boolean = false;
  socialMediaSub: Subscription;

  socialModel: any;

  constructor(
    private fb: FormBuilder,
    private dbRef: AngularFirestore,
    private dbService: DbService,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.socialLinkForm = this.fb.group({
      facebook: [""],
      instagram: [""],
      mail: [""],
      twitter: [""],
      whatsappNumber: [""],
      youtube: [""],
      linkedin: [""],
      socialId: [""],
    });
    this.socialLinkForm.disable();
    this.dbService.getSocialMediaLinks();
    this.socialMediaSub = this.dbService.socialMediaLinkSubject.subscribe(socialObj => {
      if (socialObj != null) {
        this.socialModel = socialObj
        this.socialLinkForm = this.fb.group({
          socialId: [socialObj.socialId],
          facebook: [socialObj.facebook],
          instagram: [socialObj.instagram],
          mail: [socialObj.mail],
          twitter: [socialObj.twitter],
          whatsappNumber: [socialObj.whatsappNumber],
          youtube: [socialObj.youtube],
          linkedin: [socialObj.linkedin]
        });
        this.socialLinkForm.disable();
        // console.log(socialObj);
      }

    })
  }

  saveSocialLinks(form: FormGroup) {
    let formValues = { ...form.value };
    // console.log(formValues);
    this.dbRef.collection(util.SOCIALLINKS_COLLECTION).doc(util.SOCIALLINKS_COLLECTION)
      .set(formValues, { merge: true })
      .then(() => {
        this.snackbar.open("Social Medial Links Updated Successfully", "", {
          duration: 2500,
          panelClass: ["alert", "alert-success"],
        });
        this.changeMode = false;
        this.socialLinkForm.disable();
      })
      .catch((error) => {
        this.snackbar.open("Something went wrong", "", {
          duration: 2500,
          panelClass: ["alert", "alert-danger"],
        });
      })
  }

  changeModeStatus() {
    this.changeMode = true;
    this.socialLinkForm.enable();
  }

  ngOnDestroy() {
    this.socialMediaSub.unsubscribe();
  }

}
