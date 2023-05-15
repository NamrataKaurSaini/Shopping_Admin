
import { Component, OnDestroy, OnInit, TemplateRef } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { DbService } from "src/app/services/db.service";
import { Subscription } from "rxjs";
import { AngularFirestore, AngularFirestoreDocument } from "@angular/fire/firestore";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DeleteDialogComponent } from "src/app/entryComponents/delete-dialog/delete-dialog.component";
import { CONTACT_COLLECTION, MENACCESSORIZE_COLLECTION} from "src/app/utils";
import { ViewDetailsDialogComponent } from "src/app/entryComponents/view-details-dialog/view-details-dialog.component";
import { ActivatedRoute } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import firebase from "firebase/app";
import { AngularFireStorage } from "@angular/fire/storage";
import { ModalDismissReasons, NgbDatepickerModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Contactus } from "src/app/classes/contactus";
import { filter } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import { menaccessorize } from "src/app/classes/menaccessorize";



@Component({
  selector: 'app-men-accessorize',
  templateUrl: './men-accessorize.component.html',
  styleUrls: ['./men-accessorize.component.scss']
})
export class MenAccessorizeComponent  implements OnInit, OnDestroy {
  menaccessorizeId: string;
  menaccessorizeList: menaccessorize[]= [];
  menaccessorizeSub: Subscription;

  menaccessorizeForm: FormGroup;
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
      this.menaccessorizeId = value.menaccessorizeId ?? null;
      this.getData(value.menaccessorizeId ?? null);
    })
  }

  getData(menaccessorizeId: string | null = null) {
    if (menaccessorizeId === null) {
      this.isBranch = false;
      this.dbService.getMenaccessorize() ;
      this.menaccessorizeSub = this.dbService.menaccessorizeSubject.subscribe((list) => {
        if (list != null) {
          this.menaccessorizeList = list;
        }
      });
    } else {
      this.isBranch = true;
      this.dbService.contactSubject.subscribe((data) => {
        if(data !== null) {    
          this.branchModel = data.find(x => x.contactId === menaccessorizeId);
        }
      });
      this.dbRef.collection(CONTACT_COLLECTION).doc(this.menaccessorizeId)
        .collection(MENACCESSORIZE_COLLECTION)
        .valueChanges()
        .subscribe((list) => {
          this.menaccessorizeList = list.map(e => e as menaccessorize)
        })
    }
  }

  openMenaccessorizeDialog(modalRef: TemplateRef<any>, menaccessorizeObj: menaccessorize | null = null) {
    this.modalService.open(modalRef);
    this.initialForm(menaccessorizeObj)
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

  initialForm(menaccessorizeModel: menaccessorize | null = null) {
    this.tempFile = null;
    if (menaccessorizeModel === null) {
      this.updateMode = false;
      this.menaccessorizeForm = this.fb.group({
        title: ["", Validators.required],
        description: ["", Validators.required],
        price:["",Validators.required],
        imageUrl: [""],
        menaccessorizeId: [this.dbRef.createId()],
        menaccessorizeStatus: [true],
        addedOn: [firebase.firestore.Timestamp.now()],
      });
    } else {
      this.updateMode = true;
      this.addminImage = false;
      this.menaccessorizeForm = this.fb.group({
        title: [menaccessorizeModel.title, Validators.required],
        description: [menaccessorizeModel.description, Validators.required],
        price:[menaccessorizeModel.price, Validators.required],
        imageUrl: [menaccessorizeModel.imageUrl],
        menaccessorizeId: [menaccessorizeModel.menaccessorizeId],
        menaccessorizeStatus: [menaccessorizeModel.menaccessorizeStatus],
      })
    }
  }

  async uploadImage(form: FormGroup): Promise<void> {
    this.loader = true;
    let menaccessorizeObj: menaccessorize = { ...form.value };
    if(this.tempFile !== null) {
      const file = this.tempFile;
      const FilePath = `images${this.menaccessorizeId !== null ? "/" +this.menaccessorizeId :"" }/${menaccessorizeObj.menaccessorizeId}_${String(this.tempFile.name).toLowerCase().replace(/ /g, "_")}`;
      const FileRef = this.stgRef.ref(FilePath);
      await this.stgRef.upload(FilePath, file);
      menaccessorizeObj.imageUrl = await FileRef.getDownloadURL().toPromise();
    }

    let docRef: AngularFirestoreDocument<unknown> = null;
    if(this.menaccessorizeId === null) {
      docRef = this.dbRef.collection(MENACCESSORIZE_COLLECTION).doc(menaccessorizeObj.menaccessorizeId);
    } else {
      docRef = this.dbRef.collection(CONTACT_COLLECTION).doc(this.menaccessorizeId)
      .collection(MENACCESSORIZE_COLLECTION).doc(menaccessorizeObj.menaccessorizeId);
    }

    docRef.set({
      ...menaccessorizeObj
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
        this.dbRef.collection(MENACCESSORIZE_COLLECTION).doc(docId)
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
    this.dbService.menaccessorizeRetrieved = false;
    if(this.menaccessorizeSub !== undefined) {
      this.dbService.menaccessorizeSubject.next([]);
      this.menaccessorizeSub.unsubscribe();
    }
  }
}
