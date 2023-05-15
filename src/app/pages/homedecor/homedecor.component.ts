
import { Component, OnDestroy, OnInit, TemplateRef } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { DbService } from "src/app/services/db.service";
import { Subscription } from "rxjs";
import { AngularFirestore, AngularFirestoreDocument } from "@angular/fire/firestore";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DeleteDialogComponent } from "src/app/entryComponents/delete-dialog/delete-dialog.component";
import { CONTACT_COLLECTION, HOMEDECOR_COLLECTION} from "src/app/utils";
import { ViewDetailsDialogComponent } from "src/app/entryComponents/view-details-dialog/view-details-dialog.component";
import { ActivatedRoute } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import firebase from "firebase/app";
import { AngularFireStorage } from "@angular/fire/storage";
import { ModalDismissReasons, NgbDatepickerModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Contactus } from "src/app/classes/contactus";
import { filter } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import { homedecor } from "src/app/classes/homedecor";



@Component({
  selector: 'app-homedecor',
  templateUrl: './homedecor.component.html',
  styleUrls: ['./homedecor.component.scss']
})
export class HomedecorComponent implements OnInit, OnDestroy {
  homedecorId: string;
  homedecorList: homedecor[]= [];
  homedecorSub: Subscription;

  homedecorForm: FormGroup;
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
      this.homedecorId = value.homedecorId ?? null;
      this.getData(value.homedecorId ?? null);
    })
  }

  getData(homedecorId: string | null = null) {
    if (homedecorId === null) {
      this.isBranch = false;
      this.dbService.getHomedecor() ;
      this.homedecorSub = this.dbService.homedecorSubject.subscribe((list) => {
        if (list != null) {
          this.homedecorList = list;
        }
      });
    } else {
      this.isBranch = true;
      this.dbService.contactSubject.subscribe((data) => {
        if(data !== null) {    
          this.branchModel = data.find(x => x.contactId === homedecorId);
        }
      });
      this.dbRef.collection(CONTACT_COLLECTION).doc(this.homedecorId)
        .collection(  HOMEDECOR_COLLECTION)
        .valueChanges()
        .subscribe((list) => {
          this.homedecorList = list.map(e => e as homedecor)
        })
    }
  }

  openHomedecorDialog(modalRef: TemplateRef<any>, homedecorObj: homedecor | null = null) {
    this.modalService.open(modalRef);
    this.initialForm(homedecorObj)
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

  initialForm(homedecorModel: homedecor | null = null) {
    this.tempFile = null;
    if (homedecorModel === null) {
      this.updateMode = false;
      this.homedecorForm = this.fb.group({
        title: ["", Validators.required],
        description: ["", Validators.required],
        price:["",Validators.required],
        imageUrl: [""],
        homedecorId: [this.dbRef.createId()],
        homedecorStatus: [true],
        addedOn: [firebase.firestore.Timestamp.now()],
      });
    } else {
      this.updateMode = true;
      this.addminImage = false;
      this.homedecorForm = this.fb.group({
        title: [homedecorModel.title, Validators.required],
        description: [homedecorModel.description, Validators.required],
        price:[homedecorModel.price, Validators.required],
        imageUrl: [homedecorModel.imageUrl],
        homedecorId: [homedecorModel.homedecorId],
        homedecorStatus: [homedecorModel.homedecorStatus],
      })
    }
  }

  async uploadImage(form: FormGroup): Promise<void> {
    this.loader = true;
    let homedecorObj: homedecor = { ...form.value };
    if(this.tempFile !== null) {
      const file = this.tempFile;
      const FilePath = `images${this.homedecorId !== null ? "/" +this.homedecorId :"" }/${homedecorObj.homedecorId}_${String(this.tempFile.name).toLowerCase().replace(/ /g, "_")}`;
      const FileRef = this.stgRef.ref(FilePath);
      await this.stgRef.upload(FilePath, file);
      homedecorObj.imageUrl = await FileRef.getDownloadURL().toPromise();
    }

    let docRef: AngularFirestoreDocument<unknown> = null;
    if(this.homedecorId === null) {
      docRef = this.dbRef.collection(  HOMEDECOR_COLLECTION).doc(homedecorObj.homedecorId);
    } else {
      docRef = this.dbRef.collection(CONTACT_COLLECTION).doc(this.homedecorId)
      .collection(  HOMEDECOR_COLLECTION).doc(homedecorObj.homedecorId);
    }

    docRef.set({
      ...homedecorObj
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
        this.dbRef.collection(  HOMEDECOR_COLLECTION).doc(docId)
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
        title: "homedecor Image",
        obj: prodObj,
      },
      panelClass: ["col-12", "col-sm-4"],
    });
  }

  openLink(url) {
    window.open(url, "_blank");
  }



  ngOnDestroy() {
    this.dbService.homedecorRetrieved = false;
    if(this.homedecorSub !== undefined) {
      this.dbService.homedecorSubject.next([]);
      this.homedecorSub.unsubscribe();
    }
  }
}
