import { formatDate } from "@angular/common";
import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatDialogModule } from "@angular/material/dialog";

@Component({
  selector: "app-view-details-dialog",
  templateUrl: "./view-details-dialog.component.html",
  styleUrls: ["./view-details-dialog.component.scss"],
})
export class ViewDetailsDialogComponent implements OnInit {
  mainHeaders: string[];
  secondaryKeyName: string[] = [];
  timeStampArray: string[] = [
    "seconds",
    "nanoseconds",
    "createdOn",
    "addedOn",
    "scannedOn",
  ];
  secondaryHeaders = {};

  headNameKeys: string[];
  headName = {
    productTitle: "Product Name",
    videoTitle: "Video Title",
    newsTitle: "News Title",
    dealerId: "Dealer Id",
    usedBy: "Used By (User Id)",
    productDescription: "Product Description",
    videoDescription: "Video Description",
    newsDescription: "News Description",
    categoryDescription: "Category Description",
    videoUrl: "Url",
    categoryName: "Category Name",
    // pointsToBeEarned: "Points Earned",
    // howManyPointsNeeded: "Points Needed",
    // productQuantity: "Quantity",
    title: 'Title',
    notificationTitle: 'Title',
    notificationContent: 'Description',
    description: 'Description',
    supporterName: 'Supporter Name',
    supporterDescription: 'Supporter Description',
    addedOn: "Added On",
    createdOn: "Created On",
    // scannedOn: "Scanned On",
    active: "Status",
    sliderStatus: "Image Status",
  };

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {
    this.mainHeaders = Object.keys(this.data["obj"]);
    this.mainHeaders.forEach((key) => {
      if (this.data["obj"][key] != null) {
        if (
          typeof this.data["obj"][key] == "object" &&
          !this.timeStampArray.includes(key)
        ) {
          this.secondaryHeaders[key] = Object.keys(
            this.data["obj"][key]
          ).filter((x) => !this.timeStampArray.includes(x));
        }
      }
    });
    this.headNameKeys = Object.keys(this.headName);
    this.secondaryKeyName = Object.keys(this.secondaryHeaders);
    
  }

  getValue(key) {
    if (key == "createdOn" || key == "scannedOn" || key == "addedOn") {
      if (this.data["obj"][key] == null) {
        return "-";
      } else {
        return formatDate(
          this.data["obj"][key].toDate(),
          "dd-MM-yyyy hh:mm:ss aa",
          "en-us"
        );
      }
    } else if (key == "active" || key == "sliderStatus") {
      if(this.data["obj"][key]) {
        return 'Active';
      } else {
        return 'In-Active';
      }
    } else {
      return this.data["obj"][key];
    }
  }
}
