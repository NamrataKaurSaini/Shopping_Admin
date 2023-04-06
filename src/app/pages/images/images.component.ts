import { Component, OnInit, TemplateRef } from '@angular/core';
import { MatDialog } from "@angular/material/dialog";
import { DbService } from "src/app/services/db.service";
import { Subscription } from "rxjs";
import { AngularFirestore, AngularFirestoreDocument } from "@angular/fire/firestore";
import { DeleteDialogComponent } from "src/app/entryComponents/delete-dialog/delete-dialog.component";
import { CONTACT_COLLECTION, GALLERY_COLLECTION } from "src/app/utils";
import { ViewDetailsDialogComponent } from "src/app/entryComponents/view-details-dialog/view-details-dialog.component";
import { ImagesModel } from 'src/app/classes/images';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Contactus } from 'src/app/classes/contactus';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import firebase from 'firebase/app';
import { AngularFireStorage } from '@angular/fire/storage';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-images',
  templateUrl: './images.component.html',
  styleUrls: ['./images.component.scss']
})
export class ImagesComponent {
  galleryImageList: ImagesModel[] = [];
  galleryImageSub: Subscription;

  imageId: string;
  branchModel: Contactus;
  isBranch: boolean = false;

  galleryForm: FormGroup;
  tempFile: any = null;
  updateMode: boolean = false;
  addminImage: boolean = true;
  loader: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private dbService: DbService,
    private dbRef: AngularFirestore,
    private stgRef: AngularFireStorage,
    private route: ActivatedRoute,
    private toast: ToastrService,
    private modalService: NgbModal,
    private snackbar: MatSnackBar


  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((value) => {
      this.imageId = value.imageId ?? null;
      this.getData(value.imageId ?? null);
    })
  }

  getData(imageId: string | null = null) {
    if(imageId === null) {
      this.isBranch = false;
      this.dbService.getGalleryImages();
      this.galleryImageSub = this.dbService.gallerySubject.subscribe((list) => {
        if (list != null) {
          this.galleryImageList = list;
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
        .collection(GALLERY_COLLECTION)
        .valueChanges()
        .subscribe((list) => {
          this.galleryImageList = list.map(e => e as ImagesModel)
        })
    }
  }


  openGalleryDialog(modalRef: TemplateRef<any>, sliderObj: ImagesModel | null = null) {
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


  initialForm(galleryObj: ImagesModel | null = null) {
    if (galleryObj === null) {
      this.updateMode = false;
      this.galleryForm = this.fb.group({
        title: ["", Validators.required],
        description: ["", Validators.required],
        imageUrl: [""],
        imageId: [this.dbRef.createId()],
        galleryStatus: [true],
        addedOn: [firebase.firestore.Timestamp.now()]
      });
    } else {
      this.updateMode = true;
      this.addminImage = false;
      this.galleryForm = this.fb.group({
        title: [galleryObj.title, Validators.required],
        description: [galleryObj.description, Validators.required],
        imageUrl: [galleryObj.imageUrl],
        imageId: [galleryObj.imageId],
        galleryStatus: [galleryObj.galleryStatus]
      })
    }
  }


  async uploadImage(form: FormGroup) {
    if(this.tempFile != null || this.updateMode) {
      this.loader = true;
      let galleryObj: ImagesModel = { ...form.value };
      if(this.tempFile instanceof File) {
        const file = this.tempFile;
        const FilePath = `images/${galleryObj.imageId}_${String(this.tempFile.name).toLowerCase().replace(/ /g, "_")}`;
        const FileRef = this.stgRef.ref(FilePath);
        await this.stgRef.upload(FilePath, file);
        galleryObj.imageUrl = await FileRef.getDownloadURL().toPromise();
      }

      let docRef: AngularFirestoreDocument<unknown> = null;
      docRef = this.dbRef.collection(GALLERY_COLLECTION).doc(galleryObj.imageId);

      docRef.set({
        ...galleryObj
      }, { merge: true })
        .then(() => {
          this.loader = false;
          this.modalService.dismissAll();
          this.snackbar.open("Image Updated Successfully", "", {
            duration: 2500,
            panelClass: ["alert", "alert-success"],
          });      
          }, error => {
          console.error(">>> error: ", error);
          this.loader = false;
          this.snackbar.open("Something went wrong", "", {
            duration: 2500,
            panelClass: ["alert", "alert-danger"],
          });        
        })

    } else {
      // this.toast.show("Please Select Image File", "");
      this.snackbar.open("Please Select Image File", "", {
        duration: 2500,
        panelClass: ["alert", "alert-danger"],
      }); 
    }
  }


  deleteItem(docId, url) {
    console.log(url);
    const modalRef = this.modalService.open(DeleteDialogComponent);
    modalRef.componentInstance.data = {
      message: 'gallery image'
    };

    modalRef.result.then(async (value) => {
      if(value === 1) {
         await this.stgRef.refFromURL(url).delete();
        this.dbRef.collection(GALLERY_COLLECTION).doc(docId)
          .delete()
          .then(
            () => {
              // this.toast.show("Gallery Image Deleted Successfully", "");
              this.snackbar.open("Gallery Image Deleted Successfully", "", {
                duration: 2500,
                panelClass: ["alert", "alert-danger"],
              }); 
            },
            (error) => {
              console.error(">>> error: ", error);
              // this.toast.show("Something Went Wrong", "");
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
    if(this.galleryImageSub !== undefined) {
      this.dbService.sliderSubject.next([]);
      this.galleryImageSub.unsubscribe();
    }
  }

}
