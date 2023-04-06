import { Component, OnDestroy, OnInit, TemplateRef } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Videos } from "src/app/classes/videos";
import { DbService } from "src/app/services/db.service";
import { Subscription } from "rxjs";
import { AngularFirestore, AngularFirestoreDocument } from "@angular/fire/firestore";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DeleteDialogComponent } from "src/app/entryComponents/delete-dialog/delete-dialog.component";
import { CONTACT_COLLECTION, VIDEO_COLLECTION } from "src/app/utils";
import { ViewDetailsDialogComponent } from "src/app/entryComponents/view-details-dialog/view-details-dialog.component";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import firebase from "firebase/app";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import { ActivatedRoute } from "@angular/router";
import { Contactus } from "src/app/classes/contactus";

@Component({
  selector: "app-videos",
  templateUrl: "./videos.component.html",
  styleUrls: ["./videos.component.scss"],
})
export class VideosComponent implements OnInit, OnDestroy {
  videoForm: FormGroup;
  videoListSub: Subscription;
  videoList: Videos[] = [];

  videoId: string;
  branchModel: Contactus;
  isBranch: boolean = false;
  loader: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private dbService: DbService,
    private dbRef: AngularFirestore,
    private snackbar: MatSnackBar,
    private modalService: NgbModal,
    private toast: ToastrService,
    private route: ActivatedRoute,
    
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((value) => {
      this.videoId = value.videoId ?? null;
      this.getData(value.videoId ?? null);
    })
  }

  getData(videoId: string | null) {
    if (videoId === null) {
      this.isBranch = false;
      this.dbService.getVideos();
      this.videoListSub = this.dbService.videoSubject.subscribe((list) => {
        if (list != null) {
          this.videoList = list;
        }
      });
    } else {
      this.isBranch = true;
      this.dbService.contactSubject.subscribe((data) => {
        if(data !== null) {    
          this.branchModel = data.find(x => x.contactId === videoId);
        }
      });
      this.dbRef.collection(CONTACT_COLLECTION).doc(this.videoId)
      .collection(VIDEO_COLLECTION)
      .valueChanges()
      .subscribe((list) => {
        this.videoList = list.map(e => e as Videos)
      })
    }
  }

  openVideoDialog(modalRef: TemplateRef<any>, videoObj: Videos | null = null) {
    this.modalService.open(modalRef);
    this.initialForm(videoObj);
  }

  initialForm(videoObj: Videos | null = null) {
    if (videoObj === null) {
      this.videoForm = this.fb.group({
        videoTitle: ["", Validators.required],
        videoDescription: ["", Validators.required],
        videoUrl: ["", Validators.required],
        videoId: [this.dbRef.createId()],
        active: [true],
        addedOn: [firebase.firestore.Timestamp.now()],
      });
    } else {
      this.videoForm = this.fb.group({
        videoTitle: [videoObj.videoTitle, Validators.required],
        videoDescription: [videoObj.videoDescription, Validators.required],
        videoUrl: [videoObj.videoUrl, Validators.required],
        videoId: [videoObj.videoId],
        active: [videoObj.active],
      });
    }
  }

  youtube_parser(videoUrl) {
    var regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = videoUrl.match(regExp);
    return match && match[7].length == 11 ? match[7] : false;
  }

  addVideoToDB(form: FormGroup) {
    this.loader = true;
    let videoObj: Videos = { ...form.value };
    let docRef: AngularFirestoreDocument<unknown> = null;
    if(this.videoId === null) {
      docRef = this.dbRef.collection(VIDEO_COLLECTION).doc(videoObj.videoId);
    } else {
      docRef = this.dbRef.collection(CONTACT_COLLECTION).doc(this.videoId)
      .collection(VIDEO_COLLECTION).doc(videoObj.videoId);
    }
      
    docRef.set({
      ...videoObj
    }, { merge: true })
      .then(
        () => {
          this.loader = false;
          this.modalService.dismissAll()
          this.snackbar.open("Video Added/Updated Successfully", "", {
            duration: 2500,
            panelClass: ["alert", "alert-danger"],
          });
        },
        (error) => {
          console.error(">>> error: ", error);
          this.loader = false;
          this.snackbar.open("Something went wrong", "", {
            duration: 2500,
            panelClass: ["alert", "alert-danger"],
          });        }
      );
  }

    deleteItem(docId) {
    const modalRef = this.modalService.open(DeleteDialogComponent);
    modalRef.componentInstance.data = {
      message: 'Video'
    };

    modalRef.result.then((value) => {
      if(value === 1) {
        this.dbRef.collection(VIDEO_COLLECTION).doc(docId)
          .delete()
          .then(
            () => {
              this.snackbar.open("Video Deleted Successfully", "", {
                duration: 2500,
                panelClass: ["alert", "alert-danger"],
              });
            },
            (error) => {
              console.error(">>> error: ", error);
              this.snackbar.open("Something went wrong", "", {
                duration: 2500,
                panelClass: ["alert", "alert-danger"],
              });            }
          );
      }
    }, (error) => console.log(error))
  }

  viewDetails(videoObj) {
    this.dialog.open(ViewDetailsDialogComponent, {
      data: {
        title: "Video",
        obj: videoObj,
      },
      panelClass: ["col-12", "col-sm-4"],
    });
  }

  openLink(url) {
    window.open(url, "_blank");
  }

  ngOnDestroy() {
    if (this.videoListSub !== undefined) {
      this.videoListSub.unsubscribe();
    }
  }
}
