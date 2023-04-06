import { Component, OnDestroy, OnInit, TemplateRef } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Review } from "src/app/classes/review";
import { DbService } from "src/app/services/db.service";
import { Subscription } from "rxjs";
import { AngularFirestore, AngularFirestoreDocument } from "@angular/fire/firestore";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DeleteDialogComponent } from "src/app/entryComponents/delete-dialog/delete-dialog.component";
import { CONTACT_COLLECTION, REVIEW_COLLECTION } from "src/app/utils";
import { ViewDetailsDialogComponent } from "src/app/entryComponents/view-details-dialog/view-details-dialog.component";
import { ActivatedRoute } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import firebase from "firebase/app";
import { AngularFireStorage } from "@angular/fire/storage";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Contactus } from "src/app/classes/contactus";
import { filter } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent implements OnInit {
  reviewList: Review[] = [];
  reviewSub: Subscription;
  reviewId: string;

  reviewForm: FormGroup;
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
      this.reviewId = value.reviewId ?? null;
      this.getData(value.reviewId ?? null);
    })
  }

  getData(reviewId: string | null = null) {
    if (reviewId === null) {
      this.isBranch = false;
      this.dbService. getReviews();
      this.reviewSub = this.dbService.reviewSubject.subscribe((list) => {
        if (list != null) {
          this.reviewList = list;
        }
      });
    } else {
      this.isBranch = true;
      this.dbService.contactSubject.subscribe((data) => {
        if(data !== null) {    
          this.branchModel = data.find(x => x.contactId === reviewId);
        }
      });
      this.dbRef.collection(CONTACT_COLLECTION).doc(this.reviewId)
        .collection(REVIEW_COLLECTION)
        .valueChanges()
        .subscribe((list) => {
          this.reviewList = list.map(e => e as Review)
        })
    }
  }

  openReviewDialog(modalRef: TemplateRef<any>, reviewObj: Review | null = null) {
    this.modalService.open(modalRef);
    this.initialForm(reviewObj)
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

  initialForm(reviewModel: Review | null = null) {
    this.tempFile = null;
    if (reviewModel === null) {
      this.updateMode = false;
      this.reviewForm = this.fb.group({
        title: ["", Validators.required],
        description: ["", Validators.required],
        imageUrl: [""],
        reviewId: [this.dbRef.createId()],
        reviewStatus: [true],
        addedOn: [firebase.firestore.Timestamp.now()],
      });
    } else {
      this.updateMode = true;
      this.addminImage = false;
      this.reviewForm = this.fb.group({
        title: [reviewModel.title, Validators.required],
        description: [reviewModel.description, Validators.required],
        imageUrl: [reviewModel.imageUrl],
        reviewId: [reviewModel.reviewId],
        reviewStatus: [reviewModel.reviewStatus],
      })
    }
  }

  async uploadImage(form: FormGroup): Promise<void> {
    this.loader = true;
    let reviewObj: Review = { ...form.value };
    if(this.tempFile !== null) {
      const file = this.tempFile;
      const FilePath = `images${this.reviewId !== null ? "/" +this.reviewId :"" }/${reviewObj.reviewId}_${String(this.tempFile.name).toLowerCase().replace(/ /g, "_")}`;
      const FileRef = this.stgRef.ref(FilePath);
      await this.stgRef.upload(FilePath, file);
      reviewObj.imageUrl = await FileRef.getDownloadURL().toPromise();
    }

    let docRef: AngularFirestoreDocument<unknown> = null;
    if(this.reviewId === null) {
      docRef = this.dbRef.collection(REVIEW_COLLECTION).doc(reviewObj.reviewId);
    } else {
      docRef = this.dbRef.collection(CONTACT_COLLECTION).doc(this.reviewId)
      .collection(REVIEW_COLLECTION).doc(reviewObj.reviewId);
    }

    docRef.set({
      ...reviewObj
    }, { merge: true })
      .then(() => {
        this.loader = false;
        this.modalService.dismissAll();
        this.snackbar.open("Review Added/Updated Successfully", "", {
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
      message: 'Review'
    };

    modalRef.result.then(async (value) => {
      if(value === 1) {
        await this.stgRef.refFromURL(url).delete();
        this.dbRef.collection(REVIEW_COLLECTION).doc(docId)
          .delete()
          .then(
            () => {
              this.snackbar.open("Review Deleted Successfully", "", {
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
        title: "Review",
        obj: prodObj,
      },
      panelClass: ["col-12", "col-sm-4"],
    });
  }

  openLink(url) {
    window.open(url, "_blank");
  }

  ngOnDestroy() {
    this.dbService.reviewRetrieved = false;
    if(this.reviewSub !== undefined) {
      this.dbService.reviewSubject.next([]);
      this.reviewSub.unsubscribe();
    }
  }

}
