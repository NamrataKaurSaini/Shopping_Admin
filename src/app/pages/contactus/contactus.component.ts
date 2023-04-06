import { Component, OnInit, TemplateRef } from '@angular/core';
import { MatDialog } from "@angular/material/dialog";
import { Contactus } from "src/app/classes/contactus";
import { DbService } from "src/app/services/db.service";
import { Subscription } from "rxjs";
import { AngularFirestore } from "@angular/fire/firestore";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DeleteDialogComponent } from "src/app/entryComponents/delete-dialog/delete-dialog.component";
import { CONTACT_COLLECTION } from "src/app/utils";
import { ViewDetailsDialogComponent } from "src/app/entryComponents/view-details-dialog/view-details-dialog.component";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/storage';
import firebase from 'firebase/app';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-contactus',
  templateUrl: './contactus.component.html',
  styleUrls: ['./contactus.component.scss']
})
export class ContactusComponent implements OnInit {
  contactList: Contactus[] = [];
  contactSub: Subscription;

  contactForm: FormGroup;
  tempFile: any = null;
  updateMode: boolean = false;
  addminImage: boolean = true;
  loader: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private dbService: DbService,
    private dbRef: AngularFirestore,
    private stgRef: AngularFireStorage,
    private snackbar: MatSnackBar,
    private modalService: NgbModal
  ) {
    
   }

  ngOnInit(): void {
    this.dbService.getContactDetails();
    this.contactSub = this.dbService.contactSubject.subscribe((list) => {
      if (list != null) {
        this.contactList = list;
      }
    });

  }

  openContactDialog(modalRef: TemplateRef<any>, contactObj: Contactus | null = null) {
    this.modalService.open(modalRef);
    this.initialForm(contactObj)
  }

  checkFileType(files) {
    this.tempFile = files[0];
    if (this.tempFile.type == "image/png" || this.tempFile.type == "image/jpeg" || this.tempFile.type == "image/jpg") {
      // console.log("File Ok");
    } else {
      // console.log("File not Ok");
      this.tempFile = null;
      this.snackbar.open("Only .png/.jpeg/.jpg file format accepted!!", "", {
        duration: 2500,
        panelClass: ['alert', 'alert-warning']
      });
    }
  }

  initialForm(contactModel: Contactus | null = null) {
    if (contactModel === null) {
      this.updateMode = false;
      this.contactForm = this.fb.group({

        title: ["", Validators.required],
        phone: ["", Validators.required],
        email: ["", Validators.required],
        address:["", Validators.required],
        city:["",Validators.required],
        imageUrl: [""],
        contactId: [this.dbRef.createId()],
        contactStatus: [true],
        addedOn: [firebase.firestore.Timestamp.now()],
        mapLink: [null]
      });
    } else {
      this.updateMode = true;
      this.addminImage = false;
      this.contactForm = this.fb.group({
        title: [contactModel.title, Validators.required],
        phone: [contactModel.phone, Validators.required],
        email: [contactModel.email, Validators.required],
        address: [contactModel.address, Validators.required],
        city: [contactModel.city, Validators.required],
        imageUrl: [contactModel.imageUrl],
        contactId: [contactModel.contactId],
        contactStatus: [contactModel.contactStatus],
        mapLink: [contactModel.mapLink],
      })
    }
  }

  async uploadImage(form: FormGroup) {
    if(this.tempFile != null || this.updateMode) {
      this.loader = true;
      let contactObj: Contactus = { ...form.value };
      if(this.tempFile !== null) {
        const file = this.tempFile;
        const FilePath = "contactusImages/" + contactObj.contactId;
        const FileRef = this.stgRef.ref(FilePath);
        await this.stgRef.upload(FilePath, file);
        contactObj.imageUrl = await FileRef.getDownloadURL().toPromise();
      }

      this.dbRef.collection(CONTACT_COLLECTION).doc(contactObj.contactId)
        .set(contactObj, { merge: true })
        .then(() => {
          this.loader = false;
          this.modalService.dismissAll();
          this.snackbar.open("Contact Details Added Successfully", "", {
            duration: 2500,
            panelClass: ['alert', 'alert-success']
          });
        }, error => {
          console.error(">>> error: ", error);
          this.loader = false;
          this.snackbar.open("Something Went Wrong", "", {
            duration: 2500,
            panelClass: ['alert', 'alert-danger']
          });
        })

    } else {
      this.snackbar.open("Please Select Image File", "", {
        duration: 2500,
      });
    }
  }


  changeImageMode() {
    this.addminImage = true;
  }


  deleteItem(docId) {
    this.dialog
      .open(DeleteDialogComponent, {
        data: {
          message: "contactus details",
        },
        // panelClass: ["col-3"],
      })
      .afterClosed()
      .subscribe((response) => {
        if (response == 1 && response != undefined) {
          this.dbRef
            .collection(CONTACT_COLLECTION)
            .doc(docId)
            .delete()
            .then(
              () => {
                this.snackbar.open("Contactus Details Deleted Successfully", "", {
                  duration: 2500,
                  panelClass: ["alert", "alert-success"],
                });
              },
              (error) => {
                console.error(">>> error: ", error);
                this.snackbar.open("Something Went Wrong", "", {
                  duration: 2500,
                  panelClass: ["alert", "alert-danger"],
                });
              }
            );
        }
      });
  }

  viewDetails(prodObj) {
    this.dialog.open(ViewDetailsDialogComponent, {
      data: {
        title: "contactus Details",
        obj: prodObj,
      },
      panelClass: ["col-12", "col-sm-4"],
    });
  }

  openLink(url) {
    window.open(url, "_blank");
  }

  ngOnDestroy() {
    this.contactSub.unsubscribe();
  }





}
