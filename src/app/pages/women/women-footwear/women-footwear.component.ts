
import { Component, OnDestroy, OnInit, TemplateRef } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { DbService } from "src/app/services/db.service";
import { Subscription } from "rxjs";
import { AngularFirestore, AngularFirestoreDocument } from "@angular/fire/firestore";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DeleteDialogComponent } from "src/app/entryComponents/delete-dialog/delete-dialog.component";
import { CONTACT_COLLECTION, WOMENFOOTWEAR_COLLECTION} from "src/app/utils";
import { ViewDetailsDialogComponent } from "src/app/entryComponents/view-details-dialog/view-details-dialog.component";
import { ActivatedRoute } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import firebase from "firebase/app";
import { AngularFireStorage } from "@angular/fire/storage";
import { ModalDismissReasons, NgbDatepickerModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Contactus } from "src/app/classes/contactus";
import { filter } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import { womenfootwear } from "src/app/classes/womenfootwear";



@Component({
  selector: 'app-women-footwear',
  templateUrl: './women-footwear.component.html',
  styleUrls: ['./women-footwear.component.scss']
})
export class WomenFootwearComponent implements OnInit, OnDestroy {
  womenfootwearId: string;
  womenfootwearList: womenfootwear[]= [];
  womenfootwearSub: Subscription;

  womenfootwearForm: FormGroup;
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
      this.womenfootwearId = value.womenfootwearId ?? null;
      this.getData(value.womenfootwearId ?? null);
    })
  }

  getData(womenfootwearId: string | null = null) {
    if (womenfootwearId === null) {
      this.isBranch = false;
      this.dbService.getWomenfootwear() ;
      this.womenfootwearSub = this.dbService.womenfootwearSubject.subscribe((list) => {
        if (list != null) {
          this.womenfootwearList = list;
        }
      });
    } else {
      this.isBranch = true;
      this.dbService.contactSubject.subscribe((data) => {
        if(data !== null) {    
          this.branchModel = data.find(x => x.contactId === womenfootwearId);
        }
      });
      this.dbRef.collection(CONTACT_COLLECTION).doc(this.womenfootwearId)
        .collection( WOMENFOOTWEAR_COLLECTION)
        .valueChanges()
        .subscribe((list) => {
          this.womenfootwearList = list.map(e => e as womenfootwear)
        })
    }
  }

  openWomenfootwearDialog(modalRef: TemplateRef<any>, womenfootwearObj: womenfootwear | null = null) {
    this.modalService.open(modalRef);
    this.initialForm(womenfootwearObj)
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

  initialForm(womenfootwearModel: womenfootwear | null = null) {
    this.tempFile = null;
    if (womenfootwearModel === null) {
      this.updateMode = false;
      this.womenfootwearForm = this.fb.group({
        title: ["", Validators.required],
        description: ["", Validators.required],
        price:["",Validators.required],
        imageUrl: [""],
        womenfootwearId: [this.dbRef.createId()],
        womenfootwearStatus: [true],
        addedOn: [firebase.firestore.Timestamp.now()],
      });
    } else {
      this.updateMode = true;
      this.addminImage = false;
      this.womenfootwearForm = this.fb.group({
        title: [womenfootwearModel.title, Validators.required],
        description: [womenfootwearModel.description, Validators.required],
        price:[womenfootwearModel.price, Validators.required],
        imageUrl: [womenfootwearModel.imageUrl],
        womenfootwearId: [womenfootwearModel.womenfootwearId],
        womenfootwearStatus: [womenfootwearModel.womenfootwearStatus],
      })
    }
  }

  async uploadImage(form: FormGroup): Promise<void> {
    this.loader = true;
    let womenfootwearObj: womenfootwear = { ...form.value };
    if(this.tempFile !== null) {
      const file = this.tempFile;
      const FilePath = `images${this.womenfootwearId !== null ? "/" +this.womenfootwearId :"" }/${womenfootwearObj.womenfootwearId}_${String(this.tempFile.name).toLowerCase().replace(/ /g, "_")}`;
      const FileRef = this.stgRef.ref(FilePath);
      await this.stgRef.upload(FilePath, file);
      womenfootwearObj.imageUrl = await FileRef.getDownloadURL().toPromise();
    }

    let docRef: AngularFirestoreDocument<unknown> = null;
    if(this.womenfootwearId === null) {
      docRef = this.dbRef.collection( WOMENFOOTWEAR_COLLECTION).doc(womenfootwearObj.womenfootwearId);
    } else {
      docRef = this.dbRef.collection(CONTACT_COLLECTION).doc(this.womenfootwearId)
      .collection( WOMENFOOTWEAR_COLLECTION).doc(womenfootwearObj.womenfootwearId);
    }

    docRef.set({
      ...womenfootwearObj
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
        this.dbRef.collection( WOMENFOOTWEAR_COLLECTION).doc(docId)
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
    this.dbService.womenfootwearRetrieved = false;
    if(this.womenfootwearSub !== undefined) {
      this.dbService.womenfootwearSubject.next([]);
      this.womenfootwearSub.unsubscribe();
    }
  }
}
