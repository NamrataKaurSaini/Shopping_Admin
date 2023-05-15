import { Component, OnDestroy, OnInit, TemplateRef} from '@angular/core';
import { MatDialog } from "@angular/material/dialog";
import { Service } from "src/app/classes/service";
import { DbService } from "src/app/services/db.service";
import { Subscription } from "rxjs";
import { AngularFirestore, AngularFirestoreDocument } from "@angular/fire/firestore";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DeleteDialogComponent } from "src/app/entryComponents/delete-dialog/delete-dialog.component";
import { CONTACT_COLLECTION, SERVICE_COLLECTION } from "src/app/utils";
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
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements OnInit {
  serviceList: Service[] = [];
  serviceSub: Subscription;
  serviceId: string;

  serviceForm: FormGroup;
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
      this.serviceId = value.serviceId ?? null;
      this.getData(value.serviceId ?? null);
    })
  }

  getData(serviceId: string | null = null) {
    if (serviceId === null) {
      this.isBranch = false;
      this.dbService. getServices();
      this.serviceSub = this.dbService.servicesSubject.subscribe((list) => {
        if (list != null) {
          this.serviceList = list;
        }
      });
    } else {
      this.isBranch = true;
      this.dbService.contactSubject.subscribe((data) => {
        if(data !== null) {    
          this.branchModel = data.find(x => x.contactId === serviceId);
        }
      });
      this.dbRef.collection(CONTACT_COLLECTION).doc(this.serviceId)
        .collection(SERVICE_COLLECTION)
        .valueChanges()
        .subscribe((list) => {
          this.serviceList = list.map(e => e as Service)
        })
    }
  }

  openServiceDialog(modalRef: TemplateRef<any>, serviceObj: Service | null = null) {
    this.modalService.open(modalRef);
    this.initialForm(serviceObj)
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

  initialForm(serviceModel: Service | null = null) {
    this.tempFile = null;
    if (serviceModel === null) {
      this.updateMode = false;
      this.serviceForm = this.fb.group({
        title: ["", Validators.required],
        description: ["", Validators.required],
        // imageUrl: [""],
        serviceId: [this.dbRef.createId()],
        serviceStatus: [true],
        addedOn: [firebase.firestore.Timestamp.now()],
      });
    } else {
      this.updateMode = true;
      this.addminImage = false;
      this.serviceForm = this.fb.group({
        title: [serviceModel.title, Validators.required],
        description: [serviceModel.description, Validators.required],
        // imageUrl: [serviceModel.imageUrl],
        serviceId: [serviceModel.serviceId],
        serviceStatus: [serviceModel.serviceStatus],
      })
    }
  }

  async uploadImage(form: FormGroup): Promise<void> {
    this.loader = true;
    let serviceObj: Service = { ...form.value };
    if(this.tempFile !== null) {
      const file = this.tempFile;
      const FilePath = `images${this.serviceId !== null ? "/" +this.serviceId :"" }/${serviceObj.serviceId}_${String(this.tempFile.name).toLowerCase().replace(/ /g, "_")}`;
      const FileRef = this.stgRef.ref(FilePath);
      await this.stgRef.upload(FilePath, file);
      serviceObj.imageUrl = await FileRef.getDownloadURL().toPromise();
    }

    let docRef: AngularFirestoreDocument<unknown> = null;
    if(this.serviceId === null) {
      docRef = this.dbRef.collection(SERVICE_COLLECTION).doc(serviceObj.serviceId);
    } else {
      docRef = this.dbRef.collection(CONTACT_COLLECTION).doc(this.serviceId)
      .collection(SERVICE_COLLECTION).doc(serviceObj.serviceId);
    }

    docRef.set({
      ...serviceObj
    }, { merge: true })
      .then(() => {
        this.loader = false;
        this.modalService.dismissAll();
        this.snackbar.open("Service Added/Updated Successfully", "", {
          duration: 2500,
          panelClass: ["alert", "alert-success"],
        });
      }, error => {
        console.error(">>> error: ", error);
        this.loader = false;
        this.snackbar.open("Something Went Wrong", "", {
          duration: 2500,
          panelClass: ["alert", "alert-success"],
        });
      })
  }

  changeImageMode() {
    this.addminImage = true;
  }

  deleteItem(docId) {
    const modalRef = this.modalService.open(DeleteDialogComponent);
    modalRef.componentInstance.data = {
      message: 'Service'
    };

    modalRef.result.then((value) => {
      if(value === 1) {
        this.dbRef.collection(SERVICE_COLLECTION).doc(docId)
          .delete()
          .then(
            () => {
              this.snackbar.open("Service Deleted Successfully", "", {
                duration: 2500,
                panelClass: ["alert", "alert-success"],
              });
            },
            (error) => {
              console.error(">>> error: ", error);
              this.snackbar.open("Something Went Wrong", "", {
                duration: 2500,
                panelClass: ["alert", "alert-success"],
              });
            }
          );
      }
    }, (error) => console.log(error))
  }

  viewDetails(prodObj) {
    
    this.dialog.open(ViewDetailsDialogComponent, {
      data: {
        title: "Service",
        obj: prodObj,
      },
      panelClass: ["col-12", "col-sm-4"],
    });
  }

  openLink(url) {
    window.open(url, "_blank");
  }

  ngOnDestroy() {
    this.dbService.servicesRetrieved = false;
    if(this.serviceSub !== undefined) {
      this.dbService.servicesSubject.next([]);
      this.serviceSub.unsubscribe();
    }
  }

}
