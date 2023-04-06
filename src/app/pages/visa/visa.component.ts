import { Component, OnDestroy, OnInit, TemplateRef } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Visa } from "src/app/classes/visa";
import { DbService } from "src/app/services/db.service";
import { Subscription } from "rxjs";
import { AngularFirestore, AngularFirestoreDocument } from "@angular/fire/firestore";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DeleteDialogComponent } from "src/app/entryComponents/delete-dialog/delete-dialog.component";
import { CONTACT_COLLECTION, VISA_COLLECTION } from "src/app/utils";
import { ViewDetailsDialogComponent } from "src/app/entryComponents/view-details-dialog/view-details-dialog.component";
import { ActivatedRoute } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import firebase from "firebase/app";
import { AngularFireStorage } from "@angular/fire/storage";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Contactus } from "src/app/classes/contactus";
import { filter } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: 'app-visa',
  templateUrl: './visa.component.html',
  styleUrls: ['./visa.component.scss']
})
export class VisaComponent {

  visaList: Visa[] = [];
  visaSub: Subscription;
  visaId: string;

  visaForm: FormGroup;
  tempFile: any = null;
  updateMode: boolean = false;
  addminImage: boolean = true;
  loader: boolean = false;

  branchModel: Contactus;
  isBranch: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private dbService: DbService,
    private dbRef: AngularFirestore,
    private stgRef: AngularFireStorage,
    private toast: ToastrService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private snackbar: MatSnackBar

    
  ) {}



  ngOnInit(): void {
    this.route.params.subscribe((value) => {
      this.visaId = value.visaId ?? null;
      this.getData(value.visaId ?? null);
    })
  }

  getData(visaId: string | null = null) {
    if (visaId === null) {
      this.isBranch = false;
      this.dbService.getVisa();
      this.visaSub = this.dbService.visaSubject.subscribe((list) => {
        if (list != null) {
          this.visaList = list;
        }
      });
    } else {
      this.isBranch = true;
      this.dbService.contactSubject.subscribe((data) => {
        if(data !== null) {    
          this.branchModel = data.find(x => x.contactId === visaId);
        }
      });
      this.dbRef.collection(CONTACT_COLLECTION).doc(this.visaId)
        .collection(VISA_COLLECTION)
        .valueChanges()
        .subscribe((list) => {
          this.visaList = list.map(e => e as Visa)
        })
    }
  }

  openVisaDialog(modalRef: TemplateRef<any>, visaObj: Visa | null = null) {
    this.modalService.open(modalRef);
    this.initialForm(visaObj)
  }

  checkFileType(files) {
    this.tempFile = files[0];
    if (this.tempFile.type == "image/png" || this.tempFile.type == "image/jpeg" || this.tempFile.type == "image/jpg") {
      // console.log("File Ok");
    } else {
      // console.log("File not Ok");
      this.tempFile = null;
      this.toast.warning("Only .png/.jpeg/.jpg file format accepted!!", "");
    }
  }

  initialForm(visaModel: Visa | null = null) {
    this.tempFile = null;
    if (visaModel === null) {
      this.updateMode = false;
      this.visaForm = this.fb.group({
        title: ["", Validators.required],
        description: ["", Validators.required],
        imageUrl: [""],
        visaId: [this.dbRef.createId()],
        visaStatus: [true],
        addedOn: [firebase.firestore.Timestamp.now()],
      });
    } else {
      this.updateMode = true;
      this.addminImage = false;
      this.visaForm = this.fb.group({
        title: [visaModel.title, Validators.required],
        description: [visaModel.description, Validators.required],
        imageUrl: [visaModel.imageUrl],
        visaId: [visaModel.visaId],
        visaStatus: [visaModel.visaStatus],
      })
    }
  }

  async uploadImage(form: FormGroup): Promise<void> {
    this.loader = true;
    let visaObj: Visa = { ...form.value };
    if(this.tempFile !== null) {
      const file = this.tempFile;
      const FilePath = `images${this.visaId !== null ? "/" +this.visaId :"" }/${visaObj.visaId}_${String(this.tempFile.name).toLowerCase().replace(/ /g, "_")}`;
      const FileRef = this.stgRef.ref(FilePath);
      await this.stgRef.upload(FilePath, file);
      visaObj.imageUrl = await FileRef.getDownloadURL().toPromise();
    }

    let docRef: AngularFirestoreDocument<unknown> = null;
    if(this.visaId === null) {
      docRef = this.dbRef.collection(VISA_COLLECTION).doc(visaObj.visaId);
    } else {
      docRef = this.dbRef.collection(CONTACT_COLLECTION).doc(this.visaId)
      .collection(VISA_COLLECTION).doc(visaObj.visaId);
    }

    docRef.set({
      ...visaObj
    }, { merge: true })
      .then(() => {
        this.loader = false;
        this.modalService.dismissAll();
        this.snackbar.open("Visa Added/Updated Successfully", "", {
          duration: 2500,
          panelClass: ["alert", "alert-danger"],
        });
      }, error => {
        console.error(">>> error: ", error);
        this.loader = false;
        this.snackbar.open("Something went wrong", "", {
          duration: 2500,
          panelClass: ["alert", "alert-danger"],
        });
      })
  }

  changeImageMode() {
    this.addminImage = true;
  }

  deleteItem(docId, url) {
    console.log(url);
    const modalRef = this.modalService.open(DeleteDialogComponent);
    modalRef.componentInstance.data = {
      message: 'Visa'
    };

    modalRef.result.then(async (value) => {
      if(value === 1) {
        await this.stgRef.refFromURL(url).delete();
        this.dbRef.collection(VISA_COLLECTION).doc(docId)
          .delete()
          .then(
            () => {
              this.snackbar.open("Visa Deleted Successfully", "", {
                duration: 2500,
                panelClass: ["alert", "alert-danger"],
              });
            },
            (error) => {
              console.error(">>> error: ", error);
              this.snackbar.open("Something went wrong", "", {
                duration: 2500,
                panelClass: ["alert", "alert-danger"],
              });            }
          );
      }
    }, (error) => console.log(error))
  }

  viewDetails(prodObj) {
    
    this.dialog.open(ViewDetailsDialogComponent, {
      data: {
        title: "Visa",
        obj: prodObj,
      },
      panelClass: ["col-12", "col-sm-4"],
    });
  }

  openLink(url) {
    window.open(url, "_blank");
  }

  ngOnDestroy() {
    this.dbService.visaRetrieved = false;
    if(this.visaSub !== undefined) {
      this.dbService.visaSubject.next([]);
      this.visaSub.unsubscribe();
    }
  }

}
