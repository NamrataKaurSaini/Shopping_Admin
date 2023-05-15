
import { Component, OnDestroy, OnInit, TemplateRef } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { DbService } from "src/app/services/db.service";
import { Subscription } from "rxjs";
import { AngularFirestore, AngularFirestoreDocument } from "@angular/fire/firestore";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DeleteDialogComponent } from "src/app/entryComponents/delete-dialog/delete-dialog.component";
import { CATEGORY_COLLECTION, CONTACT_COLLECTION} from "src/app/utils";
import { ViewDetailsDialogComponent } from "src/app/entryComponents/view-details-dialog/view-details-dialog.component";
import { ActivatedRoute } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import firebase from "firebase/app";
import { AngularFireStorage } from "@angular/fire/storage";
import { ModalDismissReasons, NgbDatepickerModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Contactus } from "src/app/classes/contactus";
import { filter } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import { category } from "src/app/classes/category";



@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit, OnDestroy {
 categoryId: string;
 categoryList:category[]= [];
 categorySub: Subscription;

 categoryForm: FormGroup;
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
      this.categoryId = value.categoryId ?? null;
      this.getData(value.categoryId ?? null);
    })
  }

  getData(categoryId: string | null = null) {
    if (categoryId === null) {
      this.isBranch = false;
      this.dbService.getCategory() ;
      this.categorySub = this.dbService.categorySubject.subscribe((list) => {
        if (list != null) {
          this.categoryList = list;
        }
      });
    } else {
      this.isBranch = true;
      this.dbService.contactSubject.subscribe((data) => {
        if(data !== null) {    
          this.branchModel = data.find(x => x.contactId === categoryId);
        }
      });
      this.dbRef.collection(CONTACT_COLLECTION).doc(this.categoryId)
        .collection(  CATEGORY_COLLECTION)
        .valueChanges()
        .subscribe((list) => {
          this.categoryList = list.map(e => e as category)
        })
    }
  }

  openCategoryDialog(modalRef: TemplateRef<any>, categoryObj: category | null = null) {
    this.modalService.open(modalRef);
    this.initialForm(categoryObj)
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

  initialForm(categoryModel: category | null = null) {
    this.tempFile = null;
    if (categoryModel === null) {
      this.updateMode = false;
      this.categoryForm = this.fb.group({
        title: ["", Validators.required],
        description: ["", Validators.required],
        imageUrl: [""],
        categoryId: [this.dbRef.createId()],
        categoryStatus: [true],
        addedOn: [firebase.firestore.Timestamp.now()],
      });
    } else {
      this.updateMode = true;
      this.addminImage = false;
      this.categoryForm = this.fb.group({
        title: [categoryModel.title, Validators.required],
        description: [categoryModel.description, Validators.required],
        imageUrl: [categoryModel.imageUrl],
        categoryId: [categoryModel.categoryId],
        categoryStatus: [categoryModel.categoryStatus],
      })
    }
  }

  async uploadImage(form: FormGroup): Promise<void> {
    this.loader = true;
    let categoryObj: category = { ...form.value };
    if(this.tempFile !== null) {
      const file = this.tempFile;
      const FilePath = `images${this.categoryId !== null ? "/" +this.categoryId :"" }/${categoryObj.categoryId}_${String(this.tempFile.name).toLowerCase().replace(/ /g, "_")}`;
      const FileRef = this.stgRef.ref(FilePath);
      await this.stgRef.upload(FilePath, file);
      categoryObj.imageUrl = await FileRef.getDownloadURL().toPromise();
    }

    let docRef: AngularFirestoreDocument<unknown> = null;
    if(this.categoryId === null) {
      docRef = this.dbRef.collection(  CATEGORY_COLLECTION).doc(categoryObj.categoryId);
    } else {
      docRef = this.dbRef.collection(CONTACT_COLLECTION).doc(this.categoryId)
      .collection(  CATEGORY_COLLECTION).doc(categoryObj.categoryId);
    }

    docRef.set({
      ...categoryObj
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
        this.dbRef.collection(  CATEGORY_COLLECTION).doc(docId)
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
    this.dbService.categoryRetrieved = false;
    if(this.categorySub !== undefined) {
      this.dbService.categorySubject.next([]);
      this.categorySub.unsubscribe();
    }
  }
}
