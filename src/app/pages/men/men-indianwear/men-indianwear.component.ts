
import { Component, OnDestroy, OnInit, TemplateRef } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { DbService } from "src/app/services/db.service";
import { Subscription } from "rxjs";
import { AngularFirestore, AngularFirestoreDocument } from "@angular/fire/firestore";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DeleteDialogComponent } from "src/app/entryComponents/delete-dialog/delete-dialog.component";
import { CONTACT_COLLECTION, MENINDIANWEAR_COLLECTION} from "src/app/utils";
import { ViewDetailsDialogComponent } from "src/app/entryComponents/view-details-dialog/view-details-dialog.component";
import { ActivatedRoute } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import firebase from "firebase/app";
import { AngularFireStorage } from "@angular/fire/storage";
import { ModalDismissReasons, NgbDatepickerModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Contactus } from "src/app/classes/contactus";
import { filter } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import { menindianwear } from "src/app/classes/menindianwear";



@Component({
  selector: 'app-men-indianwear',
  templateUrl: './men-indianwear.component.html',
  styleUrls: ['./men-indianwear.component.scss']
})
export class MenIndianwearComponent implements OnInit, OnDestroy {

  menindianwearId: string;
  menindianwearList: menindianwear[]= [];
  menindianwearSub: Subscription;

  menindianwearForm: FormGroup;
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
      this.menindianwearId = value.menindianwearId ?? null;
      this.getData(value.menindianwearId ?? null);
    })
  }

  getData(menindianwearId: string | null = null) {
    if (menindianwearId === null) {
      this.isBranch = false;
      this.dbService.getMenindianwear() ;
      this.menindianwearSub = this.dbService.menindianwearSubject.subscribe((list) => {
        if (list != null) {
          this.menindianwearList = list;
        }
      });
    } else {
      this.isBranch = true;
      this.dbService.contactSubject.subscribe((data) => {
        if(data !== null) {    
          this.branchModel = data.find(x => x.contactId === menindianwearId);
        }
      });
      this.dbRef.collection(CONTACT_COLLECTION).doc(this.menindianwearId)
        .collection(MENINDIANWEAR_COLLECTION)
        .valueChanges()
        .subscribe((list) => {
          this.menindianwearList = list.map(e => e as menindianwear)
        })
    }
  }

  openMenindianwearDialog(modalRef: TemplateRef<any>, menindianwearObj: menindianwear | null = null) {
    this.modalService.open(modalRef);
    this.initialForm(menindianwearObj)
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

  initialForm(menindianwearModel: menindianwear | null = null) {
    this.tempFile = null;
    if (menindianwearModel === null) {
      this.updateMode = false;
      this.menindianwearForm = this.fb.group({
        title: ["", Validators.required],
        description: ["", Validators.required],
        price:["",Validators.required],
        imageUrl: [""],
        menindianwearId: [this.dbRef.createId()],
        menindianwearStatus: [true],
        addedOn: [firebase.firestore.Timestamp.now()],
      });
    } else {
      this.updateMode = true;
      this.addminImage = false;
      this.menindianwearForm = this.fb.group({
        title: [menindianwearModel.title, Validators.required],
        description: [menindianwearModel.description, Validators.required],
        price:[menindianwearModel.price,  Validators.required],
        imageUrl: [menindianwearModel.imageUrl],
        menindianwearId: [menindianwearModel.menindianwearId],
        menindianwearStatus: [menindianwearModel.menindianwearStatus],
      })
    }
  }

  async uploadImage(form: FormGroup): Promise<void> {
    this.loader = true;
    let menindianwearObj: menindianwear = { ...form.value };
    if(this.tempFile !== null) {
      const file = this.tempFile;
      const FilePath = `images${this.menindianwearId !== null ? "/" +this.menindianwearId :"" }/${menindianwearObj.menindianwearId}_${String(this.tempFile.name).toLowerCase().replace(/ /g, "_")}`;
      const FileRef = this.stgRef.ref(FilePath);
      await this.stgRef.upload(FilePath, file);
      menindianwearObj.imageUrl = await FileRef.getDownloadURL().toPromise();
    }

    let docRef: AngularFirestoreDocument<unknown> = null;
    if(this.menindianwearId === null) {
      docRef = this.dbRef.collection(MENINDIANWEAR_COLLECTION).doc(menindianwearObj.menindianwearId);
    } else {
      docRef = this.dbRef.collection(CONTACT_COLLECTION).doc(this.menindianwearId)
      .collection(MENINDIANWEAR_COLLECTION).doc(menindianwearObj.menindianwearId);
    }

    docRef.set({
      ...menindianwearObj
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
        this.dbRef.collection(MENINDIANWEAR_COLLECTION).doc(docId)
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
    this.dbService.menindianwearRetrieved = false;
    if(this.menindianwearSub !== undefined) {
      this.dbService.menindianwearSubject.next([]);
      this.menindianwearSub.unsubscribe();
    }
  }
}
