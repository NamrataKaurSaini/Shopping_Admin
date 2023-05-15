import { Component, OnInit } from '@angular/core';
import { MatDialog } from "@angular/material/dialog"
import { MatSnackBar } from "@angular/material/snack-bar"
import { Queries } from "src/app/classes/queries";
import { DeleteDialogComponent } from "src/app/entryComponents/delete-dialog/delete-dialog.component";
import { DbService } from "src/app/services/db.service";
import {  QUERIES_COLLECTION } from "src/app/utils";
import { Subscription } from "rxjs";
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { formatDate } from "@angular/common";
import { AngularFirestore } from '@angular/fire/firestore';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from "ngx-toastr";



@Component({
  selector: 'app-queries',
  templateUrl: './queries.component.html',
  styleUrls: ['./queries.component.scss']
})
export class QueriesComponent implements OnInit {
  queriesListSub: Subscription;
  queriesList: Queries[];

  constructor(
    private dialog: MatDialog,
    private dbService: DbService,
    private dbRef: AngularFirestore,
    private snackbar: MatSnackBar,
    private modalService: NgbModal,
    private toast: ToastrService,

  ) { }

  ngOnInit(): void {
    this.dbService.getQueries();
    this.queriesList = [];
    this.queriesListSub = this.dbService.queriesSubject.subscribe((list) => {
      if (list != null) {
        this.queriesList = list;
      }
    });
  }

  deleteItem(docId) {
    const modalRef = this.modalService.open(DeleteDialogComponent);
    modalRef.componentInstance.data = {
      message: 'Querie'
    };

    modalRef.result.then((value) => {
      if(value === 1) {
        this.dbRef.collection(QUERIES_COLLECTION).doc(docId)
          .delete()
          .then(
            () => {
              this.snackbar.open("Querie Deleted Successfully", "", {
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

  exportData() {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.queriesList.map((code, idx) => ({
      'Sr. No': idx + 1,
      'Request Id': code.queryId,
      'User Name': code.name || "",
      'User Email': code.email || "",
      // 'User Mobile': code.phone || "",
      'User Query': code.query || "",
      'Request Date': code.date.toDate().toLocaleString()
    })));
    const workbook: XLSX.WorkBook = { Sheets: { 'queries': worksheet }, SheetNames: ['queries'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    FileSaver.saveAs(data, `queries_${formatDate(new Date(), 'ddMMyyyyHHmmss', 'en-US')}.xlsx`);
  }

}
