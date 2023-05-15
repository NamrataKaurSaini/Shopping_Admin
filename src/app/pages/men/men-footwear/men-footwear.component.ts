
import { Component, OnDestroy, OnInit, TemplateRef } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { DbService } from "src/app/services/db.service";
import { Subscription } from "rxjs";
import { AngularFirestore, AngularFirestoreDocument } from "@angular/fire/firestore";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DeleteDialogComponent } from "src/app/entryComponents/delete-dialog/delete-dialog.component";
import { CONTACT_COLLECTION, MENFOOTWEAR_COLLECTION} from "src/app/utils";
import { ViewDetailsDialogComponent } from "src/app/entryComponents/view-details-dialog/view-details-dialog.component";
import { ActivatedRoute } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import firebase from "firebase/app";
import { AngularFireStorage } from "@angular/fire/storage";
import { ModalDismissReasons, NgbDatepickerModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Contactus } from "src/app/classes/contactus";
import { filter } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import { menfootwear } from "src/app/classes/menfootwear";



@Component({
  selector: 'app-men-footwear',
  templateUrl: './men-footwear.component.html',
  styleUrls: ['./men-footwear.component.scss']
})
export class MenFootwearComponent implements OnInit, OnDestroy {
  menfootwearId: string;
  menfootwearList: menfootwear[]= [];
  menfootwearSub: Subscription;

  menfootwearForm: FormGroup;
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
      this.menfootwearId = value.menfootwearId ?? null;
      this.getData(value.menfootwearId ?? null);
    })
  }

  getData(menfootwearId: string | null = null) {
    if (menfootwearId === null) {
      this.isBranch = false;
      this.dbService.getMenfootwear() ;
      this.menfootwearSub = this.dbService.menfootwearSubject.subscribe((list) => {
        if (list != null) {
          this.menfootwearList = list;
        }
      });
    } else {
      this.isBranch = true;
      this.dbService.contactSubject.subscribe((data) => {
        if(data !== null) {    
          this.branchModel = data.find(x => x.contactId === menfootwearId);
        }
      });
      this.dbRef.collection(CONTACT_COLLECTION).doc(this.menfootwearId)
        .collection(MENFOOTWEAR_COLLECTION)
        .valueChanges()
        .subscribe((list) => {
          this.menfootwearList = list.map(e => e as menfootwear)
        })
    }
  }

  openMenfootwearDialog(modalRef: TemplateRef<any>, menfootwearObj: menfootwear | null = null) {
    this.modalService.open(modalRef);
    this.initialForm(menfootwearObj)
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

  initialForm(menfootwearModel: menfootwear | null = null) {
    this.tempFile = null;
    if (menfootwearModel === null) {
      this.updateMode = false;
      this.menfootwearForm = this.fb.group({
        title: ["", Validators.required],
        description: ["", Validators.required],
        price:["",Validators.required],
        imageUrl: [""],
        menfootwearId: [this.dbRef.createId()],
        menfootwearStatus: [true],
        addedOn: [firebase.firestore.Timestamp.now()],
      });
    } else {
      this.updateMode = true;
      this.addminImage = false;
      this.menfootwearForm = this.fb.group({
        title: [menfootwearModel.title, Validators.required],
        description: [menfootwearModel.description, Validators.required],
        price:[menfootwearModel.price, Validators.required],
        imageUrl: [menfootwearModel.imageUrl],
        menfootwearId: [menfootwearModel.menfootwearId],
        menfootwearStatus: [menfootwearModel.menfootwearStatus],
      })
    }
  }

  async uploadImage(form: FormGroup): Promise<void> {
    this.loader = true;
    let menfootwearObj: menfootwear = { ...form.value };
    if(this.tempFile !== null) {
      const file = this.tempFile;
      const FilePath = `images${this.menfootwearId !== null ? "/" +this.menfootwearId :"" }/${menfootwearObj.menfootwearId}_${String(this.tempFile.name).toLowerCase().replace(/ /g, "_")}`;
      const FileRef = this.stgRef.ref(FilePath);
      await this.stgRef.upload(FilePath, file);
      menfootwearObj.imageUrl = await FileRef.getDownloadURL().toPromise();
    }

    let docRef: AngularFirestoreDocument<unknown> = null;
    if(this.menfootwearId === null) {
      docRef = this.dbRef.collection(MENFOOTWEAR_COLLECTION).doc(menfootwearObj.menfootwearId);
    } else {
      docRef = this.dbRef.collection(CONTACT_COLLECTION).doc(this.menfootwearId)
      .collection(MENFOOTWEAR_COLLECTION).doc(menfootwearObj.menfootwearId);
    }

    docRef.set({
      ...menfootwearObj
    }, { merge: true })
      .then(() => {
        this.loader = false;
        this.modalService.dismissAll();
        this.snackbar.open("Product Added/Updated Successfully", "", {
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
      message: 'Product'
    };

    modalRef.result.then(async (value) => {
      if(value === 1) {
        await this.stgRef.refFromURL(url).delete();
        this.dbRef.collection(MENFOOTWEAR_COLLECTION).doc(docId)
          .delete()
          .then(
            () => {
              this.snackbar.open("Product Deleted Successfully", "", {
                duration: 2500,
                panelClass: ["alert", "alert-danger"],
              });
            },
            (error) => {
              console.error(">>> error: ", error);
              this.snackbar.open("Something went wrong", "", {
                duration: 2500,
                panelClass: ["alert", "alert-danger"],
              });
            }
          );
      }
    }, (error) => console.log(error))
  }

  viewDetails(prodObj) {
    
    this.dialog.open(ViewDetailsDialogComponent, {
      data: {
        title: "Slider Image",
        obj: prodObj,
      },
      panelClass: ["col-12", "col-sm-4"],
    });
  }

  openLink(url) {
    window.open(url, "_blank");
  }



  ngOnDestroy() {
    this.dbService.menfootwearRetrieved = false;
    if(this.menfootwearSub !== undefined) {
      this.dbService.menfootwearSubject.next([]);
      this.menfootwearSub.unsubscribe();
    }
  }
}
