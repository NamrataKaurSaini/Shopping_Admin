
import { Component, OnDestroy, OnInit, TemplateRef } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { DbService } from "src/app/services/db.service";
import { Subscription } from "rxjs";
import { AngularFirestore, AngularFirestoreDocument } from "@angular/fire/firestore";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DeleteDialogComponent } from "src/app/entryComponents/delete-dialog/delete-dialog.component";
import { CONTACT_COLLECTION, MENTOPWEAR_COLLECTION} from "src/app/utils";
import { ViewDetailsDialogComponent } from "src/app/entryComponents/view-details-dialog/view-details-dialog.component";
import { ActivatedRoute } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import firebase from "firebase/app";
import { AngularFireStorage } from "@angular/fire/storage";
import { ModalDismissReasons, NgbDatepickerModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Contactus } from "src/app/classes/contactus";
import { filter } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import { mentopwear } from "src/app/classes/mentopwear";



@Component({
  selector: 'app-men-topwear',
  templateUrl: './men-topwear.component.html',
  styleUrls: ['./men-topwear.component.scss']
})
export class MenTopwearComponent implements OnInit, OnDestroy {
  mentopwearId: string;
  mentopwearList: mentopwear[]= [];
  mentopwearSub: Subscription;

  mentopwearForm: FormGroup;
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
      this.mentopwearId = value.mentopwearId ?? null;
      this.getData(value.mentopwearId ?? null);
    })
  }

  getData(mentopwearId: string | null = null) {
    if (mentopwearId === null) {
      this.isBranch = false;
      this.dbService.getMentopwear() ;
      this.mentopwearSub = this.dbService.mentopwearSubject.subscribe((list) => {
        if (list != null) {
          this.mentopwearList = list;
        }
      });
    } else {
      this.isBranch = true;
      this.dbService.contactSubject.subscribe((data) => {
        if(data !== null) {    
          this.branchModel = data.find(x => x.contactId === mentopwearId);
        }
      });
      this.dbRef.collection(CONTACT_COLLECTION).doc(this.mentopwearId)
        .collection(MENTOPWEAR_COLLECTION)
        .valueChanges()
        .subscribe((list) => {
          this.mentopwearList = list.map(e => e as mentopwear)
        })
    }
  }

  openMentopwearDialog(modalRef: TemplateRef<any>, mentopwearObj: mentopwear | null = null) {
    this.modalService.open(modalRef);
    this.initialForm(mentopwearObj)
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

  initialForm(mentopwearModel: mentopwear | null = null) {
    this.tempFile = null;
    if (mentopwearModel === null) {
      this.updateMode = false;
      this.mentopwearForm = this.fb.group({
        title: ["", Validators.required],
        description: ["", Validators.required],
        price:["",Validators.required],
        imageUrl: [""],
        mentopwearId: [this.dbRef.createId()],
        mentopwearStatus: [true],
        addedOn: [firebase.firestore.Timestamp.now()],
      });
    } else {
      this.updateMode = true;
      this.addminImage = false;
      this.mentopwearForm = this.fb.group({
        title: [mentopwearModel.title, Validators.required],
        description: [mentopwearModel.description, Validators.required],
        price:[mentopwearModel.price, Validators.required],
        imageUrl: [mentopwearModel.imageUrl],
        mentopwearId: [mentopwearModel.mentopwearId],
        mentopwearStatus: [mentopwearModel.mentopwearStatus],
      })
    }
  }

  async uploadImage(form: FormGroup): Promise<void> {
    this.loader = true;
    let mentopwearObj: mentopwear = { ...form.value };
    if(this.tempFile !== null) {
      const file = this.tempFile;
      const FilePath = `images${this.mentopwearId !== null ? "/" +this.mentopwearId :"" }/${mentopwearObj.mentopwearId}_${String(this.tempFile.name).toLowerCase().replace(/ /g, "_")}`;
      const FileRef = this.stgRef.ref(FilePath);
      await this.stgRef.upload(FilePath, file);
      mentopwearObj.imageUrl = await FileRef.getDownloadURL().toPromise();
    }

    let docRef: AngularFirestoreDocument<unknown> = null;
    if(this.mentopwearId === null) {
      docRef = this.dbRef.collection(MENTOPWEAR_COLLECTION).doc(mentopwearObj.mentopwearId);
    } else {
      docRef = this.dbRef.collection(CONTACT_COLLECTION).doc(this.mentopwearId)
      .collection(MENTOPWEAR_COLLECTION).doc(mentopwearObj.mentopwearId);
    }

    docRef.set({
      ...mentopwearObj
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
        this.dbRef.collection(MENTOPWEAR_COLLECTION).doc(docId)
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
    this.dbService.mentopwearRetrieved = false;
    if(this.mentopwearSub !== undefined) {
      this.dbService.mentopwearSubject.next([]);
      this.mentopwearSub.unsubscribe();
    }
  }
}
