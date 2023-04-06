import { Component, OnDestroy, OnInit, TemplateRef } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Slider } from "src/app/classes/slider";
import { DbService } from "src/app/services/db.service";
import { Subscription } from "rxjs";
import { AngularFirestore, AngularFirestoreDocument } from "@angular/fire/firestore";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DeleteDialogComponent } from "src/app/entryComponents/delete-dialog/delete-dialog.component";
import { CONTACT_COLLECTION, SLIDER_COLLECTION } from "src/app/utils";
import { ViewDetailsDialogComponent } from "src/app/entryComponents/view-details-dialog/view-details-dialog.component";
import { ActivatedRoute } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import firebase from "firebase/app";
import { AngularFireStorage } from "@angular/fire/storage";
import { ModalDismissReasons, NgbDatepickerModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Contactus } from "src/app/classes/contactus";
import { filter } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";


@Component({
  selector: "app-sliders",
  templateUrl: "./sliders.component.html",
  styleUrls: ["./sliders.component.scss"],
})
export class SlidersComponent implements OnInit, OnDestroy {
  sliderImageList: Slider[] = [];
  sliderImageSub: Subscription;
  imageId: string;

  sliderForm: FormGroup;
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
      this.imageId = value.imageId ?? null;
      this.getData(value.imageId ?? null);
    })
  }

  getData(imageId: string | null = null) {
    if (imageId === null) {
      this.isBranch = false;
      this.dbService.getSliderImages();
      this.sliderImageSub = this.dbService.sliderSubject.subscribe((list) => {
        if (list != null) {
          this.sliderImageList = list;
        }
      });
    } else {
      this.isBranch = true;
      this.dbService.contactSubject.subscribe((data) => {
        if(data !== null) {    
          this.branchModel = data.find(x => x.contactId === imageId);
        }
      });
      this.dbRef.collection(CONTACT_COLLECTION).doc(this.imageId)
        .collection(SLIDER_COLLECTION)
        .valueChanges()
        .subscribe((list) => {
          this.sliderImageList = list.map(e => e as Slider)
        })
    }
  }

  openSliderDialog(modalRef: TemplateRef<any>, sliderObj: Slider | null = null) {
    this.modalService.open(modalRef);
    this.initialForm(sliderObj)
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

  initialForm(sliderModel: Slider | null = null) {
    this.tempFile = null;
    if (sliderModel === null) {
      this.updateMode = false;
      this.sliderForm = this.fb.group({
        title: ["", Validators.required],
        description: ["", Validators.required],
        imageUrl: [""],
        imageId: [this.dbRef.createId()],
        sliderStatus: [true],
        addedOn: [firebase.firestore.Timestamp.now()],
      });
    } else {
      this.updateMode = true;
      this.addminImage = false;
      this.sliderForm = this.fb.group({
        title: [sliderModel.title, Validators.required],
        description: [sliderModel.description, Validators.required],
        imageUrl: [sliderModel.imageUrl],
        imageId: [sliderModel.imageId],
        sliderStatus: [sliderModel.sliderStatus],
      })
    }
  }

  async uploadImage(form: FormGroup): Promise<void> {
    this.loader = true;
    let sliderObj: Slider = { ...form.value };
    if(this.tempFile !== null) {
      const file = this.tempFile;
      const FilePath = `images${this.imageId !== null ? "/" +this.imageId :"" }/${sliderObj.imageId}_${String(this.tempFile.name).toLowerCase().replace(/ /g, "_")}`;
      const FileRef = this.stgRef.ref(FilePath);
      await this.stgRef.upload(FilePath, file);
      sliderObj.imageUrl = await FileRef.getDownloadURL().toPromise();
    }

    let docRef: AngularFirestoreDocument<unknown> = null;
    if(this.imageId === null) {
      docRef = this.dbRef.collection(SLIDER_COLLECTION).doc(sliderObj.imageId);
    } else {
      docRef = this.dbRef.collection(CONTACT_COLLECTION).doc(this.imageId)
      .collection(SLIDER_COLLECTION).doc(sliderObj.imageId);
    }

    docRef.set({
      ...sliderObj
    }, { merge: true })
      .then(() => {
        this.loader = false;
        this.modalService.dismissAll();
        this.snackbar.open("Image Added/Updated Successfully", "", {
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
      message: 'Slider image'
    };

    modalRef.result.then(async (value) => {
      if(value === 1) {
        await this.stgRef.refFromURL(url).delete();
        this.dbRef.collection(SLIDER_COLLECTION).doc(docId)
          .delete()
          .then(
            () => {
              this.snackbar.open("Slider image Deleted Successfully", "", {
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
    this.dbService.sliderRetrieved = false;
    if(this.sliderImageSub !== undefined) {
      this.dbService.sliderSubject.next([]);
      this.sliderImageSub.unsubscribe();
    }
  }
}
