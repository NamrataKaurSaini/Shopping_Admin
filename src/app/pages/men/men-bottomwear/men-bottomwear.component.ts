
import { Component, OnDestroy, OnInit, TemplateRef } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { DbService } from "src/app/services/db.service";
import { Subscription } from "rxjs";
import { AngularFirestore, AngularFirestoreDocument } from "@angular/fire/firestore";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DeleteDialogComponent } from "src/app/entryComponents/delete-dialog/delete-dialog.component";
import { CONTACT_COLLECTION, MENBOTTOMWEAR_COLLECTION} from "src/app/utils";
import { ViewDetailsDialogComponent } from "src/app/entryComponents/view-details-dialog/view-details-dialog.component";
import { ActivatedRoute } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import firebase from "firebase/app";
import { AngularFireStorage } from "@angular/fire/storage";
import { ModalDismissReasons, NgbDatepickerModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Contactus } from "src/app/classes/contactus";
import { filter } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import { menbottomwear } from "src/app/classes/menbottomwear";



@Component({
  selector: 'app-men-bottomwear',
    templateUrl: './men-bottomwear.component.html',
    styleUrls: ['./men-bottomwear.component.scss']
  })
  export class MenBottomwearComponent implements OnInit, OnDestroy {
  menbottomwearId: string;
  menbottomwearList: menbottomwear[]= [];
  menbottomwearSub: Subscription;

  menbottomwearForm: FormGroup;
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
      this.menbottomwearId = value.menbottomwearId ?? null;
      this.getData(value.menbottomwearId ?? null);
    })
  }

  getData(menbottomwearId: string | null = null) {
    if (menbottomwearId === null) {
      this.isBranch = false;
      this.dbService.getMenbottomwear() ;
      this.menbottomwearSub = this.dbService.menbottomwearSubject.subscribe((list) => {
        if (list != null) {
          this.menbottomwearList = list;
        }
      });
    } else {
      this.isBranch = true;
      this.dbService.contactSubject.subscribe((data) => {
        if(data !== null) {    
          this.branchModel = data.find(x => x.contactId === menbottomwearId);
        }
      });
      this.dbRef.collection(CONTACT_COLLECTION).doc(this.menbottomwearId)
        .collection(MENBOTTOMWEAR_COLLECTION)
        .valueChanges()
        .subscribe((list) => {
          this.menbottomwearList = list.map(e => e as menbottomwear)
        })
    }
  }

  openMenbottomwearDialog(modalRef: TemplateRef<any>, menbottomwearObj: menbottomwear | null = null) {
    this.modalService.open(modalRef);
    this.initialForm(menbottomwearObj)
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

  initialForm(menbottomwearModel: menbottomwear | null = null) {
    this.tempFile = null;
    if (menbottomwearModel === null) {
      this.updateMode = false;
      this.menbottomwearForm = this.fb.group({
        title: ["", Validators.required],
        description: ["", Validators.required],
        price:["",Validators.required],
        imageUrl: [""],
        menbottomwearId: [this.dbRef.createId()],
        menbottomwearStatus: [true],
        addedOn: [firebase.firestore.Timestamp.now()],
      });
    } else {
      this.updateMode = true;
      this.addminImage = false;
      this.menbottomwearForm = this.fb.group({
        title: [menbottomwearModel.title, Validators.required],
        description: [menbottomwearModel.description, Validators.required],
        price:[menbottomwearModel.price],
        imageUrl: [menbottomwearModel.imageUrl],
        menbottomwearId: [menbottomwearModel.menbottomwearId],
        menbottomwearStatus: [menbottomwearModel.menbottomwearStatus],
      })
    }
  }

  async uploadImage(form: FormGroup): Promise<void> {
    this.loader = true;
    let menbottomwearObj: menbottomwear = { ...form.value };
    if(this.tempFile !== null) {
      const file = this.tempFile;
      const FilePath = `images${this.menbottomwearId !== null ? "/" +this.menbottomwearId :"" }/${menbottomwearObj.menbottomwearId}_${String(this.tempFile.name).toLowerCase().replace(/ /g, "_")}`;
      const FileRef = this.stgRef.ref(FilePath);
      await this.stgRef.upload(FilePath, file);
      menbottomwearObj.imageUrl = await FileRef.getDownloadURL().toPromise();
    }

    let docRef: AngularFirestoreDocument<unknown> = null;
    if(this.menbottomwearId === null) {
      docRef = this.dbRef.collection(MENBOTTOMWEAR_COLLECTION).doc(menbottomwearObj.menbottomwearId);
    } else {
      docRef = this.dbRef.collection(CONTACT_COLLECTION).doc(this.menbottomwearId)
      .collection(MENBOTTOMWEAR_COLLECTION).doc(menbottomwearObj.menbottomwearId);
    }

    docRef.set({
      ...menbottomwearObj
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
        this.dbRef.collection(MENBOTTOMWEAR_COLLECTION).doc(docId)
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
    this.dbService.menbottomwearRetrieved = false;
    if(this.menbottomwearSub !== undefined) {
      this.dbService.menbottomwearSubject.next([]);
      this.menbottomwearSub.unsubscribe();
    }
  }
}
