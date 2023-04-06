import { Component, OnInit } from '@angular/core';
import { MatDialog } from "@angular/material/dialog"
import { MatSnackBar } from "@angular/material/snack-bar"
import { Enqueries } from 'src/app/classes/enqueries';
import { DeleteDialogComponent } from "src/app/entryComponents/delete-dialog/delete-dialog.component";
import { DbService } from "src/app/services/db.service";
import { ENQUERIES_COLLECTION } from 'src/app/utils';
import { Subscription } from "rxjs";
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { formatDate } from "@angular/common";
import { AngularFirestore } from '@angular/fire/firestore';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from "ngx-toastr";


@Component({
  selector: 'app-enqueries',
  templateUrl: './enqueries.component.html',
  styleUrls: ['./enqueries.component.scss']
})
export class EnqueriesComponent {

  enqueriesListSub: Subscription;
  enqueriesList: Enqueries[];

  constructor(
    private dialog: MatDialog,
    private dbService: DbService,
    private dbRef: AngularFirestore,
    private snackbar: MatSnackBar,
    private modalService: NgbModal,
    private toast: ToastrService,

  ) { }

  ngOnInit(): void {
    this.dbService.getEnqueries();
    this.enqueriesList = [];
    this.enqueriesListSub = this.dbService.enqueriesSubject.subscribe((list) => {
      if (list != null) {
        this.enqueriesList = list;
        console.log(this.enqueriesList)
      }
    });
  }

  deleteItem(docId) {
    const modalRef = this.modalService.open(DeleteDialogComponent);
    modalRef.componentInstance.data = {
      message: 'Enquerie'
    };

    modalRef.result.then((value) => {
      if(value === 1) {
        this.dbRef.collection(ENQUERIES_COLLECTION).doc(docId)
          .delete()
          .then(
            () => {
              // this.toast.show("Enquerie Deleted Successfully", "");
              this.snackbar.open("Enquerie Deleted Successfully", "", {
                duration: 2500,
                panelClass: ["alert", "alert-danger"],
              });
            },
            (error) => {
              console.error(">>> error: ", error);
              this.snackbar.open("Enquerie Deleted Successfully", "", {
                duration: 2500,
                panelClass: ["alert", "alert-danger"],
              });
            }
          );
      }
    }, (error) => console.log(error))
  }

  exportData() {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.enqueriesList.map((code, idx) => ({
      'Sr. No': idx + 1,
      'Request Id': code.enqueryId,
      'User Name': code.name || "",
      'User Email': code.email || "",
      'User Mobile': code.phone || "",
      'Request Date': code.date.toDate().toLocaleString()
    })));
    const workbook: XLSX.WorkBook = { Sheets: { 'enqueries': worksheet }, SheetNames: ['enqueries'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    FileSaver.saveAs(data, `enqueries_${formatDate(new Date(), 'ddMMyyyyHHmmss', 'en-US')}.xlsx`);
  }

}

