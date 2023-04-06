import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DbService } from 'src/app/services/db.service';
import { Subscription } from 'rxjs';
import * as util from 'src/app/utils';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss']
})
export class AddressComponent implements OnInit, OnDestroy {

  addressForm: FormGroup;
  changeMode: boolean = false;
  addressSub: Subscription;

  addressModel: any;

  constructor(
    private fb: FormBuilder,
    private dbRef: AngularFirestore,
    private dbService: DbService,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.addressForm = this.fb.group({
      address: [""],
      phoneNo: [""],
      mail: [""],
      maplink: [""],
      addressId: [""],
    });
    this.addressForm.disable();
    this.dbService.getAddress();
    this.addressSub = this.dbService.addressSubject.subscribe(addressObj => {
      if (addressObj != null) {
        this.addressModel = addressObj
        this.addressForm = this.fb.group({
          addressId: [addressObj.addressId],
          address: [addressObj.address],
          phoneNo: [addressObj.phoneNo],
          mail: [addressObj.mail],
          maplink: [addressObj.maplink]
        });
        this.addressForm.disable();
        // console.log(socialObj);
      }

    })
  }

  saveAddressLinks(form: FormGroup) {
    let formValues = { ...form.value };
    // console.log(formValues);
    this.dbRef.collection(util.ADDRESS_COLLECTION).doc(util.ADDRESS_COLLECTION)
      .set(formValues, { merge: true })
      .then(() => {
        this.snackbar.open("Address Links Updated Successfully", "", {
          duration: 2500,
          panelClass: ["alert", "alert-success"],
        });
        this.changeMode = false;
        this.addressForm.disable();
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
    this.addressForm.enable();
  }

  ngOnDestroy() {
    this.addressSub.unsubscribe();
  }

}
