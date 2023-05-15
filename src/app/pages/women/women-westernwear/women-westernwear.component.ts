
import { Component, OnDestroy, OnInit, TemplateRef } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { DbService } from "src/app/services/db.service";
import { Subscription } from "rxjs";
import { AngularFirestore, AngularFirestoreDocument } from "@angular/fire/firestore";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DeleteDialogComponent } from "src/app/entryComponents/delete-dialog/delete-dialog.component";
import { CONTACT_COLLECTION, WOMENWESTERNWEAR_COLLECTION} from "src/app/utils";
import { ViewDetailsDialogComponent } from "src/app/entryComponents/view-details-dialog/view-details-dialog.component";
import { ActivatedRoute } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import firebase from "firebase/app";
import { AngularFireStorage } from "@angular/fire/storage";
import { ModalDismissReasons, NgbDatepickerModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Contactus } from "src/app/classes/contactus";
import { filter } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import { womenwesternwear } from "src/app/classes/womenwesternwear";



@Component({
  selector: 'app-women-westernwear',
  templateUrl: './women-westernwear.component.html',
  styleUrls: ['./women-westernwear.component.scss']
})
export class WomenWesternwearComponent implements OnInit, OnDestroy {
  womenwesternwearId: string;
  womenwesternwearList: womenwesternwear[]= [];
  womenwesternwearSub: Subscription;

  womenwesternwearForm: FormGroup;
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
      this.womenwesternwearId = value.womenwesternwearId ?? null;
      this.getData(value.womenwesternwearId ?? null);
    })
  }

  getData(womenwesternwearId: string | null = null) {
    if (womenwesternwearId === null) {
      this.isBranch = false;
      this.dbService.getWomenwesternwear() ;
      this.womenwesternwearSub = this.dbService.womenwesternwearSubject.subscribe((list) => {
        if (list != null) {
          this.womenwesternwearList = list;
        }
      });
    } else {
      this.isBranch = true;
      this.dbService.contactSubject.subscribe((data) => {
        if(data !== null) {    
          this.branchModel = data.find(x => x.contactId === womenwesternwearId);
        }
      });
      this.dbRef.collection(CONTACT_COLLECTION).doc(this.womenwesternwearId)
        .collection(WOMENWESTERNWEAR_COLLECTION)
        .valueChanges()
        .subscribe((list) => {
          this.womenwesternwearList = list.map(e => e as womenwesternwear)
        })
    }
  }

  openWomenwesternwearDialog(modalRef: TemplateRef<any>, womenwesternwearObj: womenwesternwear | null = null) {
    this.modalService.open(modalRef);
    this.initialForm(womenwesternwearObj)
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

  initialForm(womenwesternwearModel: womenwesternwear | null = null) {
    this.tempFile = null;
    if (womenwesternwearModel === null) {
      this.updateMode = false;
      this.womenwesternwearForm = this.fb.group({
        title: ["", Validators.required],
        description: ["", Validators.required],
        price:["",Validators.required],
        imageUrl: [""],
        womenwesternwearId: [this.dbRef.createId()],
        womenwesternwearStatus: [true],
        addedOn: [firebase.firestore.Timestamp.now()],
      });
    } else {
      this.updateMode = true;
      this.addminImage = false;
      this.womenwesternwearForm = this.fb.group({
        title: [womenwesternwearModel.title, Validators.required],
        description: [womenwesternwearModel.description, Validators.required],
        price:[womenwesternwearModel.price, Validators.required],
        imageUrl: [womenwesternwearModel.imageUrl],
        womenwesternwearId: [womenwesternwearModel.womenwesternwearId],
        womenwesternwearStatus: [womenwesternwearModel.womenwesternwearStatus],
      })
    }
  }

  async uploadImage(form: FormGroup): Promise<void> {
    this.loader = true;
    let womenwesternwearObj: womenwesternwear = { ...form.value };
    if(this.tempFile !== null) {
      const file = this.tempFile;
      const FilePath = `images${this.womenwesternwearId !== null ? "/" +this.womenwesternwearId :"" }/${womenwesternwearObj.womenwesternwearId}_${String(this.tempFile.name).toLowerCase().replace(/ /g, "_")}`;
      const FileRef = this.stgRef.ref(FilePath);
      await this.stgRef.upload(FilePath, file);
      womenwesternwearObj.imageUrl = await FileRef.getDownloadURL().toPromise();
    }

    let docRef: AngularFirestoreDocument<unknown> = null;
    if(this.womenwesternwearId === null) {
      docRef = this.dbRef.collection(WOMENWESTERNWEAR_COLLECTION).doc(womenwesternwearObj.womenwesternwearId);
    } else {
      docRef = this.dbRef.collection(CONTACT_COLLECTION).doc(this.womenwesternwearId)
      .collection(WOMENWESTERNWEAR_COLLECTION).doc(womenwesternwearObj.womenwesternwearId);
    }

    docRef.set({
      ...womenwesternwearObj
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
        this.dbRef.collection(WOMENWESTERNWEAR_COLLECTION).doc(docId)
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
    this.dbService.womenwesternwearRetrieved = false;
    if(this.womenwesternwearSub !== undefined) {
      this.dbService.womenwesternwearSubject.next([]);
      this.womenwesternwearSub.unsubscribe();
    }
  }
}
