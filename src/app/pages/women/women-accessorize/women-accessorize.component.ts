
import { Component, OnDestroy, OnInit, TemplateRef } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { DbService } from "src/app/services/db.service";
import { Subscription } from "rxjs";
import { AngularFirestore, AngularFirestoreDocument } from "@angular/fire/firestore";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DeleteDialogComponent } from "src/app/entryComponents/delete-dialog/delete-dialog.component";
import { CONTACT_COLLECTION, WOMENACCESSORIZE_COLLECTION} from "src/app/utils";
import { ViewDetailsDialogComponent } from "src/app/entryComponents/view-details-dialog/view-details-dialog.component";
import { ActivatedRoute } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import firebase from "firebase/app";
import { AngularFireStorage } from "@angular/fire/storage";
import { ModalDismissReasons, NgbDatepickerModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Contactus } from "src/app/classes/contactus";
import { filter } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import { womenaccessorize } from "src/app/classes/womenaccessorize";



@Component({
  selector: 'app-women-accessorize',
  templateUrl: './women-accessorize.component.html',
  styleUrls: ['./women-accessorize.component.scss']
})
export class WomenAccessorizeComponent implements OnInit, OnDestroy {
  womenaccessorizeId: string;
  womenaccessorizeList: womenaccessorize[]= [];
  womenaccessorizeSub: Subscription;

  womenaccessorizeForm: FormGroup;
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
      this.womenaccessorizeId = value.womenaccessorizeId ?? null;
      this.getData(value.womenaccessorizeId ?? null);
    })
  }

  getData(womenaccessorizeId: string | null = null) {
    if (womenaccessorizeId === null) {
      this.isBranch = false;
      this.dbService.getWomenaccessorize() ;
      this.womenaccessorizeSub = this.dbService.womenaccessorizeSubject.subscribe((list) => {
        if (list != null) {
          this.womenaccessorizeList = list;
        }
      });
    } else {
      this.isBranch = true;
      this.dbService.contactSubject.subscribe((data) => {
        if(data !== null) {    
          this.branchModel = data.find(x => x.contactId === womenaccessorizeId);
        }
      });
      this.dbRef.collection(CONTACT_COLLECTION).doc(this.womenaccessorizeId)
        .collection(  WOMENACCESSORIZE_COLLECTION)
        .valueChanges()
        .subscribe((list) => {
          this.womenaccessorizeList = list.map(e => e as womenaccessorize)
        })
    }
  }

  openWomenaccessorizeDialog(modalRef: TemplateRef<any>, womenaccessorizeObj: womenaccessorize | null = null) {
    this.modalService.open(modalRef);
    this.initialForm(womenaccessorizeObj)
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

  initialForm(womenaccessorizeModel: womenaccessorize | null = null) {
    this.tempFile = null;
    if (womenaccessorizeModel === null) {
      this.updateMode = false;
      this.womenaccessorizeForm = this.fb.group({
        title: ["", Validators.required],
        description: ["", Validators.required],
        price:["",Validators.required],
        imageUrl: [""],
        womenaccessorizeId: [this.dbRef.createId()],
        womenaccessorizeStatus: [true],
        addedOn: [firebase.firestore.Timestamp.now()],
      });
    } else {
      this.updateMode = true;
      this.addminImage = false;
      this.womenaccessorizeForm = this.fb.group({
        title: [womenaccessorizeModel.title, Validators.required],
        description: [womenaccessorizeModel.description, Validators.required],
        price:[womenaccessorizeModel.price, Validators.required],
        imageUrl: [womenaccessorizeModel.imageUrl],
        womenaccessorizeId: [womenaccessorizeModel.womenaccessorizeId],
        womenaccessorizeStatus: [womenaccessorizeModel.womenaccessorizeStatus],
      })
    }
  }

  async uploadImage(form: FormGroup): Promise<void> {
    this.loader = true;
    let womenaccessorizeObj: womenaccessorize = { ...form.value };
    if(this.tempFile !== null) {
      const file = this.tempFile;
      const FilePath = `images${this.womenaccessorizeId !== null ? "/" +this.womenaccessorizeId :"" }/${womenaccessorizeObj.womenaccessorizeId}_${String(this.tempFile.name).toLowerCase().replace(/ /g, "_")}`;
      const FileRef = this.stgRef.ref(FilePath);
      await this.stgRef.upload(FilePath, file);
      womenaccessorizeObj.imageUrl = await FileRef.getDownloadURL().toPromise();
    }

    let docRef: AngularFirestoreDocument<unknown> = null;
    if(this.womenaccessorizeId === null) {
      docRef = this.dbRef.collection(  WOMENACCESSORIZE_COLLECTION).doc(womenaccessorizeObj.womenaccessorizeId);
    } else {
      docRef = this.dbRef.collection(CONTACT_COLLECTION).doc(this.womenaccessorizeId)
      .collection(  WOMENACCESSORIZE_COLLECTION).doc(womenaccessorizeObj.womenaccessorizeId);
    }

    docRef.set({
      ...womenaccessorizeObj
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
        this.dbRef.collection(  WOMENACCESSORIZE_COLLECTION).doc(docId)
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
    this.dbService.womenaccessorizeRetrieved = false;
    if(this.womenaccessorizeSub !== undefined) {
      this.dbService.womenaccessorizeSubject.next([]);
      this.womenaccessorizeSub.unsubscribe();
    }
  }
}
